import { loadBreakdowns, normalizeRange } from '@/lib/analytics-queries';
import { RangePicker } from '../RangePicker';
import { AnalyticsMultiExport } from '@/components/admin/AnalyticsMultiExport';

export const dynamic = 'force-dynamic';

/**
 * Locations: visitors-by-country bar chart + a top-locations table with
 * conversions and each country's top cities — all over the selected range.
 * Session/city grain comes from analytics_sessions (city is only on the
 * session row); views/conversions fold from analytics_daily.
 */
export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { range, days } = normalizeRange(params);
  const { countries } = await loadBreakdowns(range);
  const nf = new Intl.NumberFormat('en-US');
  const max = Math.max(1, ...countries.map((c) => c.sessions));
  const total = countries.reduce((a, c) => a + c.sessions, 0);

  const convPct = (conv: number, sessions: number) =>
    sessions ? `${((conv / sessions) * 100).toFixed(1)}%` : '0.0%';

  return (
    <div className="space-y-8">
      <RangePicker activeDays={days} />

      {/* Visitors by country — horizontal bar chart */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Visitors by country</h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
          {countries.length === 0 ? (
            <p className="text-text-body text-sm p-4">
              No location data in this range yet — country/city come from Vercel edge
              headers on the ingest API, so local (non-Vercel) runs show “unknown”.
            </p>
          ) : (
            <ul className="divide-y divide-text-heading/5">
              {countries.slice(0, 15).map((c) => (
                <li key={c.country} className="px-4 py-2.5">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-text-heading font-medium capitalize">{c.country}</span>
                    <span className="text-text-heading">
                      {nf.format(c.sessions)}
                      <span className="text-text-body text-xs ml-2">
                        {total ? ((c.sessions / total) * 100).toFixed(1) : '0.0'}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-bg-light rounded overflow-hidden">
                    <div
                      className="h-full bg-accent/80 rounded"
                      style={{ width: `${(c.sessions / max) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top locations with cities */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Top locations</h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
          {countries.length === 0 ? (
            <p className="text-text-body text-sm p-4">No data in this range yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                  <th className="px-4 py-2">Country</th>
                  <th className="px-4 py-2 text-right">Sessions</th>
                  <th className="px-4 py-2 text-right">Page views</th>
                  <th className="px-4 py-2 text-right">Conversions</th>
                  <th className="px-4 py-2 text-right">Conv %</th>
                  <th className="px-4 py-2">Top cities</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((c) => (
                  <tr key={c.country} className="border-b border-text-heading/5 last:border-0">
                    <td className="px-4 py-2 text-text-heading capitalize">{c.country}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(c.sessions)}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(c.page_views)}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(c.conversions)}</td>
                    <td className="px-4 py-2 text-right text-text-heading">
                      {convPct(c.conversions, c.sessions)}
                    </td>
                    <td className="px-4 py-2 text-text-body text-xs">
                      {c.cities.length
                        ? c.cities.map((x) => `${x.city} (${x.sessions})`).join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-text-body mt-2">
          Conversions = checkout-intent events (add-to-cart, checkout, newsletter,
          contact, register) folded from daily aggregates.
        </p>
      </div>

      <AnalyticsMultiExport section="devices" />
    </div>
  );
}
