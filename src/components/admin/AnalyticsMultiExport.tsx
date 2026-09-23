'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import AnalyticsCsvButton from './AnalyticsCsvButton';

/**
 * Multi-format export buttons (CSV/JSON/Excel via the analytics export API;
 * PDF via the browser's print dialog). All formats automatically carry the
 * page's current date-range params so downloads match what the page shows.
 */
export function AnalyticsMultiExport({ section }: { section: string }) {
  const searchParams = useSearchParams();
  const rangeParams = ['days', 'from', 'to']
    .map((k) => {
      const v = searchParams.get(k);
      return v ? `${k}=${encodeURIComponent(v)}` : null;
    })
    .filter(Boolean)
    .join('&');

  const build = (fmt: string) =>
    `/api/analytics/export?table=${section}&format=${fmt}${rangeParams ? `&${rangeParams}` : ''}`;

  const openPrint = () => window.print();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnalyticsCsvButton table={section} rangeParams={rangeParams} />
      <a
        href={build('json')}
        className="px-3 py-1.5 text-sm rounded-md border border-text-heading/15 text-text-heading hover:bg-accent/10 hover:border-accent transition-colors"
      >
        JSON
      </a>
      <a
        href={build('xls')}
        className="px-3 py-1.5 text-sm rounded-md border border-text-heading/15 text-text-heading hover:bg-accent/10 hover:border-accent transition-colors"
      >
        Excel
      </a>
      <button
        type="button"
        onClick={openPrint}
        className="px-3 py-1.5 text-sm rounded-md border border-text-heading/15 text-text-heading hover:bg-accent/10 hover:border-accent transition-colors"
      >
        PDF
      </button>
    </div>
  );
}
