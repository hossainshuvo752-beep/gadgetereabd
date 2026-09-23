import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { toCsv } from '@/lib/adminCsv';
import {
  loadOverview,
  loadSubscribers,
  loadSearchAnalytics,
  lastNDaysRange,
} from '@/lib/analytics-queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Analytics CSV exports — /api/analytics/export?table=pages|search|subscribers.
 * Protected by the admin cookie; data is assembled server-side only.
 */
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const table = new URL(request.url).searchParams.get('table');
  if (table !== 'pages' && table !== 'search' && table !== 'subscribers') {
    return NextResponse.json(
      { error: "Unknown table — use 'pages', 'search' or 'subscribers'." },
      { status: 400 }
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  let csv: string;
  let filename: string;

  try {
    if (table === 'pages') {
      const data = await loadOverview(lastNDaysRange(30));
      csv = toCsv(
        ['Page', 'Views (30d)'],
        data.topPages.map((p) => [p.page, p.views])
      );
      filename = `techbd-top-pages-${today}.csv`;
    } else if (table === 'search') {
      const data = await loadSearchAnalytics(30);
      csv = toCsv(
        ['Query', 'Hits (30d)', 'Last Seen'],
        data.rows.map((r) => [r.q, r.hits, r.last_seen])
      );
      filename = `techbd-search-queries-${today}.csv`;
    } else {
      const rows = await loadSubscribers();
      csv = toCsv(
        ['Email', 'Source', 'Country', 'City', 'Subscribed At'],
        rows.map((r) => [r.email, r.source ?? '', r.country ?? '', r.city ?? '', r.subscribedAt])
      );
      filename = `techbd-subscribers-${today}.csv`;
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'export failed' },
      { status: 500 }
    );
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
