'use client';

import { useState } from 'react';
import { products } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import CategoryNav from '@/components/CategoryNav';

/**
 * Deals listing. Reads the SAME shared product data (src/lib/products.ts)
 * and shows only products flagged `isDeal: true` — there is no separate
 * deals list anywhere. The shared CategoryNav (same component as Shop and
 * Quick Look) filters within the deals subset; "All Products" resets.
 */
export default function DealsPage() {
  const [selectedTop, setSelectedTop] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const handleSelect = (top: string | null, sub: string | null) => {
    setSelectedTop(top);
    setSelectedSub(sub);
  };

  // The deals subset, straight from the shared data (single source of truth)
  const dealPool = products.filter((p) => p.isDeal === true);

  const filtered =
    selectedTop === null
      ? dealPool
      : selectedSub === null
        ? dealPool.filter((p) => p.topCategory === selectedTop)
        : dealPool.filter(
            (p) => p.topCategory === selectedTop && p.subCategory === selectedSub,
          );

  return (
    <section className="bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryNav
          selectedTop={selectedTop}
          selectedSub={selectedSub}
          onSelect={handleSelect}
        />

        {filtered.length === 0 ? (
          <div className="p-10 bg-text-on-dark border border-text-heading/10 rounded-lg text-center">
            <p className="text-text-heading font-semibold mb-1">
              No deals in this category right now
            </p>
            <p className="text-sm text-text-body mb-4">
              Check the other categories — or come back soon.
            </p>
            <button
              onClick={() => handleSelect(null, null)}
              className="px-4 py-2 bg-accent text-text-on-dark text-sm font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              View all deals
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} showDiscount />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
