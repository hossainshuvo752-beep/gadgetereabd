"use client";

import React from 'react';
import { products, type Product } from '@/lib/products';
import ProductCard from './ProductCard';
import HomeSectionHeading from './HomeSectionHeading';
import ViewAllButton from './ViewAllButton';

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
            component — the old header-row "View All in Shop" link is
            replaced by the shared dark button BELOW the card row. */}
        <HomeSectionHeading
          title="Trending Phones & Gadgets with Prices in Bangladesh"
          support="Editor-picked phones and gadgets, priced in BDT"
        />

        {/* Responsive container: scrollable on mobile, row on desktop */}
        <div className="overflow-x-auto whitespace-nowrap px-4">
          <div className="inline-flex space-x-4">
            {trendingProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-72 whitespace-normal">
                {/* Homepage Trending Picks reuses the Shop listing card, so it
                    reports as shop-card — no hand-edited button logic here. */}
                <ProductCard product={product} showDiscount={false} surface="shop-card" />
              </div>
            ))}
          </div>
        </div>

        {/* Single "View all" control for this section — the shared dark
            button, centered under the scrollable row. */}
        <ViewAllButton href="/shop" label="View All in Shop" />
      </div>
    </section>
  );
};

export default ShopTeaser;
