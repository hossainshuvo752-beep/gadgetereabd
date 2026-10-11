"use client";

import React from 'react';
import Link from 'next/link';
import { products, type Product } from '@/lib/products';
import ProductCard from './ProductCard';
import HomeSectionHeading from './HomeSectionHeading';

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
        {/* Centered section heading pair via the SHARED homepage heading
            component. The "View All in Shop →" link keeps working, now
            centered BELOW the heading/description (owner rule: the link
            stays visible and attached, just no longer on the right edge). */}
        <div className="text-center mb-6">
          <HomeSectionHeading
            title="Trending Phones & Gadgets with Prices in Bangladesh"
            support="Editor-picked phones and gadgets, priced in BDT"
            supportClassName="mb-3"
          />
          <Link href="/shop" className="inline-block text-accent hover:text-accent-hover font-medium">
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
