import { createAdminClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Search Console page (Cluster 6) — CACHE-FIRST only.
 *
 * This page reads whatever is in `search_console_cache` and renders it.
 * It NEVER calls the Google API. The sync job that would populate the
 * cache is a documented stub (see below) — wiring it up needs:
 *   1. A Google Cloud service account shared with the GSC property
 *      (Search Console API enabled).
 *   2. SEARCH_CONSOLE_PROPERTY_URI env var (sc-domain:… or https://…).
 *   3. A server-side sync routine (route or cron) that fetches
 *      searchAnalytics.query() and writes totals/trend/queries/pages
 *      into search_console_cache.
 * TODO(external-api): implement the sync routine when credentials exist.
 */

type Snapshot = {
  fetched_at: string | null;
  totals: { clicks?: number; impressions?: number; ctr?: number; position?: number } | null;
  trend: Array<{ date: string; clicks: number; impressions: number }> | null;
  queries: Array<{ query: string; clicks: number; impressions: number }> | null;
  pages: Array<{ page: string; clicks: number }> | null;
  last_error: { message: string; at: string } | null;
};

const nf = new Intl.NumberFormat('en-US');

export default async function SearchConsolePage() {
  const db = createAdminClient();
  const { data } = await db
    .from('search_console_cache')
    .select('fetched_at, totals, trend, queries, pages, last_error')
    .eq('id', 'snapshot')
    .maybeSingle();

  const snap = (data ?? null) as Snapshot | null;

  return (
    <div className="space-y-6">
      <div className="bg-accent/10 border border-accent/40 rounded-lg p-4 text-sm text-text-heading">
        <strong>Not connected.</strong> This page renders the cached Search
        Console snapshot only. The live sync is deliberately not implemented
        yet (no Google API credentials) — see the TODO in the page source for
        the exact wiring steps.
      </div>

      {!snap || !snap.totals ? (
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6 text-sm text-text-body shadow-sm">
          No snapshot cached yet. Once the sync stub is implemented, data will
          appear here automatically — this page needs no changes.
        </div>
      ) : (
        <>
          <p className="text-xs text-text-body">
            Snapshot fetched: {snap.fetched_at ? new Date(snap.fetched_at).toLocaleString('en-GB') : '—'}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-text-body">Clicks</p>
              <p className="text-2xl font-bold text-text-heading mt-1">{nf.format(snap.totals.clicks ?? 0)}</p>
            </div>
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-text-body">Impressions</p>
              <p className="text-2xl font-bold text-text-heading mt-1">{nf.format(snap.totals.impressions ?? 0)}</p>
            </div>
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-text-body">CTR</p>
              <p className="text-2xl font-bold text-text-heading mt-1">{((snap.totals.ctr ?? 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-text-body">Avg position</p>
              <p className="text-2xl font-bold text-text-heading mt-1">{(snap.totals.position ?? 0).toFixed(1)}</p>
            </div>
          </div>
        </>
      )}

      {snap?.last_error && (
        <div className="bg-text-on-dark border border-red-300 rounded-lg p-4 text-sm text-text-heading">
          Last sync error: {snap.last_error.message}
        </div>
      )}
    </div>
  );
}
