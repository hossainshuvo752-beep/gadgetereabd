'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Manual aggregation triggers (admin cookie authorizes the cron route).
 * - Backfill: re-aggregate the last N days (default 3, max 60)
 * - Re-run today: rebuild today's report from raw events
 */
export function BackfillButtons() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [days, setDays] = useState(3);

  const call = async (query: string, label: string) => {
    setBusy(label);
    setMessage(null);
    try {
      const res = await fetch(`/api/analytics/cron${query}`, { method: 'POST' });
      const json = (await res.json()) as {
        ok: boolean;
        aggregated?: string[];
        error?: string;
      };
      setMessage(
        json.ok
          ? `Done: ${(json.aggregated ?? []).join(', ') || 'day rebuilt'}`
          : `Failed: ${json.error ?? 'unknown error'}`
      );
      if (json.ok) router.refresh();
    } catch {
      setMessage('Network error — try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-bold text-text-heading mb-2">Aggregation controls</h3>
      <p className="text-xs text-text-body mb-3">
        Raw events are folded into daily reports here (also runs nightly via
        Vercel cron at 01:15 UTC). Idempotent — re-running a day never
        double-counts.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-text-heading">
          Days:
          <input
            type="number"
            min={1}
            max={60}
            value={days}
            onChange={(e) => setDays(Math.min(60, Math.max(1, Number(e.target.value) || 1)))}
            className="ml-2 w-16 px-2 py-1 border border-text-heading/20 rounded-md"
          />
        </label>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => call(`?days=${days}`, 'backfill')}
          className="px-4 py-2 bg-accent text-text-on-dark text-sm font-medium rounded-md hover:bg-accent/90 disabled:opacity-50"
        >
          {busy === 'backfill' ? 'Aggregating…' : 'Backfill'}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => call('', 'today')}
          className="px-4 py-2 border border-accent text-accent text-sm font-medium rounded-md hover:bg-accent/10 disabled:opacity-50"
        >
          {busy === 'today' ? 'Running…' : 'Re-run today'}
        </button>
      </div>
      {message && <p className="text-xs text-text-heading mt-2">{message}</p>}
    </div>
  );
}
