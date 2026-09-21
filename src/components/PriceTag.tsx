import React from 'react';
import type { Product } from '@/lib/products';

/**
 * THE shared price display — use it everywhere a product price is shown
 * (cards, teasers, listings, detail pages, search results). Renders:
 * - Confirmed price:  ৳X,XX,XXX  (+ struck-through oldPrice when on deal)
 * - Estimated price:  "Estimated Price: ৳X,XXX" — clearly labeled, never
 *   presented as a confirmed number.
 * The product's `priceNote` rides along as a native tooltip on every surface;
 * pass `detailed` to also show the note as visible text (product detail pages).
 * Pure component (no hooks/handlers) — safe in both server and client trees.
 */
export default function PriceTag({
  product,
  detailed = false,
  hideOldPrice = false,
  className = '',
}: {
  product: Product;
  /** Show the price note as visible text under the price (detail pages). */
  detailed?: boolean;
  /** Suppress the struck-through old price (e.g. cards outside the Deals page). */
  hideOldPrice?: boolean;
  /** Extra classes for the price line (e.g. text-xl / text-3xl size overrides). */
  className?: string;
}) {
  if (product.price === null) {
    // Defensive: no current catalog product has a null price, but keep a
    // safe fallback in case one is ever added without a price.
    return (
      <span className={`italic text-text-body ${className}`}>Price unavailable</span>
    );
  }

  const isDeal =
    !hideOldPrice && product.oldPrice !== null && product.oldPrice > product.price;
  const note = product.priceNote ?? '';

  return (
    <span title={note || undefined} className={`inline-block ${className}`}>
      {product.priceEstimated && (
        <span className="text-xs font-medium text-text-body">Estimated Price: </span>
      )}
      <span className="font-semibold text-accent">
        ৳{product.price.toLocaleString()}
      </span>
      {isDeal && (
        <span className="ml-1.5 text-sm text-text-body line-through">
          ৳{product.oldPrice!.toLocaleString()}
        </span>
      )}
      {detailed && note && (
        <span className="mt-2 block text-xs font-normal text-text-body">
          {note}
        </span>
      )}
    </span>
  );
}
