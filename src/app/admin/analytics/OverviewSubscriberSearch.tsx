'use client';

import React, { useMemo, useState } from 'react';
import type { SubscriberRow } from '@/lib/analytics-queries';

/**
 * Overview newsletter panel's subscriber list + client-side search box.
 * Search matches email / source / country / city, case-insensitive.
 */
export function OverviewSubscriberSearch({ subscribers }: { subscribers: SubscriberRow[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? subscribers.filter((s) =>
          [s.email, s.source, s.country, s.city]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(needle))
        )
      : subscribers;
    return list.slice(0, 50);
  }, [subscribers, q]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-lg font-bold text-text-heading">Subscribers</h2>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search subscribers…"
          className="px-3 py-1.5 text-sm border border-text-heading/20 rounded-md bg-white text-text-heading w-48"
        />
      </div>
      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-text-body text-sm p-4">
            {q ? 'No subscribers match that search.' : 'No subscribers yet.'}
          </p>
        ) : (
          <ul className="divide-y divide-text-heading/5 max-h-80 overflow-y-auto">
            {filtered.map((s) => (
              <li key={s.email} className="px-4 py-2.5 text-sm">
                <p className="text-text-heading truncate">{s.email}</p>
                <p className="text-text-body text-xs">
                  {[s.source, s.country, s.city].filter(Boolean).join(' · ') || '—'} ·{' '}
                  {new Date(s.subscribedAt).toLocaleDateString('en-GB')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
