import {
  loadBreakdowns,
  normalizeRange,
  rangeDayCount,
} from '@/lib/analytics-queries';
import { RangePicker } from '../RangePicker';
import { AnalyticsMultiExport } from '@/components/admin/AnalyticsMultiExport';

export const dynamic = 'force-dynamic';

/**
 * Devices & Sources: device distribution + per-device conversion cards,
 * mobile-vs-desktop comparison, and per-OS / per-browser tables — all over
 * the selected date range. Device grain comes from analytics_daily; OS and
 * browser grains come from bounded raw-event queries (session-deduped).
 * Conversions = checkout-intent funnel events per session.
 */

const nf = new Intl.NumberFormat('en-US');

function convPct(conversions: number, sessions: number): string {
  return sessions ? `${((conversions / sessions) * 100).toFixed(1)}%` : '0.0%';
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-text-body">{label}</p>
      <p className="text-xl font-bold text-text-heading mt-1">{value}</p>
      {hint ? <p className="text-xs text-text-body mt-1">{hint}</p> : null}
    </div>
  );
}

function StatTable({
  title,
  rows,
  label,
  note,
}: {
  title: string;
  rows: Array<{ name: string; sessions: number; page_views: number; conversions: number }>;
  label: string;
  note?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-text-heading mb-3">{title}</h2>
      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-text-body text-sm p-4">No data in this range yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
                <th className="px-4 py-2">{label}</th>
                <th className="px-4 py-2 text-right">Sessions</th>
                <th className="px-4 py-2 text-right">Page views</th>
                <th className="px-4 py-2 text-right">Conversions</th>
                <th className="px-4 py-2 text-right">Conv %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-text-heading/5 last:border-0">
                  <td className="px-4 py-2 text-text-heading">{r.name}</td>
                  <td className="px-4 py-2 text-right text-text-heading">{nf.format(r.sessions)}</td>
                  <td className="px-4 py-2 text-right text-text-heading">{nf.format(r.page_views)}</td>
                  <td className="px-4 py-2 text-right text-text-heading">{nf.format(r.conversions)}</td>
                  <td className="px-4 py-2 text-right text-text-heading">
                    {convPct(r.conversions, r.sessions)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {note ? <p className="text-xs text-text-body mt-2">{note}</p> : null}
    </div>
  );
}

export default async function DevicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { range, days } = normalizeRange(params);
  const { devices, oses, browsers } = await loadBreakdowns(range);
  const nDays = rangeDayCount(range);

  const totalSessions = devices.reduce((a, d) => a + d.sessions, 0);
  const mobile = devices.find((d) => d.name === 'mobile');
  const desktop = devices.find((d) => d.name === 'desktop');
  const tablet = devices.find((d) => d.name === 'tablet');

  const rel =
    mobile && desktop && desktop.sessions > 0
      ? `${(mobile.sessions / desktop.sessions).toFixed(2)}×`
      : '—';

  return (
    <div className="space-y-8">
      <RangePicker activeDays={days} />

      {/* Device distribution + per-device conversion cards */}
      <div>
        <h2 className="text-lg font-bold text-text-heading mb-3">Device distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {devices.length === 0 ? (
            <p className="text-text-body text-sm">
              No aggregated data in this range — run a backfill first.
            </p>
          ) : (
            devices.map((d) => (
              <Stat
                key={d.name}
                label={d.name.charAt(0).toUpperCase() + d.name.slice(1)}
                value={nf.format(d.sessions)}
                hint={`${totalSessions ? ((d.sessions / totalSessions) * 100).toFixed(1) : '0.0'}% of sessions · conv ${convPct(
                  d.checkouts + d.subscribes,
                  d.sessions
                )} · avg ${d.sessions ? Math.round(d.seconds / d.sessions) : 0}s`}
              />
            ))
          )}
        </div>
      </div>

      {/* Mobile vs desktop relative comparison */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Mobile share"
          value={mobile && totalSessions ? `${((mobile.sessions / totalSessions) * 100).toFixed(1)}%` : '—'}
        />
        <Stat
          label="Desktop share"
          value={desktop && totalSessions ? `${((desktop.sessions / totalSessions) * 100).toFixed(1)}%` : '—'}
        />
        <Stat label="Mobile vs Desktop" value={rel} hint="mobile sessions per desktop session" />
        <Stat
          label="Tablet share"
          value={tablet && totalSessions ? `${((tablet.sessions / totalSessions) * 100).toFixed(1)}%` : '—'}
        />
      </div>

      <StatTable
        title="Operating systems"
        rows={oses}
        label="OS"
        note="Session-deduped from raw events in the selected range; conversions = sessions with a checkout-intent event."
      />
      <StatTable
        title="Browsers"
        rows={browsers}
        label="Browser"
        note="Same session-deduped method as the OS table."
      />

      <div className="flex items-center gap-3">
        <AnalyticsMultiExport section="devices" />
        <span className="text-xs text-text-body">
          Exports cover the selected range ({range.from} → {range.to}, {nDays} days).
        </span>
      </div>
    </div>
  );
}
