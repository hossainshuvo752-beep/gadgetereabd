import { loadOverview } from '@/lib/analytics-queries';
import { BackfillButtons } from './BackfillButtons';

export const dynamic = 'force-dynamic';

/**
 * Analytics overview (Cluster 4): stat cards, 14-day trend, top pages,
 * and the funnel for the last 30 days — all from pre-aggregated data.
 */

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-text-body">{label}</p>
      <p className="text-2xl font-bold text-text-heading mt-1">{value}</p>
      {hint ? <p className="text-xs text-text-body mt-1">{hint}</p> : null}
    </div>
  );
}

const nf = new Intl.NumberFormat('en-US');

export default async function AnalyticsOverviewPage() {
  const data = await loadOverview();

  const t = data.totals30;
  const today = data.today?.totals;
  const yesterday = data.yesterday?.totals;
  const convRate = t.product_views
    ? ((t.add_to_cart / t.product_views) * 100).toFixed(1)
    : '0.0';

  // Simple inline bar chart for the 14-day sessions trend (no chart lib).
  const trend = data.trend.slice(-14);
  const maxSessions = Math.max(1, ...trend.map((d) => d.sessions));

  return (
    <div className="space-y-8">
      {data.staleDays.length > 0 && (
        <div className="bg-accent/10 border border-accent/40 text-text-heading rounded-lg p-3 text-sm">
          {data.staleDays.length} day(s) have outdated report versions — run{' '}
          <strong>Backfill</strong> below to rebuild them.
        </div>
      )}

      {/* Today / yesterday */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Today vs yesterday</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Sessions today"
            value={nf.format(today?.sessions ?? 0)}
            hint={`Yesterday: ${nf.format(yesterday?.sessions ?? 0)}`}
          />
          <Stat
            label="Page views today"
            value={nf.format(today?.page_views ?? 0)}
            hint={`Yesterday: ${nf.format(yesterday?.page_views ?? 0)}`}
          />
          <Stat
            label="Product views today"
            value={nf.format(today?.product_views ?? 0)}
            hint={`Yesterday: ${nf.format(yesterday?.product_views ?? 0)}`}
          />
          <Stat
            label="Conversions today"
            value={nf.format(
              (today?.newsletter_subscribes ?? 0) +
                (today?.contact_submits ?? 0) +
                (today?.registers ?? 0)
            )}
            hint={`Yesterday: ${nf.format(
              (yesterday?.newsletter_subscribes ?? 0) +
                (yesterday?.contact_submits ?? 0) +
                (yesterday?.registers ?? 0)
            )}`}
          />
        </div>
      </div>

      {/* 30-day totals */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Last 30 days</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Sessions" value={nf.format(t.sessions)} />
          <Stat label="Page views" value={nf.format(t.page_views)} />
          <Stat label="Product views" value={nf.format(t.product_views)} />
          <Stat label="Add to cart" value={nf.format(t.add_to_cart)} hint={`${convRate}% of product views`} />
          <Stat label="Checkouts" value={nf.format(t.checkouts)} />
          <Stat label="Newsletter subscribes" value={nf.format(t.newsletter_subscribes)} />
          <Stat label="Contact submits" value={nf.format(t.contact_submits)} />
          <Stat label="Registers" value={nf.format(t.registers)} />
        </div>
      </div>

      {/* Trend */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Sessions — last 14 days</h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
          {trend.length === 0 ? (
            <p className="text-text-body text-sm">
              No aggregated days yet — run <strong>Backfill</strong> to build the
              first reports.
            </p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {trend.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent/80 rounded-t"
                    style={{ height: `${Math.max(4, (d.sessions / maxSessions) * 100)}%` }}
                    title={`${d.date}: ${d.sessions} sessions, ${d.page_views} views`}
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

      {/* Top pages */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Top pages — 30 days</h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
          {data.topPages.length === 0 ? (
            <p className="text-text-body text-sm p-4">
              No page data yet — it appears after the first aggregation run.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                  <th className="px-4 py-2">Page</th>
                  <th className="px-4 py-2 text-right">Views</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((p) => (
                  <tr key={p.page} className="border-b border-text-heading/5 last:border-0">
                    <td className="px-4 py-2 text-text-heading font-mono text-xs">{p.page}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(p.views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <BackfillButtons />
    </div>
  );
}
