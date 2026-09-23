import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import {
  loadOverview,
  loadSubscribers,
  loadSearchAnalytics,
  loadBreakdowns,
  lastNDaysRange,
  normalizeRange,
  type DateRange,
} from '@/lib/analytics-queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Analytics exports — /api/analytics/export?table=<section>&format=<fmt>
 *   table: pages | search | subscribers | devices
 *   format: csv (default) | json | xls
 * Date range: ?from=YYYY-MM-DD&to=YYYY-MM-DD or ?days=7|30|90 (default 30).
 * Protected by the admin cookie; data is assembled server-side only.
 */

const toCsv = (headers: string[], rows: Array<Array<string | number>>): string =>
  [
    headers.join(','),
    ...rows.map((r) =>
      r
        .map((c) => {
          const s = String(c ?? '');
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(',')
    ),
  ].join('\n');

function send(body: string, format: string, filename: string): NextResponse {
  if (format === 'json') {
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  }
  if (format === 'xls') {
    // Spreadsheet-openable HTML table (no real xlsx lib — Excel/Sheets open it fine)
    const rows = body.split('\n').map((line) => {
      const cells = line.match(/("([^"]|"")*"|[^,]*)/g)?.filter((_, i) => i % 2 === 0) ?? [];
      return cells.length > 1
        ? `<tr>${cells
            .map((c) => `<td>${c.replace(/^"|"$/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`)
            .join('')}</tr>`
        : '';
    });
    const html = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>${rows
      .filter(Boolean)
      .map((r) => (r.startsWith('<tr>') ? r : ''))
      .join('')}</table></body></html>`;
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.xls"`,
        'Cache-Control': 'no-store',
      },
    });
  }
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const sp = url.searchParams;
  const table = sp.get('table') ?? 'pages';
  const format = sp.get('format') ?? 'csv';
  if (!['pages', 'search', 'subscribers', 'devices'].includes(table)) {
    return NextResponse.json({ error: "Unknown table." }, { status: 400 });
  }
  if (!['csv', 'json', 'xls'].includes(format)) {
    return NextResponse.json({ error: 'Unknown format.' }, { status: 400 });
  }

  const { range } = normalizeRange({
    days: sp.get('days') ?? undefined,
    from: sp.get('from') ?? undefined,
    to: sp.get('to') ?? undefined,
  });
  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = `${range.from}_${range.to}`;

  try {
    let headers: string[] = [];
    let rows: Array<Array<string | number>> = [];
    let name = table;

    if (table === 'pages') {
      const data = await loadOverview(range);
      headers = ['Page', 'Views'];
      rows = data.topPages.map((p) => [p.page, p.views]);
      name = 'top-pages';
    } else if (table === 'devices') {
      const { devices, oses, browsers, countries, sources } = await loadBreakdowns(range);
      headers = [
        'Kind',
        'Name',
        'Sessions',
        'Page views',
        'Conversions',
        'Extra',
      ];
      const all: Array<Array<string | number>> = [];
      for (const d of devices)
        all.push(['device', d.name, d.sessions, d.page_views, d.checkouts + d.subscribes, '']);
      for (const o of oses) all.push(['os', o.name, o.sessions, o.page_views, o.conversions, '']);
      for (const b of browsers)
        all.push(['browser', b.name, b.sessions, b.page_views, b.conversions, '']);
      for (const s of sources) all.push(['source', s.name, s.sessions, s.page_views, '', '']);
      for (const c of countries)
        all.push([
          'country',
          c.country,
          c.sessions,
          c.page_views,
          c.conversions,
          c.cities.map((x) => `${x.city} (${x.sessions})`).join('; '),
        ]);
      rows = all;
      name = 'devices-sources';
    } else if (table === 'search') {
      const data = await loadSearchAnalytics(range);
      headers = ['Type', 'Term', 'Searches', 'No results', 'Clicks', 'CTR %'];
      rows = [
        ...data.product.map((r) => ['product' as const, r.term, r.searches, r.no_results, r.clicks, r.ctr] as Array<string | number>),
        ...data.blog.map((r) => ['post' as const, r.term, r.searches, r.no_results, r.clicks, r.ctr] as Array<string | number>),
      ];
      name = 'search-queries';
    } else {
      const rowsSubs = await loadSubscribers();
      headers = ['Email', 'Source', 'Country', 'City', 'Subscribed At'];
      rows = rowsSubs.map((r) => [r.email, r.source ?? '', r.country ?? '', r.city ?? '', r.subscribedAt]);
      name = 'subscribers';
    }

    const csv = toCsv(headers, rows);
    if (format === 'json') {
      return send(
        JSON.stringify({ range, table: name, headers, rows }, null, 2),
        'json',
        `techbd-${name}-${suffix}`
      );
    }
    return send(csv, format, `techbd-${name}-${suffix}`);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'export failed' },
      { status: 500 }
    );
  }
}

export type { DateRange };
