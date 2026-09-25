"use client";

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { slugify, priceForCartVariant } from '@/lib/products';

/**
 * Cart page — items come from the shared CartContext (populated by
 * "Add to Cart" buttons on product cards, persisted to localStorage).
 * Only confirmed-price products can be in the cart; qty +/−, remove,
 * and the order summary operate on the context directly.
 */

const DELIVERY_FEE = 150;

export default function CartPage() {
  const { items, changeQty, removeItem, findProduct, hydrated } = useCart();

  // Resolve to purchasable products only (context already enforces this on
  // write; this filter also guards stale/corrupted stored entries).
  const lines = items.flatMap((item) => {
    const product = findProduct(item.productId);
    if (!product || product.price === null || product.priceEstimated) return [];
    return [{ item, product }];
  });

  const subtotal = lines.reduce(
    (sum, { item, product }) => sum + (priceForCartVariant(product, item.variant).price as number) * item.qty,
    0
  );
  const total = subtotal + (lines.length > 0 ? DELIVERY_FEE : 0);
  const totalUnits = lines.reduce((n, { item }) => n + item.qty, 0);

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-8">Your Cart</h1>

        {!hydrated ? (
          // Avoid flashing the empty state before localStorage is read.
          <p className="text-text-body">Loading your cart…</p>
        ) : lines.length === 0 ? (
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-12 text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-text-heading mb-2">
              Your cart is empty
            </h2>
            <p className="text-text-body mb-6">
              Browse the shop and use “Add to Cart” on any product you like.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Go to Shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {lines.map(({ item, product }) => (
                <div
                  key={item.productId}
                  className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 flex flex-col sm:flex-row gap-4"
                >
                  {/* Image placeholder */}
                  <Link
                    href={`/shop/${slugify(product.title)}`}
                    className="shrink-0 w-full sm:w-28 h-28 bg-bg-dark-secondary/10 rounded-md flex items-center justify-center"
                  >
                    <span className="text-text-body text-xs px-2 text-center">
                      {product.imageAlt}
                    </span>
                  </Link>

                  {/* Info + qty + price */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/shop/${slugify(product.title)}`}
                          className="font-semibold text-text-heading hover:text-accent transition-colors line-clamp-2"
                        >
                          {product.title}
                        </Link>
                        <p className="text-xs text-text-body mt-1">
                          Variant: {item.variant}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${product.title} from cart`}
                        className="text-text-body hover:text-accent transition-colors text-sm font-medium shrink-0"
                      >
                        ✕ Remove
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center border border-text-heading/20 rounded-md overflow-hidden">
                        <button
                          onClick={() => changeQty(item.productId, -1)}
                          aria-label="Decrease quantity"
                          className="w-9 h-9 text-text-heading hover:bg-bg-light transition-colors"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-text-heading">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => changeQty(item.productId, 1)}
                          aria-label="Increase quantity"
                          className="w-9 h-9 text-text-heading hover:bg-bg-light transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-accent font-semibold">
                          ৳{((priceForCartVariant(product, item.variant).price as number) * item.qty).toLocaleString()}
                        </div>
                        <div className="text-xs text-text-body">
                          ৳{(priceForCartVariant(product, item.variant).price as number).toLocaleString()} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/shop"
                className="inline-block text-accent hover:text-accent-hover text-sm font-medium"
              >
                ← Continue shopping
              </Link>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-text-heading mb-4">
                  Order Summary
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-text-body">
                    <span>Subtotal ({totalUnits} items)</span>
                    <span className="text-text-heading">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-text-body">
                    <span>Delivery (inside Bangladesh)</span>
                    <span className="text-text-heading">
                      ৳{DELIVERY_FEE.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-text-heading/10 pt-3 mt-3 flex justify-between">
                    <span className="font-semibold text-text-heading">Total</span>
                    <span className="font-bold text-accent text-lg">
                      ৳{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="mt-6 block text-center px-5 py-3 bg-accent text-text-on-dark font-medium rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Proceed to Checkout →
                </Link>
                <p className="text-xs text-text-body mt-3 text-center">
                  Demo cart — checkout does not process real payments yet.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
