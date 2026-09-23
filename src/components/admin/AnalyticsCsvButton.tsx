import React from 'react';

/**
 * CSV download button for analytics exports — plain link; the admin session
 * cookie rides along automatically on same-origin requests.
 */
export default function AnalyticsCsvButton({
  table,
  rangeParams,
}: {
  table: string;
  /** Extra query params (e.g. from/to/days) appended to the export URL. */
  rangeParams?: string;
}) {
  const qs = rangeParams ? `&${rangeParams}` : '';
  return (
    <a
      href={`/api/analytics/export?table=${table}${qs}`}
      className="px-4 py-2 border border-text-heading/20 text-text-heading text-sm font-medium rounded-md hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
    >
      Download as CSV
    </a>
  );
}
