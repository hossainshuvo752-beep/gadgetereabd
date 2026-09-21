"use client";

import React from 'react';
import Link from 'next/link';
import { products, isPurchasable, isUpcoming, type Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import PriceTag from './PriceTag';

// Trending Picks = most-viewed first (views are simulated for now; replace
// with real view-tracking data when a backend exists). Computed once at
// module level; copied so the shared products array is never mutated.
const trendingProducts: Product[] = [...products].sort(
  (a, b) => b.views - a.views
);

const ShopTeaser: React.FC = () => {
  const { addToCart, notify } = useCart();

  return (
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-heading">Trending Picks</h2>
          <Link href="/shop" className="text-accent hover:text-accent-hover font-medium">
            View All in Shop →
          </Link>
        </div>

        {/* Responsive container: scrollable on mobile, row on desktop */}
        <div className="overflow-x-auto whitespace-nowrap px-4">
          <div className="inline-flex space-x-4">
            {trendingProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-72 bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative h-40 bg-bg-dark-secondary/10 flex items-center justify-center">
                  <span className="text-text-body text-sm">{product.imageAlt}</span>
                </div>
                <div className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-accent text-text-on-dark rounded-full mb-2">
                    {product.category}
                  </span>
                  <h3 className="text-lg font-bold text-text-heading mb-3 line-clamp-2">
                    {product.title}
                  </h3>
                  <div className="mb-4">
                    <PriceTag product={product} hideOldPrice />
                  </div>
                  <div className="flex gap-2">
                    {/* Add to Cart → cart context + toast; works for every
                        product (unpurchasable ones get an explanatory toast). */}
                    <button
                      onClick={() => addToCart(product.id, 1, 'Standard')}
                      className="flex-1 px-3 py-2 border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors text-sm font-medium"
                    >
                      Add to Cart
                    </button>
                    {/* Upcoming products: Pre-Order (simple confirmation).
                        Estimated-price products can't be ordered — Coming Soon. */}
                    {isUpcoming(product) ? (
                      <button
                        onClick={() => notify(`Pre-order request received: ${product.title}`)}
                        className="flex-1 px-3 py-2 bg-bg-dark text-text-on-dark font-medium rounded-md hover:bg-bg-dark-secondary transition-colors text-sm"
                      >
                        Pre-Order
                      </button>
                    ) : isPurchasable(product) ? (
                      <Link
                        href={`/checkout?id=${product.id}&qty=1&variant=Standard`}
                        className="flex-1 px-3 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors text-sm text-center"
                      >
                        Buy Now
                      </Link>
                    ) : (
                      <button
                        disabled
                        title={
                          product.priceEstimated
                            ? 'Estimated price only — Buy Now opens once an official Bangladesh price is confirmed'
                            : "Price coming soon — this product can't be ordered yet"
                        }
                        className="flex-1 px-3 py-2 bg-accent/50 text-text-on-dark font-medium rounded-md cursor-not-allowed text-sm"
                      >
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopTeaser;
