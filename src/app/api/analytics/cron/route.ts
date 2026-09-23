import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { aggregateRecentDays, aggregateDay, utcDateLabel } from '@/lib/analytics-aggregate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Aggregation cron endpoint.
 *
 * SCHEDULE (documented, not connected to any external scheduler yet):
 *   vercel.json registers this route on Vercel's cron feature (no extra
 *   credentials needed when deployed there). If self-hosting elsewhere,
 *   call it daily with:
 *     curl -X POST -H "x-cron-key: $CRON_SECRET" https://<site>/api/analytics/cron
 *
 * Auth: EITHER the admin session cookie (manual "aggregate now" buttons in
 * the dashboard) OR the CRON_SECRET header (scheduled runs). Without either
 * -> 401.
 */
export async function POST(req: Request) {
  const admin = await isAdminAuthenticated();
  const cronKey = process.env.CRON_SECRET;
  const headerKey = req.headers.get('x-cron-key');
  const viaCron = Boolean(cronKey && headerKey && headerKey === cronKey);

  if (!admin && !viaCron) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    // A trailing ?date=YYYY-MM-DD re-runs a single day (manual repair tool);
    // ?days=N (admin only) backfills the last N days; default = recent 3.
    const params = new URL(req.url).searchParams;
    const dateParam = params.get('date');
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      await aggregateDay(dateParam);
      return NextResponse.json({ ok: true, mode: 'single-day', date: dateParam });
    }

    let days = Number(process.env.AGGREGATE_DAYS ?? 3);
    const daysParam = params.get('days');
    if (admin && daysParam && Number.isFinite(Number(daysParam))) {
      days = Math.min(60, Math.max(1, Number(daysParam)));
    }
    const done = await aggregateRecentDays(Math.max(1, Math.floor(days)));
    return NextResponse.json({
      ok: true,
      mode: 'recent-days',
      aggregated: done,
      ran_at: utcDateLabel(),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'aggregation failed' },
      { status: 500 }
    );
  }
}
