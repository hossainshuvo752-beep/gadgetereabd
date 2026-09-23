import { loadSearchAnalytics } from '@/lib/analytics-queries';
import AnalyticsCsvButton from '@/components/admin/AnalyticsCsvButton';

export const dynamic = 'force-dynamic';

/** Search analytics (Cluster 6): what visitors type into the header search. */
export default async function SearchPage() {
  const data = await loadSearchAnalytics(30);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-bold text-text-heading">Search queries — last 30 days</h2>
          <p className="text-xs text-text-body mt-0.5">
            Clicked results from the header search. Zero rows = no searches yet.
          </p>
        </div>
        <AnalyticsCsvButton table="search" />
      </div>

      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
        {data.rows.length === 0 ? (
          <p className="text-text-body text-sm p-4">
            No search clicks recorded yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                <th className="px-4 py-2">Query</th>
                <th className="px-4 py-2 text-right">Hits</th>
                <th className="px-4 py-2 text-right">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.q} className="border-b border-text-heading/5 last:border-0">
                  <td className="px-4 py-2 text-text-heading font-medium">{r.q}</td>
                  <td className="px-4 py-2 text-right text-accent font-semibold">{r.hits}</td>
                  <td className="px-4 py-2 text-right text-text-body text-xs">
                    {new Date(r.last_seen).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
