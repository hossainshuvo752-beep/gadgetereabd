'use client';

import { useState } from 'react';
import Link from 'next/link';
import { slugify, products, type Product } from '@/lib/products';
import PriceTag from '@/components/PriceTag';
import CategoryNav from '@/components/CategoryNav';
import NewsletterPopup from '@/components/NewsletterPopup';

/**
 * Listing pool: Quick Look focuses on phones (spec sheets, prices and
 * variants). The shared CategoryNav can still select other categories —
 * they simply show the empty state until non-phone products are added.
 */
const smartphoneProducts: Product[] = products.filter(
  (p) => p.category === 'Smartphones'
);

/**
 * Quick Look listing. Shares the exact same top CategoryNav bar as the
 * Shop page (hover dropdowns on desktop, tap-revealed sub-category chips
 * on touch, no counts, no result line). "All Products" shows the full
 * phone pool; a category narrows it; non-Mobile categories currently
 * render the empty state.
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
      ? smartphoneProducts
      : selectedSub === null
        ? smartphoneProducts.filter((p) => p.topCategory === selectedTop)
        : smartphoneProducts.filter(
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
                Quick Look currently focuses on phones — this category has no
                items yet.
              </p>
              <button
                onClick={() => handleSelect(null, null)}
                className="px-4 py-2 bg-accent text-text-on-dark text-sm font-medium rounded-md hover:bg-accent-hover transition-colors"
              >
                View all phones
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/quick-look/${slugify(product.title)}`}
                  className="group bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                  <div className="h-48 bg-bg-dark-secondary/10 flex items-center justify-center relative">
                    <span className="text-text-body text-sm">{product.imageAlt}</span>
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent-hover rounded-full">
                      {product.specSheet.basicInfo.brand}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-text-heading mb-2 group-hover:text-accent transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-text-body mb-2">
                      Released {product.specSheet.basicInfo.releaseDate}
                    </p>
                    <p className="text-sm text-text-body mb-3 line-clamp-2">
                      {product.specSheet.performance.processor}
                    </p>
                    {/* Confirmed vs estimated price with source tooltip */}
                    <div className="mb-4">
                      {product.price !== null ? (
                        <span className="text-sm">
                          <PriceTag product={product} hideOldPrice />
                        </span>
                      ) : (
                        <span className="text-text-body italic text-sm">
                          Coming Soon / Price Unavailable in Bangladesh
                        </span>
                      )}
                    </div>
                    <span className="mt-auto inline-flex items-center justify-center px-3 py-2 border border-accent text-accent rounded-md group-hover:bg-accent/10 transition-colors text-sm font-medium">
                      View Full Specs →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <NewsletterPopup />
    </>
  );
}
