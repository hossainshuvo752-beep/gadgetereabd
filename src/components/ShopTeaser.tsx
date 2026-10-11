"use client";

import React from 'react';
import Link from 'next/link';
import { products, type Product } from '@/lib/products';
import ProductCard from './ProductCard';

// Trending Picks = most-viewed first (views are simulated for now; replace
// with real view-tracking data when a backend exists). Computed once at
// module level; copied so the shared products array is never mutated.
const trendingProducts: Product[] = [...products].sort(
  (a, b) => b.views - a.views
);

/**
 * Homepage "Trending Picks" — renders the SAME ProductCard component used by
 * the Shop, Deals and New Arrivals pages (single source of truth for card
 * markup, images, badges and buttons). showDiscount stays false so the
 * desktop card keeps the exact look this section has always had; mobile
 * deal presentation comes from ProductCard itself.
 */
const ShopTeaser: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading pair (homepage multi-H1 pattern): the section
            title is an h1 and the description line directly below is a
            muted h2 subtext — visual look unchanged from the old h2. */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-heading">
              Trending Phones &amp; Gadgets with Prices in Bangladesh
            </h1>
            <h2 className="mt-1 text-sm font-normal text-text-body">
              Editor-picked phones and gadgets, priced in BDT
            </h2>
          </div>
          <Link href="/shop" className="text-accent hover:text-accent-hover font-medium shrink-0">
            View All in Shop →
          </Link>
        </div>

        {/* Responsive container: scrollable on mobile, row on desktop */}
        <div className="overflow-x-auto whitespace-nowrap px-4">
          <div className="inline-flex space-x-4">
            {trendingProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-72 whitespace-normal">
                <ProductCard product={product} showDiscount={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopTeaser;
