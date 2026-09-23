"use client";

import React from 'react';

/**
 * CSV download button — a plain link to the server-side export route.
 * The admin session cookie rides along automatically on same-origin
 * requests, so no fetch/client logic is needed here.
 */
export default function AdminCsvButton({
  table,
  label,
}: {
  table: 'users' | 'messages';
  label: string;
}) {
  return (
    <a
      href={`/api/admin/csv?table=${table}`}
      className="px-4 py-2 border border-text-heading/20 text-text-heading text-sm font-medium rounded-md hover:border-accent hover:text-accent transition-colors whitespace-nowrap"
    >
      {label}
    </a>
  );
}
