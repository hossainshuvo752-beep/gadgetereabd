import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Analytics ingest — the ONLY writer to analytics_events / analytics_sessions.
 * Runs server-side with the service-role client; RLS on those tables permits
 * nothing to anon/authed, so the public never touches the raw tables directly.
 *
 * Geo enrichment is SERVER-SIDE from request headers (never from client
 * input): Vercel injects x-vercel-ip-country / x-vercel-ip-city on the edge.
 * A local/dev fallback reads CF-* headers or leaves 'unknown' — no external
 * geo API is called.
 */

type IncomingEvent = {
  event: string;
  page?: string;
  meta?: Record<string, unknown>;
};

const DEVICE_RE = /(mobile|android|iphone|ipad|ipod)/i;

function parseDevice(ua: string): string {
  if (!ua) return 'unknown';
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  return DEVICE_RE.test(ua) ? 'mobile' : 'desktop';
}

function parseOS(ua: string): string {
  if (/windows/i.test(ua)) return 'Windows';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod|ios/i.test(ua)) return 'iOS';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'unknown';
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/chrome\//i.test(ua)) return 'Chrome';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/safari\//i.test(ua)) return 'Safari';
  return 'unknown';
}

function refHostOf(req: NextRequest): string | null {
  try {
    const ref = req.headers.get('referer');
    if (!ref) return null;
    return new URL(ref).hostname;
  } catch {
    return null;
  }
}

function sourceOf(req: NextRequest): string {
  const ref = refHostOf(req);
  if (!ref) return 'direct';
  try {
    const host = new URL(req.url).hostname;
    return ref === host || ref.endsWith(`.${host}`) ? 'direct' : ref;
  } catch {
    return ref;
  }
}

export async function POST(req: NextRequest) {
  const db = createAdminClient();
  try {
    // Basic size guard — analytics should never accept huge bodies.
    const raw = await req.text();
    if (raw.length > 16_000) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }

    const body = JSON.parse(raw) as {
      sid?: string;
      uid?: string | null;
      events?: IncomingEvent[];
      screen?: string;
    };

    const sid = typeof body.sid === 'string' ? body.sid.slice(0, 64) : null;
    const events = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
    if (!sid || events.length === 0) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // ---- server-side enrichment (headers only; client values untrusted) ----
    const ua = req.headers.get('user-agent') ?? '';
    const device = parseDevice(ua);
    const os = parseOS(ua);
    const browser = parseBrowser(ua);
    const country =
      req.headers.get('x-vercel-ip-country') ??
      req.headers.get('cf-ipcountry') ??
      'unknown';
    const city =
      req.headers.get('x-vercel-ip-city') ??
      (typeof req.headers.get('cf-ipcity') === 'string'
        ? (req.headers.get('cf-ipcity') as string)
        : 'unknown');
    const source = sourceOf(req);
    const refHost = refHostOf(req);
    const first = events[0] ?? {};

    // ---- sessions upsert (one row per visit) ----
    const nowIso = new Date().toISOString();
    const { data: existing } = await db
      .from('analytics_sessions')
      .select('session_id, started_at, page_views, interactions, exit_page')
      .eq('session_id', sid)
      .maybeSingle();

    if (!existing) {
      await db.from('analytics_sessions').insert({
        session_id: sid,
        user_id: body.uid ?? null,
        source,
        device,
        country,
        city,
        landing_page: first.page ?? '',
        exit_page: first.page ?? '',
        started_at: nowIso,
        last_activity: nowIso,
        page_views: 1,
        interactions: 0,
      });
    } else {
      const views = (existing.page_views ?? 0) + events.filter((e) => e.event === 'page_view').length;
      const interactions =
        (existing.interactions ?? 0) +
        events.filter((e) => e.event !== 'page_view').length;
      await db
        .from('analytics_sessions')
        .update({
          last_activity: nowIso,
          exit_page: events[events.length - 1]?.page ?? existing.exit_page ?? '',
          page_views: views,
          interactions,
        })
        .eq('session_id', sid);
    }

    // ---- raw event rows ----
    const rows = events.map((e) => ({
      session_id: sid,
      user_id: body.uid ?? null,
      event: typeof e.event === 'string' ? e.event.slice(0, 64) : 'unknown',
      page: typeof e.page === 'string' ? e.page.slice(0, 300) : '',
      source,
      device,
      os,
      browser,
      country,
      city,
      url: req.headers.get('referer') ?? '',
      ref_host: refHost,
      utm_campaign: req.nextUrl.searchParams.get('utm_campaign'),
      utm_medium: req.nextUrl.searchParams.get('utm_medium'),
      utm_source: req.nextUrl.searchParams.get('utm_source'),
      meta: (e.meta ?? {}) as Record<string, unknown>,
    }));

    const { error } = await db.from('analytics_events').insert(rows);
    if (error) {
      // Analytics must never leak errors to callers; log server-side only.
      console.error('[analytics] insert failed:', error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
