'use client';

import { useState } from 'react';
import { products, type Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import CategoryNav from '@/components/CategoryNav';

/**
 * The Shop listing. Categories live in a horizontal top navigation bar
 * (src/components/CategoryNav.tsx, shared with Quick Look) with hover
 * dropdowns of sub-categories on desktop and a tap-revealed sub-category
 * chip row on touch devices — the former left sidebar filter was removed.
 * Selecting a top-level category shows every product in it (all its
 * sub-categories); selecting a sub-category narrows to just that sub.
 * "All Products" clears both filters.
 */
export default function ShopPage() {
  const [selectedTop, setSelectedTop] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const handleSelect = (top: string | null, sub: string | null) => {
    setSelectedTop(top);
    setSelectedSub(sub);
  };

  // Default sort: most-viewed first (views are simulated for now), applied
  // WITHIN the active category/sub-category filter. Copied before sorting —
  // never mutate the shared products array.
  const sortViewsDesc = (list: Product[]) =>
    [...list].sort((a, b) => b.views - a.views);

  const filtered = sortViewsDesc(
    selectedTop === null
      ? products
      : selectedSub === null
        ? products.filter((p) => p.topCategory === selectedTop)
        : products.filter(
            (p) => p.topCategory === selectedTop && p.subCategory === selectedSub,
          ),
  );

  return (
    <section className="py-12 bg-bg-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top horizontal category nav (shared with Quick Look) */}
        <CategoryNav
          selectedTop={selectedTop}
          selectedSub={selectedSub}
          onSelect={handleSelect}
        />

        {filtered.length === 0 ? (
          <div className="p-10 bg-text-on-dark border border-text-heading/10 rounded-lg text-center">
            <p className="text-text-heading font-semibold mb-1">
              No products found
            </p>
            <p className="text-sm text-text-body mb-4">
              Nothing in this category yet — check back soon.
            </p>
            <button
              onClick={() => handleSelect(null, null)}
              className="px-4 py-2 bg-accent text-text-on-dark text-sm font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              View all products
            </button>
          </div>
        ) : (
          <ProductGrid>
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        )}
      </div>
    </section>
  );
}
