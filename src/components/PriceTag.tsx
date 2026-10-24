import React from 'react';
import type { Product, ResolvedPrice } from '@/lib/products';

/**
 * The ONE channel line under a detail-page price. Built from the product's
 * `priceChannel` (never inferred per page), its brand, the SELECTED variant
 * label and the optional verified `priceWarranty`, so the Quick Look page and
 * the Shop page always print the same sentence for the same selection:
 *
 *   official    → "(Official price in Bangladesh — 8GB/256GB, <warranty>)"
 *                 with the em-dash part dropped when there is neither a
 *                 variant nor a warranty: "(Official price in Bangladesh)"
 *   unofficial  → "(Unofficial price in Bangladesh — imported unit, not a
 *                 Xiaomi Bangladesh price)"
 *   estimated   → "(Estimated price — not yet sold in Bangladesh)"
 *   not launched→ the product's own `priceDisplayNote`, kept verbatim
 *   unknown     → null (no line at all, never an assumed "official")
 *
 * The variant part is the selector's own label, and only when that label
 * carries a storage size (so "8GB/256GB" and "256GB" show, a bundle name
 * like "Adventure Combo" does not invent a RAM figure). Warranty text is
 * printed ONLY when the data carries a verified `priceWarranty`.
 */
export function priceChannelLine(
  product: Product,
  selection?: {
    /** Label of the currently selected storage/variant option. */
    variantLabel?: string | null;
    /** Selected version, whose channel may differ from the product's. */
    version?: { priceChannel?: 'official' | 'unofficial' } | null;
  }
): string | null {
  // No Bangladesh price at all (the Apple HomeView): keep the product's own
  // short wording rather than inventing a channel for a price that is not sold.
  if (product.priceStatus === 'not-launched' || product.price === null) {
    return product.priceDisplayNote ?? null;
  }

  // An estimate is never dressed up as a channel price.
  if (product.priceEstimated || product.priceStatus === 'estimated') {
    return '(Estimated price — not yet sold in Bangladesh)';
  }

  const channel =
    selection?.version?.priceChannel ??
    product.priceChannel ??
    (product.priceStatus === 'official'
      ? 'official'
      : product.priceStatus === 'unofficial'
        ? 'unofficial'
        : null);

  // on-sale / retail are discount and shop states, not sales channels: unless
  // the data explicitly names the channel, this product shows no line.
  if (!channel) return null;

  if (channel === 'unofficial') {
    const brand = product.specSheet.basicInfo.brand;
    return `(Unofficial price in Bangladesh — imported unit, not a ${brand} Bangladesh price)`;
  }

  const label = selection?.variantLabel ?? '';
  const variant = /\d\s?(?:GB|TB)\b/i.test(label) ? label.trim() : '';
  const detail = [variant, product.priceWarranty?.trim()].filter(Boolean).join(', ');
  return detail
    ? `(Official price in Bangladesh — ${detail})`
    : '(Official price in Bangladesh)';
}

/**
 * THE shared price display — use it everywhere a product price is shown
 * (cards, teasers, listings, detail pages, search results). Renders:
 * - Confirmed price:  ৳X,XX,XXX  (+ struck-through oldPrice when on deal)
 * - Estimated price:  "Estimated Price: ৳X,XXX" — clearly labeled, never
 *   presented as a confirmed number.
 * `priceNote` is maintenance data only: it is NEVER rendered here, neither as
 * visible text nor as a hover tooltip (detail pages get the one channel line
 * from priceChannelLine instead).
 * Pure component (no hooks/handlers) — safe in both server and client trees.
 *
 * `resolved` (optional) overrides the product's flat price with the SELECTED
 * VARIANT's resolved pricing (variantPrice()). When absent, flat fields are
 * used exactly as before — all existing call sites keep their behavior.
 */
export default function PriceTag({
  product,
  hideOldPrice = false,
  className = '',
  resolved,
}: {
  product: Product;
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

  return (
    <span className={`inline-block ${className}`}>
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
    </span>
  );
}
