'use client';

import { useState } from 'react';
import { products, type Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import CategoryNav from '@/components/CategoryNav';
import NewsletterPopup from '@/components/NewsletterPopup';

/**
 * Listing pool: the FULL shared catalog — same source as the Shop page.
 * Every product (phones, tablets, PCs, wearables, audio, cameras,
 * accessories, appliances) gets a spec-sheet Quick Look page.
 */
const allProducts: Product[] = products;

/**
 * Quick Look listing. Shares the exact same top CategoryNav bar as the
 * Shop page (hover dropdowns on desktop, tap-revealed sub-category chips
 * on touch, no counts, no result line) and the same full product pool —
 * "All Products" shows every item in the shared catalog.
 */
export default function QuickLookPage() {
  const [selectedTop, setSelectedTop] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const handleSelect = (top: string | null, sub: string | null) => {
    setSelectedTop(top);
    setSelectedSub(sub);
  };

  const filtered =
    selectedTop === null
      ? allProducts
      : selectedSub === null
        ? allProducts.filter((p) => p.topCategory === selectedTop)
        : allProducts.filter(
            (p) => p.topCategory === selectedTop && p.subCategory === selectedSub,
          );

  return (
    <>
      <section className="py-12 bg-bg-light min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top category nav — same shared component as Shop */}
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
                No items in this category yet — try another category or view
                everything.
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
                <ProductCard key={product.id} product={product} linkTo="/quick-look" />
              ))}
            </ProductGrid>
          )}
        </div>
      </section>
      <NewsletterPopup />
    </>
  );
}
