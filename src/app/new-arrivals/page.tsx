'use client';

import { useState } from 'react';
import { products } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import CategoryNav from '@/components/CategoryNav';

/** Cap the listing at the most recent catalog entries per selection. */
const MAX_NEW_ARRIVALS = 12;

/**
 * New Arrivals. Reads the SAME shared product data (src/lib/products.ts),
 * sorted by `dateAdded` descending (newest catalog entries first) and
 * capped at the latest 12 — adding a product to the shared data makes it
 * appear here automatically; there is no separate "new arrivals" list.
 * The shared CategoryNav (same component as Shop/Quick Look/Deals)
 * filters within the sorted results.
 */
export default function NewArrivalsPage() {
  const [selectedTop, setSelectedTop] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const handleSelect = (top: string | null, sub: string | null) => {
    setSelectedTop(top);
    setSelectedSub(sub);
  };

  // Newest first, straight from the shared data (ISO dates sort as strings)
  const sorted = [...products].sort((a, b) =>
    b.dateAdded.localeCompare(a.dateAdded)
  );

  const filtered =
    selectedTop === null
      ? sorted.slice(0, MAX_NEW_ARRIVALS)
      : selectedSub === null
        ? sorted
            .filter((p) => p.topCategory === selectedTop)
            .slice(0, MAX_NEW_ARRIVALS)
        : sorted
            .filter(
              (p) =>
                p.topCategory === selectedTop && p.subCategory === selectedSub,
            )
            .slice(0, MAX_NEW_ARRIVALS);

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
              No products in this category yet
            </p>
            <p className="text-sm text-text-body mb-4">
              New arrivals land here automatically — check back soon.
            </p>
            <button
              onClick={() => handleSelect(null, null)}
              className="px-4 py-2 bg-accent text-text-on-dark text-sm font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              View latest arrivals
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} showReleasedYear />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
