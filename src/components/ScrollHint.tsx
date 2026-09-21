"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';

type ScrollHintProps = {
  /** The horizontally scrollable row content (chips etc.). */
  children: React.ReactNode;
  /** Accessible label for the row. */
  ariaLabel?: string;
  /** Classes for the scroll container itself (gap, alignment, padding…). */
  className?: string;
  /** Extra classes for the outer wrapper (margins etc.). */
  wrapperClassName?: string;
};

/**
 * MOBILE-ONLY affordance for horizontally scrollable chip rows (category
 * bars on Shop/Quick Look/Deals/New Arrivals and the blog filter chips):
 *
 * - While the row can still scroll right (scrollLeft + clientWidth <
 *   scrollWidth), a ~32px white→transparent gradient fades the right edge
 *   and a small circular chevron button sits on top of it.
 * - Tapping the chevron scrolls the row right by ~80% of its visible width
 *   (smooth); the chevron naturally walks toward the end as the row scrolls.
 * - The indicator (fade + button) disappears once the row is scrolled to
 *   the end — detected with a passive scroll listener plus a resize listener
 *   (rows can become non-overflowing on wider screens). No polling, and no
 *   custom wheel handlers (established project rule: native scrolling only).
 *
 * Desktop is never affected: the indicator renders only below the md
 * breakpoint (`md:hidden`) and `md:overflow-visible` on the row disables
 * overflow entirely at md+, so the listener stays idle there.
 */
export default function ScrollHint({
  children,
  ariaLabel,
  className = '',
  wrapperClassName = '',
}: ScrollHintProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    // +1 tolerance for sub-pixel rounding of scrollWidth on some devices.
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    update();
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // Fonts/images shifting widths after mount would otherwise leave a stale
    // indicator; rAF gives the browser one frame to lay the row out.
    const raf = requestAnimationFrame(update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, [update]);

  const nudgeRight = () => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      <div
        ref={rowRef}
        role="region"
        aria-label={ariaLabel}
        onScroll={update}
        /* flex IS the fix: without display:flex the row renders as a block
           (children stack vertically). flex-nowrap alone only sets wrap
           behavior. snap-x + child snap-start gives smooth swipe alignment;
           disabled at md+ where rows wrap instead of scrolling. */
        className={`flex flex-nowrap items-center overflow-x-auto hide-scrollbar snap-x snap-proximity [&>*]:snap-start md:snap-none ${className}`}
      >
        {children}
      </div>

      {/* Right-edge indicator — mobile only; gone once fully scrolled. */}
      {canScrollRight && (
        <div className="md:hidden absolute inset-y-0 right-0 flex items-center justify-end pointer-events-none">
          <span
            className="absolute inset-y-0 right-0 w-8 pointer-events-none"
            style={{
              background:
                'linear-gradient(to left, var(--color-bg-light), transparent)',
            }}
          />
          <button
            type="button"
            onClick={nudgeRight}
            aria-label="Scroll for more categories"
            className="relative mr-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-text-on-dark/90 border border-text-heading/15 shadow-sm pointer-events-auto"
          >
            <svg
              className="w-3.5 h-3.5 text-text-heading"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
