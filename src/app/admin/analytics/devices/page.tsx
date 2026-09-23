import { loadBreakdowns } from '@/lib/analytics-queries';
import AnalyticsCsvButton from '@/components/admin/AnalyticsCsvButton';

export const dynamic = 'force-dynamic';

/**
 * Devices & Sources (Cluster 6): device / browser-platform / traffic-source
 * breakdowns for the last 30 days — straight from analytics_daily.
 */
export default async function DevicesPage() {
  const { devices, sources } = await loadBreakdowns(30);
  const nf = new Intl.NumberFormat('en-US');

  const table = (
    title: string,
    rows: Array<{ name: string; sessions: number; page_views: number }>,
    label: string
  ) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-text-heading">{title}</h2>
      </div>
      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <p className="text-text-body text-sm p-4">No aggregated data yet — run a backfill first.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                <th className="px-4 py-2">{label}</th>
                <th className="px-4 py-2 text-right">Sessions</th>
                <th className="px-4 py-2 text-right">Page views</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-text-heading/5 last:border-0">
                  <td className="px-4 py-2 text-text-heading capitalize">{r.name}</td>
                  <td className="px-4 py-2 text-right text-text-heading">{nf.format(r.sessions)}</td>
                  <td className="px-4 py-2 text-right text-text-heading">{nf.format(r.page_views)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {table('Devices', devices, 'Device')}
      {table('Traffic sources', sources, 'Source')}
      <AnalyticsCsvButton table="pages" />
    </div>
  );
}
