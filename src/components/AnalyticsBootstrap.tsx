'use client';

import { useEffect } from 'react';

/**
 * AnalyticsBootstrap — mounted ONCE in the root layout (inside <body>).
 * Lazy-loads the tracker after the page is interactive so it has zero
 * effect on page load; every send is fire-and-forget (sendBeacon).
 * Renders nothing.
 */
export default function AnalyticsBootstrap() {
  useEffect(() => {
    const start = () => {
      void import('@/lib/tracking').then((m) => m.initTracking());
    };
    const idle =
      window.requestIdleCallback?.(start) ?? window.setTimeout(start, 1200);
    return () => {
      window.cancelIdleCallback?.(idle as number);
      window.clearTimeout(idle as number);
    };
  }, []);

  return null;
}
