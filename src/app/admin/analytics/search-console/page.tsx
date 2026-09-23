import { createAdminClient } from '@/lib/supabaseAdmin';
import { RefreshFromGoogleButton } from './RefreshFromGoogleButton';

export const dynamic = 'force-dynamic';

/**
 * Search Console page — CACHE-FIRST UI SHELL ONLY.
 *
 * This page renders the full Search Console layout (cards, trend, queries,
 * pages, index coverage, sitemap status, refresh button) from whatever is in
 * `search_console_cache`. It NEVER calls the Google API. The sync job that
 * would populate the cache is a documented stub — wiring it up needs:
 *   1. A Google Cloud service account added to the GSC property
 *      (Search Console API enabled).
 *   2. SEARCH_CONSOLE_PROPERTY_URI env var (sc-domain:… or https://…).
 *   3. A server-side sync routine (route or cron) that fetches
 *      searchAnalytics.query() and writes totals/trend/queries/pages/
 *      index_coverage/sitemaps into search_console_cache, enforcing the
 *      once-per-15-min rate limit (checked against cache.fetched_at).
 * TODO(external-api): implement the sync routine when credentials exist.
 * Every section below already handles both states (no snapshot / snapshot
 * present), so activating later needs NO UI changes.
 */

type Snapshot = {
  fetched_at: string | null;
  totals: { clicks?: number; impressions?: number; ctr?: number; position?: number } | null;
  trend: Array<{ date: string; clicks: number; impressions: number }> | null;
  queries: Array<{ query: string; clicks: number; impressions: number }> | null;
  pages: Array<{ page: string; clicks: number; impressions: number }> | null;
  coverage: Array<{ status: string; pages: number }> | null;
  sitemaps: Array<{ path: string; status: string; last_checked: string }> | null;
  last_error: { message: string; at: string } | null;
};

const nf = new Intl.NumberFormat('en-US');

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-text-body">{label}</p>
      <p className="text-2xl font-bold text-text-heading mt-1">{value}</p>
    </div>
  );
}

export default async function SearchConsolePage() {
  const db = createAdminClient();
  const { data } = await db
    .from('search_console_cache')
    .select('fetched_at, totals, trend, queries, pages, coverage, sitemaps, last_error')
    .eq('id', 'snapshot')
    .maybeSingle();

  const snap = (data ?? null) as Snapshot | null;
  const connected = Boolean(snap?.totals);
  const s = snap as Snapshot | null;
  const trend = s?.trend ?? [];
  const maxClicks = Math.max(1, ...trend.map((d) => d.clicks));
  const totals = s?.totals ?? null;
  const queries = s?.queries ?? [];
  const pages = s?.pages ?? [];
  const coverage = s?.coverage ?? [];
  const sitemaps = s?.sitemaps ?? [];

  return (
    <div className="space-y-8">
      <div className="bg-accent/10 border border-accent/40 rounded-lg p-4 text-sm text-text-heading">
        <strong>Not connected yet.</strong> This page renders the cached Search
        Console snapshot only — no live Google API calls are made. To activate:
        add a service account in Search Console → Settings → Users and
        permissions, set <code>SEARCH_CONSOLE_PROPERTY_URI</code>, and implement
        the sync stub documented in the page source. The UI below activates
        automatically once the cache has data.
      </div>

      {/* Refresh from Google (rate-limited to once per 15 min once live) */}
      <RefreshFromGoogleButton connected={connected} lastFetchedAt={snap?.fetched_at ?? null} />

      {/* Full shell always renders (empty states until the cache fills) */}
      <>
        {!connected && (
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6 text-sm text-text-body shadow-sm">
            No snapshot cached yet — the sections below will populate once the
            sync routine is implemented and run. This page needs no further
            changes to activate.
          </div>
        )}
        {connected && (
          <p className="text-xs text-text-body">
            Snapshot fetched: {s?.fetched_at ? new Date(s.fetched_at).toLocaleString('en-GB') : '—'}
          </p>
        )}

        {/* Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card label="Clicks" value={connected ? nf.format(totals?.clicks ?? 0) : '—'} />
          <Card label="Impressions" value={connected ? nf.format(totals?.impressions ?? 0) : '—'} />
          <Card label="CTR" value={connected ? `${((totals?.ctr ?? 0) * 100).toFixed(1)}%` : '—'} />
          <Card label="Avg position" value={connected ? (totals?.position ?? 0).toFixed(1) : '—'} />
        </div>

          {/* Daily trend */}
          <div>
            <h2 className="text-lg font-bold text-text-heading mb-3">Daily trend</h2>
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
              {trend.length === 0 ? (
                <p className="text-text-body text-sm">
                  {connected ? 'No trend data in the snapshot.' : 'Will show the daily clicks/impressions trend once connected.'}
                </p>
              ) : (
                <div className="flex items-end gap-1.5 h-32">
                  {trend.map((d) => (
                    <div key={d.date} className="flex-1 min-w-0 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-accent/80 rounded-t"
                        style={{ height: `${Math.max(4, (d.clicks / maxClicks) * 100)}%` }}
                        title={`${d.date}: ${d.clicks} clicks, ${d.impressions} impressions`}
                      />
                      <span className="text-[10px] text-text-body rotate-45 origin-top-left whitespace-nowrap">
                        {d.date.slice(5)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top queries */}
          <div>
            <h2 className="text-lg font-bold text-text-heading mb-3">Top queries</h2>
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
              {(queries ?? []).length === 0 ? (
                <p className="text-text-body text-sm p-4">
                  {connected ? 'No query data in the snapshot.' : 'Top search queries appear here once connected.'}
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                      <th className="px-4 py-2">Query</th>
                      <th className="px-4 py-2 text-right">Clicks</th>
                      <th className="px-4 py-2 text-right">Impressions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(queries ?? []).map((q) => (
                      <tr key={q.query} className="border-b border-text-heading/5 last:border-0">
                        <td className="px-4 py-2 text-text-heading">{q.query}</td>
                        <td className="px-4 py-2 text-right text-text-heading">{nf.format(q.clicks)}</td>
                        <td className="px-4 py-2 text-right text-text-heading">{nf.format(q.impressions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Performance per page */}
          <div>
            <h2 className="text-lg font-bold text-text-heading mb-3">Performance per page</h2>
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
              {(pages ?? []).length === 0 ? (
                <p className="text-text-body text-sm p-4">
                  {connected ? 'No page data in the snapshot.' : 'Per-page clicks and impressions appear here once connected.'}
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                      <th className="px-4 py-2">Page</th>
                      <th className="px-4 py-2 text-right">Clicks</th>
                      <th className="px-4 py-2 text-right">Impressions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(pages ?? []).map((p) => (
                      <tr key={p.page} className="border-b border-text-heading/5 last:border-0">
                        <td className="px-4 py-2 text-text-heading font-mono text-xs">{p.page}</td>
                        <td className="px-4 py-2 text-right text-text-heading">{nf.format(p.clicks)}</td>
                        <td className="px-4 py-2 text-right text-text-heading">{nf.format(p.impressions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Index coverage */}
          <div>
            <h2 className="text-lg font-bold text-text-heading mb-3">Index coverage</h2>
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
              {(coverage ?? []).length === 0 ? (
                <p className="text-text-body text-sm p-4">
                  {connected ? 'No coverage data in the snapshot.' : 'Index coverage (indexed / excluded / errors) appears here once connected.'}
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2 text-right">Pages</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(coverage ?? []).map((c) => (
                      <tr key={c.status} className="border-b border-text-heading/5 last:border-0">
                        <td className="px-4 py-2 text-text-heading capitalize">{c.status}</td>
                        <td className="px-4 py-2 text-right text-text-heading">{nf.format(c.pages)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Sitemap status */}
          <div>
            <h2 className="text-lg font-bold text-text-heading mb-3">Sitemap status</h2>
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
              {(sitemaps ?? []).length === 0 ? (
                <p className="text-text-body text-sm p-4">
                  {connected ? 'No sitemap data in the snapshot.' : 'Submitted sitemaps and their statuses appear here once connected.'}
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                      <th className="px-4 py-2">Sitemap</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Last checked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sitemaps ?? []).map((s) => (
                      <tr key={s.path} className="border-b border-text-heading/5 last:border-0">
                        <td className="px-4 py-2 text-text-heading font-mono text-xs">{s.path}</td>
                        <td className="px-4 py-2 text-text-heading">{s.status}</td>
                        <td className="px-4 py-2 text-text-body text-xs">{s.last_checked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
      </>

      {snap?.last_error && (
        <div className="bg-text-on-dark border border-red-300 rounded-lg p-4 text-sm text-text-heading">
          Last sync error: {snap.last_error.message}
        </div>
      )}
    </div>
  );
}
