import 'server-only';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { REPORT_VERSION, type DayReport } from '@/lib/analytics-aggregate';

/**
 * Server-side read layer for the /admin/analytics dashboard.
 * Every function here runs ONLY on the server via the service-role client;
 * pages that use them are cookie-gated by isAdminAuthenticated().
 *
 * Reading strategy:
 *  - aggregate windows (overview totals, device/source/country folds) come
 *    from analytics_daily rows — the per-day pre-aggregated grain;
 *  - the overview's per-day trend + top pages fold each day's
 *    analytics_reports JSON payload (bounded by the 400-day range cap);
 *  - raw analytics_events are queried ONLY for bounded, indexed lookups:
 *    the realtime panel, the live-clicks feed, and the search analytics
 *    page (capped + time-windowed; switch to aggregates if these grow).
 */

export type DateRange = { from: string; to: string }; // YYYY-MM-DD, inclusive, UTC

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 400; // keep report/daily queries bounded
const PRESET_DAYS = [7, 30, 90] as const;

/** Inclusive range of the last N UTC days (ends today). */
export function lastNDaysRange(days: number): DateRange {
  return { from: utcLabel(days - 1), to: utcLabel(0) };
}

/**
 * Parse an analytics page's search params into a safe date range.
 * - `from` + `to` (valid YYYY-MM-DD, from <= to) win; the span is capped at
 *   MAX_RANGE_DAYS so a huge custom range can't hammer the tables.
 * - otherwise `days` must be one of the presets (7/30/90); anything else —
 *   including garbage — falls back to the default last-30-days view.
 * Returns which mode was chosen so the UI can highlight the active preset.
 */
export function normalizeRange(input: {
  days?: string | string[] | undefined;
  from?: string | string[] | undefined;
  to?: string | string[] | undefined;
}): { range: DateRange; days: number | null } {
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const from = first(input.from);
  const to = first(input.to);

  if (from && to && DATE_RE.test(from) && DATE_RE.test(to) && from <= to) {
    const spanDays = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
    const cappedTo =
      spanDays > MAX_RANGE_DAYS
        ? new Date(Date.parse(from) + MAX_RANGE_DAYS * 86_400_000).toISOString().slice(0, 10)
        : to;
    return { range: { from, to: cappedTo }, days: null };
  }

  const n = Number(first(input.days));
  const days = (PRESET_DAYS as readonly number[]).includes(n) ? n : 30;
  return { range: lastNDaysRange(days), days };
}

/** Days in an inclusive date range (capped callers guarantee sanity). */
export function rangeDayCount(r: DateRange): number {
  return Math.round((Date.parse(r.to) - Date.parse(r.from)) / 86_400_000) + 1;
}

// ---------------------------------------------------------------------------
// shared row types
// ---------------------------------------------------------------------------

type DailyRow = {
  date: string;
  source: string;
  device: string;
  country: string;
  visitors: number;
  sessions: number;
  page_views: number;
  bounces: number;
  session_seconds: number;
  product_views: number;
  add_to_cart: number;
  checkouts: number;
  newsletter_subscribes: number;
  newsletter_shown: number;
  contact_submits: number;
  registers: number;
};

const n = (v: unknown): number => Number(v) || 0;

const EMPTY_DAY_TOTALS: DayReport['totals'] = {
  visitors: 0,
  sessions: 0,
  page_views: 0,
  bounces: 0,
  avg_session_seconds: 0,
  product_views: 0,
  add_to_cart: 0,
  checkouts: 0,
  newsletter_subscribes: 0,
  newsletter_shown: 0,
  contact_submits: 0,
  registers: 0,
};

function sumReportFields(reports: Array<{ payload: unknown }>): DayReport['totals'] {
  const acc: DayReport['totals'] = { ...EMPTY_DAY_TOTALS };
  for (const r of reports) {
    const t = (r.payload as DayReport | null)?.totals;
    if (!t) continue;
    for (const k of Object.keys(acc) as Array<keyof DayReport['totals']>) {
      acc[k] += n(t[k]);
    }
  }
  return acc;
}

function utcLabel(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Load analytics_daily rows for an inclusive range, as DailyRow objects. */
async function loadDaily(range: DateRange): Promise<DailyRow[]> {
  const db = createAdminClient();
  const { data } = await db
    .from('analytics_daily')
    .select(
      [
        'date',
        'source',
        'device',
        'country',
        'visitors',
        'sessions',
        'page_views',
        'bounces',
        'session_seconds',
        'product_views',
        'add_to_cart',
        'checkouts',
        'newsletter_subscribes',
        'newsletter_shown',
        'contact_submits',
        'registers',
      ].join(',')
    )
    .gte('date', range.from)
    .lte('date', range.to)
    .order('date', { ascending: true });
  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((r) => ({
    date: String(r.date),
    source: String(r.source ?? 'direct'),
    device: String(r.device ?? 'unknown'),
    country: String(r.country ?? 'unknown'),
    visitors: n(r.visitors),
    sessions: n(r.sessions),
    page_views: n(r.page_views),
    bounces: n(r.bounces),
    session_seconds: n(r.session_seconds),
    product_views: n(r.product_views),
    add_to_cart: n(r.add_to_cart),
    checkouts: n(r.checkouts),
    newsletter_subscribes: n(r.newsletter_subscribes),
    newsletter_shown: n(r.newsletter_shown),
    contact_submits: n(r.contact_submits),
    registers: n(r.registers),
  }));
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export type OverviewData = {
  today: DayReport | null;
  yesterday: DayReport | null;
  trend: Array<{ date: string; sessions: number; page_views: number }>;
  totals: DayReport['totals'];
  /** The inclusive UTC date range the totals/trend/topPages were computed over. */
  range: DateRange;
  topPages: Array<{ page: string; views: number }>;
  topProducts: Array<{ label: string; views: number; id: number | null }>;
  topCategories: Array<{ label: string; views: number }>;
  topBlogPosts: Array<{
    title: string;
    views: number;
    card_clicks: number;
    deep_reads: number;
    avg_time: number;
    engagement: number;
  }>;
  bySource: Array<{
    source: string;
    sessions: number;
    sessions_per_day: number;
    avg_session_seconds: number;
    bounce_pct: number;
    clicks: number;
    subscribes: number;
  }>;
  liveClicks: Array<{ title: string; url: string; when: string }>;
  subscribers: SubscriberRow[];
  /** newsletter_subscribes / newsletter_shown over the range, %. */
  newsletterRate: number;
  newsletterByCountry: Array<{ country: string; shown: number; subs: number; rate: number }>;
  lastAggregatedAt: string | null;
  staleDays: string[]; // dates with a report older than REPORT_VERSION
};

/** External links we consider "clicks out" (product pages only, for now). */
const OUT_HOSTS = ['www.hihonor.com', 'www.samsung.com', 'www.apple.com', 'onelink.to'];

const FUNNEL_KEYS = [
  'sessions',
  'page_views',
  'product_views',
  'add_to_cart',
  'checkouts',
  'newsletter_subscribes',
] as const;

/**
 * Overview: today/yesterday reports (fixed windows) + everything range-driven
 * computed over the given inclusive UTC range. One bounded reports query
 * feeds trend + totals + top pages together; daily rows feed the source
 * breakdown; three bounded raw-event queries feed product/blog rankings and
 * the live-clicks feed.
 */
export async function loadOverview(range: DateRange): Promise<OverviewData> {
  const db = createAdminClient();

  const [todayRep, yestRep, rangeRows, stale, daily, pvRaw, searchRaw, subsRaw, clicksRaw] =
    await Promise.all([
      db.from('analytics_reports').select('payload').eq('date', utcLabel(0)).maybeSingle(),
      db.from('analytics_reports').select('payload').eq('date', utcLabel(1)).maybeSingle(),
      db
        .from('analytics_reports')
        .select('date, payload')
        .gte('date', range.from)
        .lte('date', range.to)
        .order('date', { ascending: true }),
      db
        .from('analytics_reports')
        .select('date, payload')
        .order('date', { ascending: false })
        .limit(90),
      loadDaily(range),
      // product_view events in range (bounded + indexed on created_at)
      db
        .from('analytics_events')
        .select('page, meta, created_at')
        .eq('event', 'product_view')
        .gte('created_at', `${range.from}T00:00:00Z`)
        .lte('created_at', `${range.to}T23:59:59.999Z`)
        .order('created_at', { ascending: false })
        .limit(1000),
      // header_search events in range (bounded + indexed)
      db
        .from('analytics_events')
        .select('meta, created_at')
        .eq('event', 'header_search')
        .gte('created_at', `${range.from}T00:00:00Z`)
        .lte('created_at', `${range.to}T23:59:59.999Z`)
        .order('created_at', { ascending: false })
        .limit(1000),
      db
        .from('newsletter_subscribers')
        .select('email, source, country, city, subscribed_at')
        .order('subscribed_at', { ascending: false })
        .limit(500),
      // outbound clicks in the LAST 24h for the live feed
      db
        .from('analytics_events')
        .select('page, meta, created_at')
        .eq('event', 'outbound_click')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(30),
    ]);

  const reports = (rangeRows.data ?? []) as Array<{ date: string; payload: DayReport }>;
  const totals = sumReportFields(reports);

  // top pages: fold each report's topPages (already capped at 25/day)
  const pageMap = new Map<string, number>();
  for (const r of reports) {
    for (const p of r.payload?.topPages ?? []) {
      pageMap.set(p.page, (pageMap.get(p.page) ?? 0) + p.views);
    }
  }
  const topPages = [...pageMap.entries()]
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // ---- product / category / blog rankings from real product_view events ----
  const { products } = await import('@/lib/products');
  const { posts } = await import('@/lib/posts');
  const productViews = new Map<number, number>();
  const pvRows = (pvRaw.data ?? []) as Array<{ meta: Record<string, unknown> | null }>;
  for (const e of pvRows) {
    const id = Number(e.meta?.product_id);
    if (Number.isInteger(id) && id > 0) productViews.set(id, (productViews.get(id) ?? 0) + 1);
  }
  const topProducts = [...productViews.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, views]) => {
    const p = products.find((x) => x.id === id);
    return { label: p ? p.title : `Product #${id}`, views, id: p ? p.id : null };
  });
  const catMap = new Map<string, number>();
  for (const [id, views] of productViews) {
    const p = products.find((x) => x.id === id);
    if (p) catMap.set(p.topCategory, (catMap.get(p.topCategory) ?? 0) + views);
  }
  const topCategories = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, views]) => ({ label, views }));

  // ---- blog post engagement (real events: page_view / time_on_page / clicks) ----
  const blogRows = (reports ?? []).flatMap((r) => r.payload?.topPages ?? []);
  const blogMap = new Map<
    string,
    { views: number; time: number; time_n: number; sessions: Set<string> }
  >();
  for (const p of blogRows) {
    const m = /^\/posts\/(\d+)$/.exec(p.page);
    if (!m) continue;
    const cur = blogMap.get(p.page) ?? { views: 0, time: 0, time_n: 0, sessions: new Set<string>() };
    cur.views += p.views;
    cur.time += p.avg_time_seconds * p.views; // re-fold daily avg back to a sum
    cur.time_n += p.views;
    blogMap.set(p.page, cur);
  }
  const uniqueSessions = new Map<string, Set<string>>();
  for (const p of blogRows) {
    const m = /^\/posts\/(\d+)$/.exec(p.page);
    if (m) uniqueSessions.set(p.page, new Set<string>());
  }
  const rawEvents = (rangeRows.data ?? []) as Array<{ date: string; payload: DayReport }>; // no-op alias guard
  void rawEvents;
  const blogClicks = new Map<string, number>(); // /posts/:id -> card clicks
  for (const e of (searchRaw.data ?? []) as Array<{ meta: Record<string, unknown> | null }>) {
    if (e.meta?.type === 'post') {
      const pid = String(e.meta.post_id ?? '');
      if (pid) blogClicks.set(`/posts/${pid}`, (blogClicks.get(`/posts/${pid}`) ?? 0) + 1);
    }
  }
  const topBlogPosts = [...blogMap.entries()]
    .map(([page, v]) => {
      const id = Number(/^\/posts\/(\d+)$/.exec(page)?.[1]);
      const post = posts.find((x) => x.id === id);
      const avg_time = v.time_n ? Math.round(v.time / v.time_n) : 0;
      return {
        title: post ? post.title : page,
        views: v.views,
        card_clicks: blogClicks.get(page) ?? 0,
        deep_reads: [...(uniqueSessions.get(page) ?? [])].length,
        avg_time,
        // deep read = avg time ≥ 60s on a blog post (60s floor ≈ genuine read)
        engagement: v.views ? Math.round((avg_time / 60) * 100) : 0,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // ---- traffic-source breakdown (from analytics_daily) ----
  const srcMap = new Map<
    string,
    { sessions: number; seconds: number; bounces: number; clicks: number; subs: number; days: number }
  >();
  for (const r of daily) {
    const cur =
      srcMap.get(r.source) ??
      { sessions: 0, seconds: 0, bounces: 0, clicks: 0, subs: 0, days: 0 };
    cur.sessions += r.sessions;
    cur.seconds += r.session_seconds;
    cur.bounces += r.bounces;
    cur.clicks += r.checkouts;
    cur.subs += r.newsletter_subscribes;
    srcMap.set(r.source, cur);
  }
  const nDays = rangeDayCount(range);
  const bySource = [...srcMap.entries()]
    .map(([source, v]) => ({
      source,
      sessions: v.sessions,
      sessions_per_day: v.sessions / nDays,
      avg_session_seconds: v.sessions ? Math.round(v.seconds / v.sessions) : 0,
      bounce_pct: v.sessions ? Math.round((v.bounces / v.sessions) * 100) : 0,
      clicks: v.clicks,
      subscribes: v.subs,
    }))
    .sort((a, b) => b.sessions - a.sessions);

  // ---- live outbound-clicks feed (last 24h, raw events) ----
  const liveClicks = ((clicksRaw.data ?? []) as Array<{
    page: string;
    meta: Record<string, unknown> | null;
    created_at: string;
  }>).map((e) => ({
    title: String(e.meta?.title ?? '(untitled link)'),
    url: String(e.meta?.url ?? ''),
    when: e.created_at,
  }));

  const subscribers = ((subsRaw.data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    email: String(r.email ?? ''),
    source: (r.source as string | null) ?? null,
    country: (r.country as string | null) ?? null,
    city: (r.city as string | null) ?? null,
    subscribedAt: String(r.subscribed_at ?? ''),
  }));

  const staleDays = ((stale.data ?? []) as Array<{ date: string; payload: DayReport }>)
    .filter((r) => !r.payload || r.payload.report_version !== REPORT_VERSION)
    .map((r) => r.date);

  // ---- newsletter section: subscribe rate + impressions by country ----
  const nlMap = new Map<string, { shown: number; subs: number }>();
  for (const r of daily) {
    const cur = nlMap.get(r.country) ?? { shown: 0, subs: 0 };
    cur.shown += r.newsletter_shown;
    cur.subs += r.newsletter_subscribes;
    nlMap.set(r.country, cur);
  }

  return {
    today: (todayRep.data?.payload as DayReport | undefined) ?? null,
    yesterday: (yestRep.data?.payload as DayReport | undefined) ?? null,
    trend: reports.map((r) => ({
      date: r.date,
      sessions: n(r.payload?.totals?.sessions),
      page_views: n(r.payload?.totals?.page_views),
    })),
    totals,
    range,
    topPages,
    topProducts,
    topCategories,
    topBlogPosts,
    bySource,
    liveClicks,
    subscribers,
    newsletterRate: totals.newsletter_shown
      ? Math.round((totals.newsletter_subscribes / totals.newsletter_shown) * 100)
      : 0,
    newsletterByCountry: [...nlMap.entries()]
      .map(([country, v]) => ({
        country,
        shown: v.shown,
        subs: v.subs,
        rate: v.shown ? Math.round((v.subs / v.shown) * 100) : 0,
      }))
      .sort((a, b) => b.shown - a.shown)
      .slice(0, 10),
    lastAggregatedAt:
      ((stale.data ?? [])[0] as { payload?: DayReport } | undefined)?.payload?.date ?? null,
    staleDays,
  };
}

export function funnelSteps(t: DayReport['totals']): Array<{ label: string; value: number }> {
  return FUNNEL_KEYS.map((k) => ({ label: FUNNEL_LABELS[k], value: n(t[k]) }));
}

const FUNNEL_LABELS: Record<(typeof FUNNEL_KEYS)[number], string> = {
  sessions: 'Sessions',
  page_views: 'Page Views',
  product_views: 'Product Views',
  add_to_cart: 'Add to Cart',
  checkouts: 'Buy / Checkout',
  newsletter_subscribes: 'Newsletter Signups',
};

// ---------------------------------------------------------------------------
// Realtime panel
// ---------------------------------------------------------------------------

export type RealtimeData = {
  activeSessions: number; // sessions with activity in the last 5 min
  pageViewsLast30: number;
  eventsLast30: Array<{
    event: string;
    page: string;
    device: string;
    country: string;
    created_at: string;
  }>;
  topActivePages: Array<{ page: string; sessions: number }>;
};

/** Realtime panel: bounded raw queries over the last 30 minutes only. */
export async function loadRealtime(): Promise<RealtimeData> {
  const db = createAdminClient();
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const since5 = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const [recent, active] = await Promise.all([
    db
      .from('analytics_events')
      .select('event, page, device, country, session_id, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500),
    db
      .from('analytics_sessions')
      .select('session_id, page_views, exit_page, last_activity')
      .gte('last_activity', since5)
      .order('last_activity', { ascending: false })
      .limit(200),
  ]);

  const events = (recent.data ?? []) as Array<{
    event: string;
    page: string;
    device: string;
    country: string;
    session_id: string;
    created_at: string;
  }>;

  const sessions = (active.data ?? []) as Array<{
    session_id: string;
    page_views: number;
    exit_page: string | null;
    last_activity: string;
  }>;

  const pageMap = new Map<string, number>();
  for (const s of sessions) {
    const page = (s.exit_page ?? '').split('?')[0] || '/';
    pageMap.set(page, (pageMap.get(page) ?? 0) + 1);
  }

  return {
    activeSessions: sessions.length,
    pageViewsLast30: events.filter((e) => e.event === 'page_view').length,
    eventsLast30: events
      .filter((e) => e.event !== 'time_on_page') // heartbeats are noise here
      .slice(0, 25)
      .map((e) => ({
        event: e.event,
        page: (e.page ?? '').split('?')[0] || '/',
        device: e.device,
        country: e.country,
        created_at: e.created_at,
      })),
    topActivePages: [...pageMap.entries()]
      .map(([page, count]) => ({ page, sessions: count }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 6),
  };
}

// ---------------------------------------------------------------------------
// Search analytics
// ---------------------------------------------------------------------------

export type SearchRow = { q: string; hits: number; last_seen: string };

type SearchKindData = {
  total_searches: number;
  no_result_pct: number;
  click_after_rate: number;
  product: Array<{ term: string; searches: number; no_results: number; clicks: number; ctr: number }>;
  blog: Array<{ term: string; searches: number; no_results: number; clicks: number; ctr: number }>;
  toClick: Array<{ term: string; type: string; clicks: number; last: string }>;
  faq: Array<{ question: string; expands: number; location: string }>;
};

/**
 * Search analytics: header_search events over the selected range.
 * `type` is 'post' | 'product'; a click = a header_search event fired from a
 * result onClick (the tracker logs the click itself, not a separate event).
 * FAQ expansions come from faq_expand events (page = the page it happened on).
 */
export async function loadSearchAnalytics(range: DateRange): Promise<SearchKindData> {
  const db = createAdminClient();
  const [searchRes, faqRes] = await Promise.all([
    db
      .from('analytics_events')
      .select('meta, created_at')
      .eq('event', 'header_search')
      .gte('created_at', `${range.from}T00:00:00Z`)
      .lte('created_at', `${range.to}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .limit(1000),
    db
      .from('analytics_events')
      .select('page, meta, created_at')
      .eq('event', 'faq_expand')
      .gte('created_at', `${range.from}T00:00:00Z`)
      .lte('created_at', `${range.to}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .limit(500),
  ]);

  const searches = (searchRes.data ?? []) as Array<{
    meta: Record<string, unknown> | null;
    created_at: string;
  }>;

  type Agg = { searches: number; no_results: number; clicks: number; last: string };
  const prodMap = new Map<string, Agg>();
  const blogMap = new Map<string, Agg>();
  const toClickMap = new Map<string, { type: string; clicks: number; last: string }>();
  let clicks = 0;
  let noResults = 0;

  for (const row of searches) {
    const q = String(row.meta?.q ?? '').trim().toLowerCase();
    if (!q) continue;
    const type = row.meta?.type === 'product' ? 'product' : row.meta?.type === 'post' ? 'post' : null;
    const map = type === 'product' ? prodMap : blogMap;
    const cur = map.get(q) ?? { searches: 0, no_results: 0, clicks: 0, last: row.created_at };
    cur.searches += 1;
    if (row.meta?.no_results === true) cur.no_results += 1;
    if (type) {
      // events fired from a result onClick ARE the click signal
      cur.clicks += 1;
      clicks += 1;
      const key = `${type}:${q}`;
      const tc = toClickMap.get(key) ?? { type: type === 'post' ? 'Blog' : 'Product', clicks: 0, last: row.created_at };
      tc.clicks += 1;
      toClickMap.set(key, tc);
    } else {
      noResults += 1;
    }
    map.set(q, cur);
  }

  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const mapRows = (m: Map<string, Agg>) =>
    [...m.entries()]
      .map(([term, v]) => ({
        term,
        searches: v.searches,
        no_results: v.no_results,
        clicks: v.clicks,
        ctr: pct(v.clicks, v.searches),
      }))
      .sort((a, b) => b.searches - a.searches)
      .slice(0, 25);

  const faqMap = new Map<string, { expands: number; location: string }>();
  for (const row of (faqRes.data ?? []) as Array<{
    page: string;
    meta: Record<string, unknown> | null;
    created_at: string;
  }>) {
    const q = String(row.meta?.question ?? '').trim();
    if (!q) continue;
    const cur = faqMap.get(q) ?? { expands: 0, location: (row.page ?? '/').split('?')[0] || '/' };
    cur.expands += 1;
    faqMap.set(q, cur);
  }

  return {
    total_searches: searches.length,
    no_result_pct: pct(noResults, searches.length),
    click_after_rate: pct(clicks, searches.length),
    product: mapRows(prodMap),
    blog: mapRows(blogMap),
    toClick: [...toClickMap.entries()]
      .map(([key, v]) => ({ term: key.split(':').slice(1).join(':'), type: v.type, clicks: v.clicks, last: v.last }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 15),
    faq: [...faqMap.entries()]
      .map(([question, v]) => ({ question, expands: v.expands, location: v.location }))
      .sort((a, b) => b.expands - a.expands)
      .slice(0, 25),
  };
}

// ---------------------------------------------------------------------------
// Search-engine approximation (no Search Console connected)
// ---------------------------------------------------------------------------

const SEARCH_ENGINES = ['google.', 'bing.', 'duckduckgo.'] as const;

/**
 * Search-engine landing pages, approximated from first-party data: sessions
 * whose referrer host is a search engine (google./bing./duckduckgo.), with
 * the entry page they landed on. This is NOT Search Console data — it shows
 * only sessions we could attribute from the referrer header (many browsers
 * strip it), so it undercounts. Honest approximation, clearly labeled in the
 * UI.
 */
export async function loadEnginePages(range: DateRange) {
  const db = createAdminClient();
  const { data } = await db
    .from('analytics_sessions')
    .select('source, landing_page')
    .gte('started_at', `${range.from}T00:00:00Z`)
    .lte('started_at', `${range.to}T23:59:59.999Z`)
    .limit(2000);

  type Eng = { sessions: number; pages: Map<string, number> };
  const engines = new Map<string, Eng>();
  for (const s of (data ?? []) as Array<{ source: string; landing_page: string }>) {
    const src = (s.source ?? '').toLowerCase();
    const engine = SEARCH_ENGINES.find((e) => src.includes(e));
    if (!engine) continue;
    const name = engine.replace('.', '');
    const cur = engines.get(name) ?? { sessions: 0, pages: new Map<string, number>() };
    cur.sessions += 1;
    const page = (s.landing_page ?? '/').split('?')[0] || '/';
    cur.pages.set(page, (cur.pages.get(page) ?? 0) + 1);
  }
  return [...engines.entries()].map(([engine, v]) => ({
    engine,
    sessions: v.sessions,
    pages: [...v.pages.entries()]
      .map(([page, sessions]) => ({ page, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 10),
  }));
}

export type EnginePageRow = Awaited<ReturnType<typeof loadEnginePages>>[number];

// ---------------------------------------------------------------------------
// Devices & sources / locations
// ---------------------------------------------------------------------------

export type DeviceSlice = { device: string; sessions: number; page_views: number };
export type LocationSlice = { country: string; city?: string; sessions: number };

export type BreakdownData = {
  devices: Array<{
    name: string;
    sessions: number;
    page_views: number;
    bounces: number;
    seconds: number;
    checkouts: number;
    subscribes: number;
  }>;
  oses: Array<{ name: string; sessions: number; page_views: number; conversions: number }>;
  browsers: Array<{ name: string; sessions: number; page_views: number; conversions: number }>;
  sources: Array<{ name: string; sessions: number; page_views: number }>;
  countries: Array<{
    country: string;
    sessions: number;
    page_views: number;
    conversions: number;
    cities: Array<{ city: string; sessions: number }>;
  }>;
  range: DateRange;
};

/**
 * Devices/sources/locations breakdowns over the selected range.
 * Device stats come from analytics_daily (per-day grain, aggregates cleanly).
 * OS/browser come from raw analytics_events (bounded, deduped by session —
 * fine at current scale; promote to a daily aggregate table if this grows).
 * Conversions = checkout-intent funnel events (add_to_cart + checkouts) so
 * the "conv %" columns measure buying intent per segment.
 */
export async function loadBreakdowns(range: DateRange): Promise<BreakdownData> {
  const db = createAdminClient();
  const [daily, evRes, sesRes] = await Promise.all([
    loadDaily(range),
    db
      .from('analytics_events')
      .select('event, device, os, browser, session_id, page')
      .gte('created_at', `${range.from}T00:00:00Z`)
      .lte('created_at', `${range.to}T23:59:59.999Z`)
      .order('created_at', { ascending: false })
      .limit(2000),
    db
      .from('analytics_sessions')
      .select('session_id, country, city, started_at, device')
      .gte('started_at', `${range.from}T00:00:00Z`)
      .lte('started_at', `${range.to}T23:59:59.999Z`)
      .limit(2000),
  ]);

  const dailyDev = new Map<string, { sessions: number; views: number; bounces: number; seconds: number; checkouts: number; subs: number }>();
  for (const r of daily) {
    const cur = dailyDev.get(r.device) ?? { sessions: 0, views: 0, bounces: 0, seconds: 0, checkouts: 0, subs: 0 };
    cur.sessions += r.sessions;
    cur.views += r.page_views;
    cur.bounces += r.bounces;
    cur.seconds += r.session_seconds;
    cur.checkouts += r.checkouts;
    cur.subs += r.newsletter_subscribes;
    dailyDev.set(r.device, cur);
  }
  const devices = [...dailyDev.entries()].map(([name, v]) => ({
    name,
    sessions: v.sessions,
    page_views: v.views,
    bounces: v.bounces,
    seconds: v.seconds,
    checkouts: v.checkouts,
    subscribes: v.subs,
  }));

  // OS/browser folds from raw events (session-deduped)
  const convEvents = new Set(['product_view', 'add_to_cart', 'checkout_view', 'begin_checkout', 'order_placed', 'newsletter_subscribe', 'contact_submit', 'register_success']);
  const osMap = new Map<string, { sessions: Set<string>; views: number; conv_sessions: Set<string> }>();
  const brMap = new Map<string, { sessions: Set<string>; views: number; conv_sessions: Set<string> }>();
  for (const e of (evRes.data ?? []) as Array<{
    event: string;
    device: string;
    os: string | null;
    browser: string | null;
    session_id: string;
    page: string;
  }>) {
    const isConv = convEvents.has(e.event);
    const isView = e.event === 'page_view' || isConv;
    const bucket = (m: typeof osMap, key: string | null | undefined) => {
      const k = key || 'Unknown';
      const cur = m.get(k) ?? { sessions: new Set<string>(), views: 0, conv_sessions: new Set<string>() };
      cur.sessions.add(e.session_id);
      if (isView) cur.views += 1;
      if (isConv) cur.conv_sessions.add(e.session_id);
      m.set(k, cur);
    };
    bucket(osMap, e.os);
    bucket(brMap, e.browser);
  }
  const toRows = (m: typeof osMap) =>
    [...m.entries()]
      .map(([name, v]) => ({
        name,
        sessions: v.sessions.size,
        page_views: v.views,
        conversions: v.conv_sessions.size,
      }))
      .sort((a, b) => b.sessions - a.sessions);

  // countries with top cities (from sessions, which carry city)
  const countryMap = new Map<string, { sessions: Set<string>; cities: Map<string, Set<string>> }>();
  for (const s of (sesRes.data ?? []) as Array<{ session_id: string; country: string; city: string | null; started_at: string; device: string }>) {
    const c = s.country || 'unknown';
    const cur = countryMap.get(c) ?? { sessions: new Set<string>(), cities: new Map<string, Set<string>>() };
    cur.sessions.add(s.session_id);
    const city = s.city || 'unknown';
    const cs = cur.cities.get(city) ?? new Set<string>();
    cs.add(s.session_id);
    cur.cities.set(city, cs);
    countryMap.set(c, cur);
  }

  // page_views + conversions per country from daily rows (city unknown there)
  const dailyCountry = new Map<string, { views: number; conv: number }>();
  for (const r of daily) {
    const cur = dailyCountry.get(r.country) ?? { views: 0, conv: 0 };
    cur.views += r.page_views;
    cur.conv += r.checkouts + r.add_to_cart + r.newsletter_subscribes + r.contact_submits + r.registers;
    dailyCountry.set(r.country, cur);
  }

  const countries = [...countryMap.entries()]
    .map(([country, v]) => ({
      country,
      sessions: v.sessions.size,
      page_views: dailyCountry.get(country)?.views ?? 0,
      conversions: dailyCountry.get(country)?.conv ?? 0,
      cities: [...v.cities.entries()]
        .map(([city, s]) => ({ city, sessions: s.size }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 5),
    }))
    .sort((a, b) => b.sessions - a.sessions);

  return {
    devices,
    oses: toRows(osMap),
    browsers: toRows(brMap),
    sources: [...dailyDev.keys()].length
      ? foldSources(daily)
      : [],
    countries,
    range,
  };
}

function foldSources(daily: DailyRow[]) {
  const m = new Map<string, { sessions: number; page_views: number }>();
  for (const r of daily) {
    const cur = m.get(r.source) ?? { sessions: 0, page_views: 0 };
    cur.sessions += r.sessions;
    cur.page_views += r.page_views;
    m.set(r.source, cur);
  }
  return [...m.entries()]
    .map(([name, v]) => ({ name, sessions: v.sessions, page_views: v.page_views }))
    .sort((a, b) => b.sessions - a.sessions);
}

export type SubscriberRow = {
  email: string;
  source: string | null;
  country: string | null;
  city: string | null;
  subscribedAt: string;
};

/** SubscriberTable: the newsletter list with its geo columns. */
export async function loadSubscribers(): Promise<SubscriberRow[]> {
  const db = createAdminClient();
  const { data } = await db
    .from('newsletter_subscribers')
    .select('email, source, country, city, subscribed_at')
    .order('subscribed_at', { ascending: false })
    .limit(500);
  return ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({
    email: String(r.email ?? ''),
    source: (r.source as string | null) ?? null,
    country: (r.country as string | null) ?? null,
    city: (r.city as string | null) ?? null,
    subscribedAt: String(r.subscribed_at ?? ''),
  }));
}
