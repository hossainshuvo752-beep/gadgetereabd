'use client';

import React from 'react';

/**
 * "Refresh from Google" button — currently a stub. It renders the disabled
 * state explaining why: the GSC sync routine is not implemented (no API
 * credentials). When the sync route exists, wire the click to it and keep
 * the once-per-15-min rate limit (server should enforce it against
 * search_console_cache.fetched_at; the client hint is UX only).
 * TODO(external-api): call the sync route when credentials exist.
 */
export function RefreshFromGoogleButton({
  connected,
  lastFetchedAt,
}: {
  connected: boolean;
  lastFetchedAt: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled
        title="Search Console sync is not connected yet"
        className="px-4 py-2 bg-text-heading text-text-on-dark text-sm font-medium rounded-md opacity-40 cursor-not-allowed"
      >
        Refresh from Google
      </button>
      <span className="text-xs text-text-body">
        {connected
          ? `Last snapshot: ${lastFetchedAt ? new Date(lastFetchedAt).toLocaleString('en-GB') : '—'} · rate-limited to once per 15 min once live`
          : 'Requires the Search Console service-account connection (not yet set up).'}
      </span>
    </div>
  );
}
