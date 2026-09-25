'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { slugify, products, type Product } from '@/lib/products';
import PriceTag from '@/components/PriceTag';
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
            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
              {/* MOBILE: 2 columns, compact cards (release date + processor
                  lines hidden md:block). DESKTOP: unchanged. */}
              {filtered.map((product) => (
                <Link
                  key={product.id}
                  href={`/quick-look/${slugify(product.title)}`}
                  className="group bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                  <div className="aspect-square bg-bg-dark-secondary/10 flex items-center justify-center relative overflow-hidden">
                    {/* Real photo when available; gray placeholder otherwise */}
                    {product.heroImage ? (
                      <Image
                        src={product.heroImage}
                        alt={product.imageAlt}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-contain p-2"
                      />
                    ) : (
                      <span className="text-text-body text-sm">{product.imageAlt}</span>
                    )}
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent-hover rounded-full">
                      {product.specSheet.basicInfo.brand}
                    </span>
                  </div>
                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <h3 className="text-sm md:text-base font-bold text-text-heading mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="hidden md:block text-xs text-text-body mb-2">
                      Released {product.specSheet.basicInfo.releaseDate}
                    </p>
                    <p className="hidden md:block text-sm text-text-body mb-3 line-clamp-2">
                      {product.specSheet.performance.processor}
                    </p>
                    {/* Confirmed vs estimated price with source tooltip */}
                    <div className="mb-4">
                      {product.price !== null ? (
                        <span className="text-sm">
                          <PriceTag product={product} hideOldPrice />
                        </span>
                      ) : (
                        <span className="text-text-body italic text-xs md:text-sm">
                          Coming Soon / Price Unavailable in Bangladesh
                        </span>
                      )}
                    </div>
                    <span className="mt-auto inline-flex items-center justify-center px-3 py-2 border border-accent text-accent rounded-md group-hover:bg-accent/10 transition-colors text-xs md:text-sm font-medium">
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
