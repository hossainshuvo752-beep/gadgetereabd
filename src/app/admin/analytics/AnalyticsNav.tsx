'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Analytics section nav. Carries the currently selected date range
 * (?days= / ?from=&to=) into every tab link, so switching between Overview →
 * Devices → Search etc. keeps the active range instead of resetting to the
 * default 30 days. Range params are stripped on Realtime (no range concept
 * there).
 */
const NAV = [
  { href: '/admin/analytics', label: 'Overview', keepRange: true },
  { href: '/admin/analytics/realtime', label: 'Realtime', keepRange: false },
  { href: '/admin/analytics/devices', label: 'Devices & Sources', keepRange: true },
  { href: '/admin/analytics/locations', label: 'Locations', keepRange: true },
  { href: '/admin/analytics/search', label: 'Search', keepRange: true },
  { href: '/admin/analytics/subscribers', label: 'Subscribers', keepRange: true },
  { href: '/admin/analytics/search-console', label: 'Search Console', keepRange: false },
];

export function AnalyticsNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rangeParams = ['days', 'from', 'to']
    .map((k) => {
      const v = searchParams.get(k);
      return v ? `${k}=${encodeURIComponent(v)}` : null;
    })
    .filter(Boolean)
    .join('&');

  return (
    <nav className="flex flex-wrap gap-2 mb-8">
      {NAV.map((item) => {
        const active = pathname === item.href;
        const qs = item.keepRange && rangeParams ? `?${rangeParams}` : '';
        return (
          <Link
            key={item.href}
            href={`${item.href}${qs}`}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              active
                ? 'bg-accent text-text-on-dark border-accent'
                : 'border-text-heading/15 text-text-heading hover:bg-accent/10 hover:border-accent'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
