'use client';

import React, { useMemo, useState } from 'react';
import AnalyticsCsvButton from '@/components/admin/AnalyticsCsvButton';
import type { SubscriberRow } from '@/lib/analytics-queries';

/**
 * SubscriberTable (Cluster 5) — searchable, sortable newsletter list with
 * the source/country/city enrichment columns. Client interactivity over
 * rows that were loaded server-side and passed in as props.
 */

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function SubscriberTable({ rows }: { rows: SubscriberRow[] }) {
  const [query, setQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? rows.filter(
          (r) =>
            r.email.toLowerCase().includes(q) ||
            (r.source ?? '').toLowerCase().includes(q) ||
            (r.country ?? '').toLowerCase().includes(q) ||
            (r.city ?? '').toLowerCase().includes(q)
        )
      : rows;
    return [...list].sort((a, b) =>
      sortAsc
        ? a.subscribedAt.localeCompare(b.subscribedAt)
        : b.subscribedAt.localeCompare(a.subscribedAt)
    );
  }, [rows, query, sortAsc]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search email, source, country…"
          className="w-full sm:w-72 px-3 py-2 border border-text-heading/20 rounded-md text-sm text-text-heading placeholder:text-text-body/60 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortAsc((v) => !v)}
            className="px-3 py-2 text-sm border border-text-heading/20 rounded-md text-text-heading hover:border-accent hover:text-accent"
          >
            Date {sortAsc ? '↑' : '↓'}
          </button>
          <AnalyticsCsvButton table="subscribers" />
        </div>
      </div>

      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-text-body border-b border-text-heading/10">
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Country</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-text-body">
                  {rows.length === 0
                    ? 'No subscribers yet.'
                    : 'No subscribers match that search.'}
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.email} className="border-b border-text-heading/5 last:border-0">
                  <td className="px-4 py-2 text-text-heading">{r.email}</td>
                  <td className="px-4 py-2 text-text-heading">{r.source ?? '—'}</td>
                  <td className="px-4 py-2 text-text-heading">{r.country ?? '—'}</td>
                  <td className="px-4 py-2 text-text-heading">{r.city ?? '—'}</td>
                  <td className="px-4 py-2 text-text-body text-xs">
                    {r.subscribedAt ? dateFmt.format(new Date(r.subscribedAt)) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-text-body">{filtered.length} of {rows.length} subscribers</p>
    </div>
  );
}
