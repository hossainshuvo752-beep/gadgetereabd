import 'server-only';
import { createAdminClient } from '@/lib/supabaseAdmin';

/**
 * TechBD analytics aggregation engine (Cluster 3).
 *
 * Adapted from the reference build with its hard-won lessons applied:
 *  - LESSON #4 (double-counting on re-aggregation): every aggregate write is
 *    DELETE-then-RECOMPUTE per day, so re-running a day is always idempotent.
 *  - LESSON #2 (slow dashboards): dashboards read ONLY these pre-aggregated
 *    tables / report payloads, never raw events.
 *  - REPORT_VERSION guards the payload shape: bump it when the report format
 *    changes so stale cached payloads can be detected and rebuilt.
 *
 * Funnel mapping (metricFor) matches TechBD's conversion vocabulary in
 * supabase/analytics-schema.sql exactly:
 *   product_views, add_to_cart, checkouts (checkout_view + begin_checkout +
 *   order_placed), newsletter_subscribes, newsletter_shown, contact_submits,
 *   registers.
 */

export const REPORT_VERSION = 1;

/** Bump when the payload shape changes; dashboards rebuild stale days. */
const VERSION_KEY = 'report_version';

export type DayReport = {
  [VERSION_KEY]: number;
  date: string;
  totals: {
    visitors: number;
    sessions: number;
    page_views: number;
    bounces: number;
    avg_session_seconds: number;
    product_views: number;
    add_to_cart: number;
    checkouts: number;
    newsletter_subscribes: number;
    newsletter_shown: number;
    contact_submits: number;
    registers: number;
  };
  bySource: Array<{ source: string; sessions: number; page_views: number }>;
  byDevice: Array<{ device: string; sessions: number; page_views: number }>;
  byCountry: Array<{ country: string; sessions: number; page_views: number }>;
  topPages: Array<{
    page: string;
    views: number;
    unique_views: number;
    avg_time_seconds: number;
    exits: number;
  }>;
};

type Db = ReturnType<typeof createAdminClient>;

function metricFor(event: string): keyof DayReport['totals'] | null {
  switch (event) {
    case 'product_view':
      return 'product_views';
    case 'add_to_cart':
      return 'add_to_cart';
    case 'checkout_view':
    case 'begin_checkout':
    case 'order_placed':
      return 'checkouts';
    case 'newsletter_subscribe':
      return 'newsletter_subscribes';
    case 'newsletter_shown':
      return 'newsletter_shown';
    case 'contact_submit':
      return 'contact_submits';
    case 'register_success':
      return 'registers';
    default:
      return null;
  }
}

/** Local-date label in UTC so a "day" is unambiguous between cron and DB. */
export function utcDateLabel(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Aggregate one UTC day from raw events + sessions into analytics_daily,
 * analytics_pages_daily and the analytics_reports JSON payload.
 * Idempotent: existing rows for the date are deleted first (lesson #4).
 */
export async function aggregateDay(date: string, db?: Db): Promise<void> {
  const client = db ?? createAdminClient();
  const dayStart = `${date}T00:00:00Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  // ---- load the day's raw events (only the columns aggregation needs) ----
  const { data: events, error: evErr } = await client
    .from('analytics_events')
    .select('event, page, source, device, country, session_id, meta, created_at')
    .gte('created_at', dayStart)
    .lte('created_at', dayEnd)
    .order('created_at', { ascending: true });

  if (evErr) throw new Error(`events read failed: ${evErr.message}`);

  const { data: sessions, error: sesErr } = await client
    .from('analytics_sessions')
    .select(
      'session_id, source, device, country, started_at, page_views, interactions, duration_seconds'
    )
    .gte('started_at', dayStart)
    .lte('started_at', dayEnd);

  if (sesErr) throw new Error(`sessions read failed: ${sesErr.message}`);

  const eventRows = events ?? [];
  const sessionRows = sessions ?? [];

  // ---- key helper: everything buckets by (source, device, country) ----
  const keyOf = (r: { source?: string | null; device?: string | null; country?: string | null }) =>
    `${r.source ?? 'direct'}|${r.device ?? 'unknown'}|${r.country ?? 'unknown'}`;

  type Bucket = {
    sessions: Set<string>;
    visitors: Set<string>;
    page_views: number;
    bounces: number;
    session_seconds: number;
    funnel: Record<string, number>;
  };
  const buckets = new Map<string, Bucket>();
  const bucketFor = (k: string): Bucket => {
    let b = buckets.get(k);
    if (!b) {
      b = {
        sessions: new Set(),
        visitors: new Set(),
        page_views: 0,
        bounces: 0,
        session_seconds: 0,
        funnel: {},
      };
      buckets.set(k, b);
    }
    return b;
  };

  // ---- sessions: visitors/sessions/bounces/duration ----
  for (const s of sessionRows) {
    const b = bucketFor(keyOf(s));
    b.sessions.add(s.session_id);
    const secs = s.duration_seconds ?? 0;
    const interactions = s.interactions ?? 0;
    const views = s.page_views ?? 0;
    // Bounce = 1-page, no interactions, <15s (reference's working definition).
    if (views <= 1 && interactions === 0 && secs < 15) b.bounces += 1;
    b.session_seconds += secs;
  }

  // ---- events: page views, funnel counters, visitor sets ----
  const pages = new Map<
    string,
    { views: number; sessions: Set<string>; time: number; exits: number }
  >();

  for (const e of eventRows) {
    const b = bucketFor(keyOf(e));

    if (e.event === 'page_view') {
      b.page_views += 1;
      const page = (e.page ?? '/').split('?')[0] || '/';
      let p = pages.get(page);
      if (!p) {
        p = { views: 0, sessions: new Set(), time: 0, exits: 0 };
        pages.set(page, p);
      }
      p.views += 1;
      p.sessions.add(e.session_id);
    }

    // visitor uniqueness: session_id as the visitor proxy (uid is a
    // localStorage id, unavailable pre-consent — sessions are exact enough)
    b.visitors.add(e.session_id);

    if (e.event === 'time_on_page' && e.meta && typeof e.meta === 'object') {
      const meta = e.meta as Record<string, unknown>;
      const secs = typeof meta.seconds === 'number' ? meta.seconds : null;
      if (secs !== null) {
        const page = (e.page ?? '/').split('?')[0] || '/';
        const p = pages.get(page);
        if (p) p.time += secs;
      }
    }

    if (e.event === 'page_view') {
      // potential exit = last event of a session in this day's stream
      // (approximation: counted below from the session's exit_page instead)
    }

    const m = metricFor(e.event);
    if (m) b.funnel[m] = (b.funnel[m] ?? 0) + 1;
  }

  // exits: use each session's exit_page (kept fresh by the ingest API)
  const { data: exitSessions } = await client
    .from('analytics_sessions')
    .select('exit_page, last_activity')
    .gte('last_activity', dayStart)
    .lte('last_activity', dayEnd);
  for (const s of exitSessions ?? []) {
    const page = (s.exit_page ?? '').split('?')[0];
    if (!page) continue;
    const p = pages.get(page);
    if (p) p.exits += 1;
  }

  // ---- write analytics_daily (delete-then-recompute) ----
  await client.from('analytics_daily').delete().eq('date', date);
  const dailyRows = [...buckets.entries()].map(([k, b]) => {
    const [source, device, country] = k.split('|');
    return {
      date,
      source,
      device,
      country,
      visitors: b.visitors.size,
      unique_visitors: b.visitors.size,
      sessions: b.sessions.size,
      page_views: b.page_views,
      bounces: b.bounces,
      session_seconds: b.session_seconds,
      product_views: b.funnel.product_views ?? 0,
      add_to_cart: b.funnel.add_to_cart ?? 0,
      checkouts: b.funnel.checkouts ?? 0,
      newsletter_subscribes: b.funnel.newsletter_subscribes ?? 0,
      newsletter_shown: b.funnel.newsletter_shown ?? 0,
      contact_submits: b.funnel.contact_submits ?? 0,
      registers: b.funnel.registers ?? 0,
    };
  });
  if (dailyRows.length) {
    const { error } = await client.from('analytics_daily').insert(dailyRows);
    if (error) throw new Error(`daily write failed: ${error.message}`);
  }

  // ---- write analytics_pages_daily (delete-then-recompute) ----
  await client.from('analytics_pages_daily').delete().eq('date', date);
  const pageRows = [...pages.entries()].map(([page, p]) => ({
    date,
    page,
    views: p.views,
    unique_views: p.sessions.size,
    time_on_page_seconds: p.time,
    exits: p.exits,
    referral_hits: 0,
  }));
  if (pageRows.length) {
    const { error } = await client.from('analytics_pages_daily').insert(pageRows);
    if (error) throw new Error(`pages write failed: ${error.message}`);
  }

  // ---- build + store the JSON report payload ----
  const sum = (rows: Array<Record<string, unknown>>, f: string) =>
    rows.reduce((acc, r) => acc + (Number(r[f]) || 0), 0);

  const totals: DayReport['totals'] = {
    visitors: sum(dailyRows as unknown as Array<Record<string, unknown>>, 'visitors'),
    sessions: sum(dailyRows as unknown as Array<Record<string, unknown>>, 'sessions'),
    page_views: sum(dailyRows as unknown as Array<Record<string, unknown>>, 'page_views'),
    bounces: sum(dailyRows as unknown as Array<Record<string, unknown>>, 'bounces'),
    avg_session_seconds:
      totals_seconds(dailyRows) /
      Math.max(1, sum(dailyRows as unknown as Array<Record<string, unknown>>, 'sessions')),
    product_views: sum(dailyRows as unknown as Array<Record<string, unknown>>, 'product_views'),
    add_to_cart: sum(dailyRows as unknown as Array<Record<string, unknown>>, 'add_to_cart'),
    checkouts: sum(dailyRows as unknown as Array<Record<string, unknown>>, 'checkouts'),
    newsletter_subscribes: sum(
      dailyRows as unknown as Array<Record<string, unknown>>,
      'newsletter_subscribes'
    ),
    newsletter_shown: sum(
      dailyRows as unknown as Array<Record<string, unknown>>,
      'newsletter_shown'
    ),
    contact_submits: sum(dailyRows as unknown as Array<Record<string, unknown>>, 'contact_submits'),
    registers: sum(dailyRows as unknown as Array<Record<string, unknown>>, 'registers'),
  };

  const groupBy = (field: 'source' | 'device' | 'country') => {
    const m = new Map<string, { sessions: number; page_views: number }>();
    for (const r of dailyRows as unknown as Array<Record<string, unknown>>) {
      const k = String(r[field] ?? 'unknown');
      const cur = m.get(k) ?? { sessions: 0, page_views: 0 };
      cur.sessions += Number(r.sessions) || 0;
      cur.page_views += Number(r.page_views) || 0;
      m.set(k, cur);
    }
    return [...m.entries()]
      .map(([name, v]) => ({ [field]: name, ...v }))
      .sort((a, b) => b.sessions - a.sessions);
  };

  const report: DayReport = {
    [VERSION_KEY]: REPORT_VERSION,
    date,
    totals,
    bySource: groupBy('source') as DayReport['bySource'],
    byDevice: groupBy('device') as DayReport['byDevice'],
    byCountry: groupBy('country') as DayReport['byCountry'],
    topPages: [...pages.entries()]
      .map(([page, p]) => ({
        page,
        views: p.views,
        unique_views: p.sessions.size,
        avg_time_seconds: p.views ? Math.round(p.time / p.views) : 0,
        exits: p.exits,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 25),
  };

  // delete-then-insert keeps this idempotent too (upsert would need a
  // unique constraint on payload versioning we don't want).
  await client.from('analytics_reports').delete().eq('date', date);
  const { error: repErr } = await client.from('analytics_reports').insert({
    date,
    payload: report,
  });
  if (repErr) throw new Error(`report write failed: ${repErr.message}`);
}

function totals_seconds(rows: Array<Record<string, unknown>>): number {
  return rows.reduce((acc, r) => acc + (Number(r.session_seconds) || 0), 0);
}

/**
 * Aggregate the last N days (inclusive of today) — used by the cron route
 * and the manual backfill button. Sequential on purpose: the DB does the
 * heavy lifting, and parallel runs on tiny data would just be noise.
 */
export async function aggregateRecentDays(days = 3): Promise<string[]> {
  const db = createAdminClient();
  const done: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const date = utcDateLabel(d);
    await aggregateDay(date, db);
    done.push(date);
  }
  return done;
}
