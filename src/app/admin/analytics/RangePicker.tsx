'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

/**
 * Date-range control for the analytics overview.
 * - Preset buttons (7/30/90 days) and a custom start/end picker.
 * - Both work by pushing URL search params (`days` or `from`+`to`), so the
 *   server component re-queries analytics_reports for exactly that range —
 *   the data itself is filtered, not just the UI.
 * - Custom pickers use `min`/`max` clamps; an inverted or oversized span is
 *   additionally normalized server-side (see normalizeRange).
 */

const PRESETS = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
] as const;

// The custom picker never offers dates outside the site's data lifetime.
const MIN_DATE = '2026-09-01'; // first analytics data (live since 2026-09-23 backfill)

export function RangePicker({ activeDays }: { activeDays: number | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const push = (params: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const k of ['days', 'from', 'to']) next.delete(k);
    for (const [k, v] of Object.entries(params)) next.set(k, v);
    router.push(`${pathname}?${next.toString()}`);
  };

  const applyPreset = (days: number) => push({ days: String(days) });

  const applyCustom = () => {
    if (!from || !to) {
      setError('Pick both a start and an end date.');
      return;
    }
    if (from > to) {
      setError('Start date must be on or before the end date.');
      return;
    }
    setError(null);
    push({ from, to });
  };

  const clearCustom = () => {
    setFrom('');
    setTo('');
    setError(null);
    applyPreset(30);
  };

  const inputCls =
    'px-2 py-1.5 text-sm border border-text-heading/20 rounded-md bg-white text-text-heading';

  return (
    <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => {
          const active = activeDays === p.days;
          return (
            <button
              key={p.days}
              type="button"
              onClick={() => applyPreset(p.days)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                active
                  ? 'bg-accent text-text-on-dark border-accent'
                  : 'border-text-heading/15 text-text-heading hover:bg-accent/10 hover:border-accent'
              }`}
            >
              {p.label}
            </button>
          );
        })}

        <span className="mx-1 h-5 w-px bg-text-heading/15" aria-hidden />

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={from}
            min={MIN_DATE}
            max={today}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="Start date"
            className={inputCls}
          />
          <span className="text-text-body text-sm">→</span>
          <input
            type="date"
            value={to}
            min={from || MIN_DATE}
            max={today}
            onChange={(e) => setTo(e.target.value)}
            aria-label="End date"
            className={inputCls}
          />
          <button
            type="button"
            onClick={applyCustom}
            className="px-3 py-1.5 text-sm rounded-md bg-text-heading text-text-on-dark hover:opacity-90"
          >
            Apply
          </button>
          {activeDays === null && (
            <button
              type="button"
              onClick={clearCustom}
              className="px-3 py-1.5 text-sm rounded-md border border-text-heading/15 text-text-body hover:bg-accent/10"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
