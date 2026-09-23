import { loadSearchAnalytics, loadEnginePages, normalizeRange } from '@/lib/analytics-queries';
import { RangePicker } from '../RangePicker';
import { AnalyticsMultiExport } from '@/components/admin/AnalyticsMultiExport';

export const dynamic = 'force-dynamic';

/**
 * Search analytics: stat cards (total / no-result % / click-after-search),
 * product + blog search ranks, search-to-click rank, FAQ question rank, and
 * search-engine traffic per page — approximated from referrers/UTM since
 * Search Console is not connected. All over the selected date range.
 */

const nf = new Intl.NumberFormat('en-US');

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-text-body">{label}</p>
      <p className="text-2xl font-bold text-text-heading mt-1">{value}</p>
      {hint ? <p className="text-xs text-text-body mt-1">{hint}</p> : null}
    </div>
  );
}

function RankTable({
  title,
  rows,
  cols,
}: {
  title: string;
  rows: Array<Record<string, string>>;
  cols: string[];
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-text-heading mb-3">{title}</h2>
      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-text-body text-sm p-4">No search activity in this range yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                {cols.map((c, i) => (
                  <th key={c} className={`px-4 py-2 ${i === 0 ? '' : 'text-right'}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-text-heading/5 last:border-0">
                  {cols.map((c, j) => (
                    <td
                      key={c}
                      className={`px-4 py-2 ${
                        j === 0 ? 'text-text-heading' : 'text-right text-text-heading'
                      }`}
                    >
                      {r[c] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const APPROX_NOTE =
  'Approximation method: sessions whose referrer host or UTM source matches a search engine (google / bing / duckduckgo). Browsers increasingly strip referrers, so this UNDERCOUNTS real search traffic — it is first-party data only, not Search Console.';

export default async function SearchAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { range, days } = normalizeRange(params);
  const [data, engines] = await Promise.all([loadSearchAnalytics(range), loadEnginePages(range)]);

  return (
    <div className="space-y-8">
      <RangePicker activeDays={days} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total searches" value={nf.format(data.total_searches)} hint="header search, selected range" />
        <Stat label="No-result searches" value={`${data.no_result_pct}%`} hint="searches with no matching term typed-through" />
        <Stat label="Click-after-search rate" value={`${data.click_after_rate}%`} hint="searches that led to a result click" />
      </div>

      <RankTable
        title="Product search rank"
        cols={['Term', 'Searches', 'No results', 'Click-through', 'Rate']}
        rows={data.product.map((r) => ({
          Term: r.term,
          Searches: nf.format(r.searches),
          'No results': nf.format(r.no_results),
          'Click-through': nf.format(r.clicks),
          Rate: `${r.ctr}%`,
        }))}
      />

      <RankTable
        title="Blog search rank"
        cols={['Term', 'Searches', 'No results', 'Click-through', 'Rate']}
        rows={data.blog.map((r) => ({
          Term: r.term,
          Searches: nf.format(r.searches),
          'No results': nf.format(r.no_results),
          'Click-through': nf.format(r.clicks),
          Rate: `${r.ctr}%`,
        }))}
      />

      <RankTable
        title="Search-to-click rank"
        cols={['Term', 'Type', 'Clicks', 'Last click']}
        rows={data.toClick.map((r) => ({
          Term: r.term,
          Type: r.type,
          Clicks: nf.format(r.clicks),
          'Last click': new Date(r.last).toLocaleString('en-GB'),
        }))}
      />

      <RankTable
        title="FAQ question rank (in-website)"
        cols={['Question', 'Expands', 'Location']}
        rows={data.faq.map((r) => ({
          Question: r.question,
          Expands: nf.format(r.expands),
          Location: r.location,
        }))}
      />

      {/* Search engine traffic per page — approximated */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">
          Search engine traffic per page
        </h2>
        <p className="text-xs text-text-body mb-3">{APPROX_NOTE}</p>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
          {engines.length === 0 ? (
            <p className="text-text-body text-sm p-4">
              No search-engine-referred sessions recorded in this range yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                  <th className="px-4 py-2">Engine</th>
                  <th className="px-4 py-2 text-right">Sessions</th>
                  <th className="px-4 py-2">Top landing pages</th>
                </tr>
              </thead>
              <tbody>
                {engines.map((e) => (
                  <tr key={e.engine} className="border-b border-text-heading/5 last:border-0">
                    <td className="px-4 py-2 text-text-heading capitalize">{e.engine}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(e.sessions)}</td>
                    <td className="px-4 py-2 text-text-body text-xs font-mono">
                      {e.pages.map((p) => `${p.page} (${p.sessions})`).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* FAQ Google traffic — same approximation */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">FAQ Google traffic</h2>
        <p className="text-xs text-text-body mb-3">
          {APPROX_NOTE} Sessions landing directly on /faq from Google.
        </p>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
          {engines.find((e) => e.engine === 'google')?.pages.some((p) => p.page.startsWith('/faq')) ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                  <th className="px-4 py-2">Landing page</th>
                  <th className="px-4 py-2 text-right">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {engines
                  .find((e) => e.engine === 'google')!
                  .pages.filter((p) => p.page.startsWith('/faq'))
                  .map((p) => (
                    <tr key={p.page} className="border-b border-text-heading/5 last:border-0">
                      <td className="px-4 py-2 text-text-heading font-mono text-xs">{p.page}</td>
                      <td className="px-4 py-2 text-right text-text-heading">{nf.format(p.sessions)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="text-text-body text-sm p-4">
              No Google-referred sessions landing on /faq in this range yet.
            </p>
          )}
        </div>
      </div>

      <AnalyticsMultiExport section="search" />
    </div>
  );
}
