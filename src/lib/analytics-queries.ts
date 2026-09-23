import 'server-only';
import { createAdminClient } from '@/lib/supabaseAdmin';
import { REPORT_VERSION, type DayReport } from '@/lib/analytics-aggregate';

/**
 * Server-side read layer for the /admin/analytics dashboard (Cluster 4).
 * Every function here runs ONLY on the server via the service-role client;
 * pages that use them are cookie-gated by isAdminAuthenticated().
 *
 * Dashboards read the PRE-AGGREGATED tables / report payloads
 * (lesson #2: never scan raw events for the main views). The only raw
 * queries are bounded, indexed lookups for the realtime panel and the
 * search page (both capped + time-windowed).
 */

export type OverviewData = {
  today: DayReport | null;
  yesterday: DayReport | null;
  trend: Array<{ date: string; sessions: number; page_views: number }>;
  totals30: {
    sessions: number;
    page_views: number;
    visitors: number;
    product_views: number;
    add_to_cart: number;
    checkouts: number;
    newsletter_subscribes: number;
    contact_submits: number;
    registers: number;
  };
  topPages: Array<{ page: string; views: number }>;
  lastAggregatedAt: string | null;
  staleDays: string[]; // dates with a report older than REPORT_VERSION
};

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

const n = (v: unknown): number => Number(v) || 0;

function sumReportFields(reports: Array<{ payload: unknown }>) {
  const acc = {
    sessions: 0,
    page_views: 0,
    visitors: 0,
    product_views: 0,
    add_to_cart: 0,
    checkouts: 0,
    newsletter_subscribes: 0,
    contact_submits: 0,
    registers: 0,
  };
  for (const r of reports) {
    const t = (r.payload as DayReport | null)?.totals;
    if (!t) continue;
    acc.sessions += n(t.sessions);
    acc.page_views += n(t.page_views);
    acc.visitors += n(t.visitors);
    acc.product_views += n(t.product_views);
    acc.add_to_cart += n(t.add_to_cart);
    acc.checkouts += n(t.checkouts);
    acc.newsletter_subscribes += n(t.newsletter_subscribes);
    acc.contact_submits += n(t.contact_submits);
    acc.registers += n(t.registers);
  }
  return acc;
}

function utcLabel(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

/** Overview: today/yesterday reports, 30-day trend + totals, top pages. */
export async function loadOverview(): Promise<OverviewData> {
  const db = createAdminClient();

  const [todayRep, yestRep, trendRows, last30, stale] = await Promise.all([
    db.from('analytics_reports').select('payload').eq('date', utcLabel(0)).maybeSingle(),
    db.from('analytics_reports').select('payload').eq('date', utcLabel(1)).maybeSingle(),
    db
      .from('analytics_reports')
      .select('date, payload')
      .gte('date', utcLabel(29))
      .order('date', { ascending: true }),
    db
      .from('analytics_reports')
      .select('payload')
      .gte('date', utcLabel(29)),
    db.from('analytics_reports').select('date, payload').order('date', { ascending: false }).limit(90),
  ]);

  const reports30 = (last30.data ?? []) as Array<{ payload: DayReport }>;
  const totals30 = sumReportFields(reports30);

  // top pages: fold each report's topPages (already capped at 25/day)
  const pageMap = new Map<string, number>();
  for (const r of reports30) {
    for (const p of r.payload?.topPages ?? []) {
      pageMap.set(p.page, (pageMap.get(p.page) ?? 0) + p.views);
    }
  }
  const topPages = [...pageMap.entries()]
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const staleDays = ((stale.data ?? []) as Array<{ date: string; payload: DayReport }>)
    .filter((r) => !r.payload || r.payload.report_version !== REPORT_VERSION)
    .map((r) => r.date);

  return {
    today: (todayRep.data?.payload as DayReport | undefined) ?? null,
    yesterday: (yestRep.data?.payload as DayReport | undefined) ?? null,
    trend: ((trendRows.data ?? []) as Array<{ date: string; payload: DayReport }>).map((r) => ({
      date: r.date,
      sessions: n(r.payload?.totals?.sessions),
      page_views: n(r.payload?.totals?.page_views),
    })),
    totals30,
    topPages,
    lastAggregatedAt:
      ((stale.data ?? [])[0] as { payload?: DayReport } | undefined)?.payload?.date ?? null,
    staleDays,
  };
}

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

export type DeviceSlice = { device: string; sessions: number; page_views: number };
export type LocationSlice = { country: string; city?: string; sessions: number };
export type SearchRow = { q: string; hits: number; last_seen: string };

export type SearchPageData = {
  rows: SearchRow[];
  windowDays: number;
};

/**
 * Search analytics: top header_search queries over the last N days from raw
 * events (bounded + indexed; fine at this scale, switch to an aggregate when
 * it grows).
 */
export async function loadSearchAnalytics(windowDays = 30): Promise<SearchPageData> {
  const db = createAdminClient();
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await db
    .from('analytics_events')
    .select('meta, created_at')
    .eq('event', 'header_search')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1000);

  const map = new Map<string, { hits: number; last: string }>();
  for (const row of (data ?? []) as Array<{ meta: Record<string, unknown>; created_at: string }>) {
    const q = String(row.meta?.q ?? '').trim().toLowerCase();
    if (!q) continue;
    const cur = map.get(q) ?? { hits: 0, last: row.created_at };
    cur.hits += 1;
    map.set(q, cur);
  }

  return {
    rows: [...map.entries()]
      .map(([q, v]) => ({ q, hits: v.hits, last_seen: v.last }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 50),
    windowDays,
  };
}

export type SubscriberRow = {
  email: string;
  source: string | null;
  country: string | null;
  city: string | null;
  subscribedAt: string;
};

/** SubscriberTable (Cluster 5): the newsletter list with its new geo columns. */
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

/** Devices/countries for their dedicated pages (from pre-agg daily rows). */
export async function loadBreakdowns(days = 30) {
  const db = createAdminClient();
  const { data } = await db
    .from('analytics_daily')
    .select('source, device, country, sessions, page_views')
    .gte('date', utcLabel(days - 1));

  const rows = (data ?? []) as Array<{
    source: string;
    device: string;
    country: string;
    sessions: number;
    page_views: number;
  }>;

  const fold = (field: 'source' | 'device' | 'country') => {
    const m = new Map<string, { sessions: number; page_views: number }>();
    for (const r of rows) {
      const k = r[field] || 'unknown';
      const cur = m.get(k) ?? { sessions: 0, page_views: 0 };
      cur.sessions += n(r.sessions);
      cur.page_views += n(r.page_views);
      m.set(k, cur);
    }
    return [...m.entries()]
      .map(([name, v]) => ({ name, sessions: v.sessions, page_views: v.page_views }))
      .sort((a, b) => b.sessions - a.sessions);
  };

  return {
    devices: fold('device') as Array<{ name: string; sessions: number; page_views: number }>,
    countries: fold('country') as Array<{ name: string; sessions: number; page_views: number }>,
    sources: fold('source') as Array<{ name: string; sessions: number; page_views: number }>,
  };
}
