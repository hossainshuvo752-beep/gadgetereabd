import React from 'react';

type ProductGridProps = {
  children: React.ReactNode;
};

/**
 * THE shared product-listing grid — used by the Shop, Quick Look, Deals and
 * New Arrivals pages. One column recipe for all four so they can never drift
 * apart again:
 *   mobile: 2 columns → md: 3 columns → xl: 4 columns (desktop matches the
 *   Shop page's 4-up row).
 * Pages keep their own empty states and card mapping; this owns only the
 * grid container.
 */
export default function ProductGrid({ children }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
