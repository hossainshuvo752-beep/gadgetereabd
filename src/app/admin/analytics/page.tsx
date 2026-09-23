import { loadOverview, normalizeRange, funnelSteps } from '@/lib/analytics-queries';
import { BackfillButtons } from './BackfillButtons';
import { RangePicker } from './RangePicker';
import { OverviewSubscriberSearch } from './OverviewSubscriberSearch';

export const dynamic = 'force-dynamic';

/**
 * Analytics overview: everything range-driven (totals, funnel, trend, top
 * pages/products/categories/blog, per-source stats, newsletter, live clicks)
 * recalculates from the URL-selected date range. Today/yesterday stays a
 * fixed pair.
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

function rangeLabel(r: { from: string; to: string }): string {
  return r.from === r.to ? fmtDate(r.from) : `${fmtDate(r.from)} — ${fmtDate(r.to)}`;
}

function fmtDuration(secs: number): string {
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return `${Math.round(s / 3600)}h ago`;
}

/** Horizontal bar list (no chart lib — same pattern as the rest of admin). */
function BarList({
  title,
  rows,
  valueLabel,
}: {
  title: string;
  rows: Array<{ label: string; value: number; sub?: string }>;
  valueLabel: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      <h2 className="text-lg font-bold text-text-heading mb-3">{title}</h2>
      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <p className="text-text-body text-sm p-4">
            No data in this range yet — it appears as tracking events accumulate.
          </p>
        ) : (
          <ul className="divide-y divide-text-heading/5">
            {rows.map((r) => (
              <li key={r.label} className="px-4 py-2.5">
                <div className="flex items-center justify-between gap-4 text-sm mb-1">
                  <span className="text-text-heading font-medium truncate">{r.label}</span>
                  <span className="text-text-heading shrink-0">
                    {nf.format(r.value)} <span className="text-text-body text-xs">{valueLabel}</span>
                    {r.sub ? <span className="text-text-body text-xs"> · {r.sub}</span> : null}
                  </span>
                </div>
                <div className="h-1.5 bg-bg-light rounded overflow-hidden">
                  <div
                    className="h-full bg-accent/80 rounded"
                    style={{ width: `${(r.value / max) * 100}%` }}
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
  const funnel = funnelSteps(t);
  const maxFunnel = Math.max(1, funnel[0]?.value ?? 1);

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
            {rangeLabel(range)} · {nf.format(data.trend.length)} day
            {data.trend.length === 1 ? '' : 's'} of data
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

      {/* Purchase funnel */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Purchase funnel</h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
          <div className="space-y-2.5">
            {funnel.map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-text-heading font-medium">{step.label}</span>
                  <span className="text-text-heading">
                    {nf.format(step.value)}
                    {i > 0 ? (
                      <span className="text-text-body text-xs ml-2">
                        {((step.value / maxFunnel) * 100).toFixed(1)}% of sessions
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="h-2 bg-bg-light rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${i === 0 ? 'bg-text-heading/30' : 'bg-accent/80'}`}
                    style={{ width: `${Math.max(1.5, (step.value / maxFunnel) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily trend for the range */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">
          Daily trend — {days !== null ? `last ${days} days` : 'selected range'}
        </h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
          {data.trend.length === 0 ? (
            <p className="text-text-body text-sm">
              No aggregated days in this range — run <strong>Backfill</strong> to build
              reports for it.
            </p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {data.trend.map((d) => (
                <div key={d.date} className="flex-1 min-w-0 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-accent/80 rounded-t"
                    style={{ height: `${Math.max(4, (d.sessions / Math.max(1, ...data.trend.map((x) => x.sessions)))) * 100}%` }}
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

      {/* Traffic sources with per-source stats */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Traffic sources</h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
          {data.bySource.length === 0 ? (
            <p className="text-text-body text-sm p-4">No aggregated data in this range yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2 text-right">Sessions</th>
                  <th className="px-4 py-2 text-right">Sessions / day</th>
                  <th className="px-4 py-2 text-right">Avg session</th>
                  <th className="px-4 py-2 text-right">Bounce %</th>
                  <th className="px-4 py-2 text-right">Clicks</th>
                  <th className="px-4 py-2 text-right">Subs</th>
                </tr>
              </thead>
              <tbody>
                {data.bySource.map((s) => (
                  <tr key={s.source} className="border-b border-text-heading/5 last:border-0">
                    <td className="px-4 py-2 text-text-heading capitalize">{s.source}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(s.sessions)}</td>
                    <td className="px-4 py-2 text-right text-text-heading">
                      {s.sessions_per_day.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 text-right text-text-heading">
                      {fmtDuration(s.avg_session_seconds)}
                    </td>
                    <td className="px-4 py-2 text-right text-text-heading">{s.bounce_pct}%</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(s.clicks)}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(s.subscribes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Rankings */}
      <BarList
        title="Top pages"
        rows={data.topPages.map((p) => ({ label: p.page, value: p.views }))}
        valueLabel="views"
      />

      <BarList
        title="Top products"
        rows={data.topProducts.map((p) => ({ label: p.label, value: p.views }))}
        valueLabel="product views"
      />

      <BarList
        title="Top categories"
        rows={data.topCategories.map((c) => ({ label: c.label, value: c.views }))}
        valueLabel="product views"
      />

      {/* Top blog posts */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Top blog posts</h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
          {data.topBlogPosts.length === 0 ? (
            <p className="text-text-body text-sm p-4">No blog traffic in this range yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                  <th className="px-4 py-2">Post</th>
                  <th className="px-4 py-2 text-right">Views</th>
                  <th className="px-4 py-2 text-right">Card clicks</th>
                  <th className="px-4 py-2 text-right">Avg time</th>
                  <th className="px-4 py-2 text-right">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {data.topBlogPosts.map((p) => (
                  <tr key={p.title} className="border-b border-text-heading/5 last:border-0">
                    <td className="px-4 py-2 text-text-heading max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(p.views)}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{nf.format(p.card_clicks)}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{fmtDuration(p.avg_time)}</td>
                    <td className="px-4 py-2 text-right text-text-heading">{p.engagement}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-text-body mt-2">
          Engagement = average time on the post ÷ 60s (a “deep read” floor). Card clicks
          count header-search result clicks that led to a post.
        </p>
      </div>

      {/* Live outbound clicks */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">
          Live clicks feed — outbound links, last 24h
        </h2>
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
          {data.liveClicks.length === 0 ? (
            <p className="text-text-body text-sm p-4">
              No outbound link clicks recorded in the last 24 hours.
            </p>
          ) : (
            <ul className="divide-y divide-text-heading/5">
              {data.liveClicks.map((c, i) => (
                <li key={`${c.when}-${i}`} className="px-4 py-2.5 text-sm flex items-center justify-between gap-4">
                  <span className="text-text-heading truncate">
                    {c.title}{' '}
                    <span className="text-text-body text-xs font-mono">{c.url}</span>
                  </span>
                  <span className="text-text-body text-xs shrink-0">{timeAgo(c.when)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-xs text-text-body mt-2">
          Captured automatically from clicks on external links (affiliate / brand pages).
        </p>
      </div>

      {/* Newsletter */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-text-heading mb-3">Newsletter</h2>
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Subscribe rate" value={`${data.newsletterRate}%`} hint="subscribes ÷ popup impressions" />
            <Stat label="Total subscribes" value={nf.format(t.newsletter_subscribes)} />
          </div>
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden mt-4">
            {data.newsletterByCountry.length === 0 ? (
              <p className="text-text-body text-sm p-4">No impressions recorded in this range yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                    <th className="px-4 py-2">Country</th>
                    <th className="px-4 py-2 text-right">Impressions</th>
                    <th className="px-4 py-2 text-right">Subs</th>
                    <th className="px-4 py-2 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.newsletterByCountry.map((c) => (
                    <tr key={c.country} className="border-b border-text-heading/5 last:border-0">
                      <td className="px-4 py-2 text-text-heading capitalize">{c.country}</td>
                      <td className="px-4 py-2 text-right text-text-heading">{nf.format(c.shown)}</td>
                      <td className="px-4 py-2 text-right text-text-heading">{nf.format(c.subs)}</td>
                      <td className="px-4 py-2 text-right text-text-heading">{c.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <OverviewSubscriberSearch subscribers={data.subscribers} />
      </div>

      <BackfillButtons />
    </div>
  );
}
