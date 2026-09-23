import { loadOverview, normalizeRange, type DateRange } from '@/lib/analytics-queries';
import { BackfillButtons } from './BackfillButtons';
import { RangePicker } from './RangePicker';

export const dynamic = 'force-dynamic';

/**
 * Analytics overview: stat cards, sessions trend, top pages — all computed
 * over a selectable date range (presets 7/30/90 or a custom start/end pair).
 * The range lives in the URL (?days=N or ?from=...&to=...), so the server
 * component re-queries analytics_reports for exactly that window; the picker
 * is real filtering, not cosmetic.
 *
 * "Today vs yesterday" stays a fixed pair — it is deliberately not part of
 * the range selection.
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

function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function rangeLabel(r: DateRange): string {
  return r.from === r.to ? fmtDate(r.from) : `${fmtDate(r.from)} — ${fmtDate(r.to)}`;
}

export default async function AnalyticsOverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { range, days } = normalizeRange(params);
  const data = await loadOverview(range);

  const t = data.totals;
  const today = data.today?.totals;
  const yesterday = data.yesterday?.totals;
  const convRate = t.product_views
    ? ((t.add_to_cart / t.product_views) * 100).toFixed(1)
    : '0.0';

  // Inline bar chart for the range's sessions trend (no chart lib). With long
  // custom ranges flex-1 bars get thinner on their own; labels rotate and
  // squeeze, which stays readable without extra logic.
  const trend = data.trend;
  const maxSessions = Math.max(1, ...trend.map((d) => d.sessions));

  return (
    <div className="space-y-8">
      {data.staleDays.length > 0 && (
        <div className="bg-accent/10 border border-accent/40 text-text-heading rounded-lg p-3 text-sm">
          {data.staleDays.length} day(s) have outdated report versions — run{' '}
          <strong>Backfill</strong> below to rebuild them.
        </div>
      )}

      <RangePicker activeDays={days} />

      {/* Today / yesterday (fixed window, independent of the range) */}
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

      {/* Range totals */}
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 mb-3">
          <h2 className="text-lg font-bold text-text-heading">
            {days !== null ? `Last ${days} days` : 'Selected range'}
          </h2>
          <span className="text-sm text-text-body">
            {rangeLabel(range)} · {trend.length} day{trend.length === 1 ? '' : 's'} of data
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Sessions" value={nf.format(t.sessions)} />
          <Stat label="Page views" value={nf.format(t.page_views)} />
          <Stat label="Visitors" value={nf.format(t.visitors)} />
          <Stat label="Product views" value={nf.format(t.product_views)} />
          <Stat label="Add to cart" value={nf.format(t.add_to_cart)} hint={`${convRate}% of product views`} />
          <Stat label="Checkouts" value={nf.format(t.checkouts)} />
          <Stat label="Newsletter subscribes" value={nf.format(t.newsletter_subscribes)} />
          <Stat
            label="Contact submits + registers"
            value={nf.format(t.contact_submits + t.registers)}
            hint={`${nf.format(t.contact_submits)} contact · ${nf.format(t.registers)} registered`}
          />
        </div>
      </div>

      {/* Trend */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">
          Sessions — {days !== null ? `last ${Math.min(14, days)}` : ''} trend within range
        </h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
          {trend.length === 0 ? (
            <p className="text-text-body text-sm">
              No aggregated days in this range — run <strong>Backfill</strong> to build
              reports for it.
            </p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {trend.map((d) => (
                <div key={d.date} className="flex-1 min-w-0 flex flex-col items-center gap-1">
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
        <h2 className="text-lg font-bold text-text-heading mb-3">
          Top pages — {days !== null ? `last ${days} days` : 'selected range'}
        </h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
          {data.topPages.length === 0 ? (
            <p className="text-text-body text-sm p-4">
              No page data in this range yet — it appears after aggregation runs for
              those days.
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
