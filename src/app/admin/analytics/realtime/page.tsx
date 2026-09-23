import { loadRealtime } from '@/lib/analytics-queries';

export const dynamic = 'force-dynamic';

/**
 * Realtime panel (Cluster 5): what is happening RIGHT NOW — bounded raw
 * queries over the last 30 min only. Refresh via the browser (or the nav
 * link); no polling websocket complexity for this scale.
 */

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export default async function RealtimePage() {
  const data = await loadRealtime();

  return (
    <div className="space-y-6">
      {/* No RangePicker here, by design: realtime means the last few minutes
          of live activity. Historical ranges belong to the other tabs. */}
      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-3 text-xs text-text-body">
        <strong className="text-text-heading">Live view — no date range.</strong> This
        page always shows the last few minutes of activity (active sessions over 5
        min, event stream over 30 min). For historical windows use the range picker
        on the other analytics tabs.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-text-body">Active sessions (5 min)</p>
          <p className="text-3xl font-bold text-text-heading mt-1">{data.activeSessions}</p>
        </div>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-text-body">Page views (30 min)</p>
          <p className="text-3xl font-bold text-text-heading mt-1">{data.pageViewsLast30}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Visitors on pages right now</h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
          {data.topActivePages.length === 0 ? (
            <p className="text-text-body text-sm p-4">No active visitors in the last 5 minutes.</p>
          ) : (
            <ul className="divide-y divide-text-heading/5">
              {data.topActivePages.map((p) => (
                <li key={p.page} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span className="font-mono text-xs text-text-heading">{p.page}</span>
                  <span className="text-accent font-semibold">{p.sessions}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Event stream — last 30 min</h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
          {data.eventsLast30.length === 0 ? (
            <p className="text-text-body text-sm p-4">
              No events yet. Browse the site in another tab — events appear here within seconds.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Event</th>
                  <th className="px-4 py-2">Page</th>
                  <th className="px-4 py-2">Device</th>
                  <th className="px-4 py-2">Country</th>
                </tr>
              </thead>
              <tbody>
                {data.eventsLast30.map((e, i) => (
                  <tr key={`${e.created_at}-${i}`} className="border-b border-text-heading/5 last:border-0">
                    <td className="px-4 py-2 text-text-body text-xs">{timeFmt.format(new Date(e.created_at))}</td>
                    <td className="px-4 py-2 text-accent font-medium">{e.event}</td>
                    <td className="px-4 py-2 font-mono text-xs text-text-heading">{e.page}</td>
                    <td className="px-4 py-2 text-text-heading">{e.device}</td>
                    <td className="px-4 py-2 text-text-heading">{e.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
