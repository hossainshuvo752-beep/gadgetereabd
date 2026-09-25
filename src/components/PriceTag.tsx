import React from 'react';
import type { Product, ResolvedPrice } from '@/lib/products';

/**
 * THE shared price display — use it everywhere a product price is shown
 * (cards, teasers, listings, detail pages, search results). Renders:
 * - Confirmed price:  ৳X,XX,XXX  (+ struck-through oldPrice when on deal)
 * - Estimated price:  "Estimated Price: ৳X,XXX" — clearly labeled, never
 *   presented as a confirmed number.
 * The product's `priceNote` rides along as a native tooltip on every surface;
 * pass `detailed` to also show the note as visible text (product detail pages).
 * Pure component (no hooks/handlers) — safe in both server and client trees.
 *
 * `resolved` (optional) overrides the product's flat price with the SELECTED
 * VARIANT's resolved pricing (variantPrice()). When absent, flat fields are
 * used exactly as before — all existing call sites keep their behavior.
 */
export default function PriceTag({
  product,
  detailed = false,
  hideOldPrice = false,
  className = '',
  resolved,
}: {
  product: Product;
  /** Show the price note as visible text under the price (detail pages). */
  detailed?: boolean;
  /** Suppress the struck-through old price (e.g. cards outside the Deals page). */
  hideOldPrice?: boolean;
  /** Extra classes for the price line (e.g. text-xl / text-3xl size overrides). */
  className?: string;
  /** Variant-resolved pricing override (from variantPrice()); omit for flat. */
  resolved?: ResolvedPrice;
}) {
  const price = resolved ? resolved.price : product.price;
  const oldPrice = resolved ? resolved.oldPrice : product.oldPrice;
  const priceEstimated = resolved ? resolved.priceEstimated : product.priceEstimated;

  if (price === null) {
    // No price (flat or variant) — honest fallback, never an invented number.
    return (
      <span className={`italic text-text-body ${className}`}>Price unavailable</span>
    );
  }

  const isDeal = !hideOldPrice && oldPrice !== null && oldPrice > price;
  const note = product.priceNote ?? '';

  return (
    <span title={note || undefined} className={`inline-block ${className}`}>
      {priceEstimated && (
        <span className="text-xs font-medium text-text-body">Estimated Price: </span>
      )}
      <span className="font-semibold text-accent">
        ৳{price.toLocaleString()}
      </span>
      {isDeal && (
        <span className="ml-1.5 text-sm text-text-body line-through">
          ৳{oldPrice!.toLocaleString()}
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
