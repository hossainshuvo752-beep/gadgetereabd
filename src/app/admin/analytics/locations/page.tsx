import { loadBreakdowns } from '@/lib/analytics-queries';

export const dynamic = 'force-dynamic';

/** Locations (Cluster 6): where visitors come from, last 30 days. */
export default async function LocationsPage() {
  const { countries } = await loadBreakdowns(30);
  const nf = new Intl.NumberFormat('en-US');
  const max = Math.max(1, ...countries.map((c) => c.sessions));

  return (
    <div>
      <h2 className="text-lg font-bold text-text-heading mb-3">Countries — last 30 days</h2>
      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
        {countries.length === 0 ? (
          <p className="text-text-body text-sm p-4">
            No aggregated data yet — run a backfill first. Country values come
            from Vercel edge headers on the ingest API.
          </p>
        ) : (
          <ul className="divide-y divide-text-heading/5">
            {countries.map((c) => (
              <li key={c.name} className="px-4 py-2.5">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-heading font-medium">{c.name}</span>
                  <span className="text-text-heading">
                    {nf.format(c.sessions)} sessions
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
  );
}
