"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import {
  isPurchasable,
  isUpcoming,
  purchaseModeOf,
  slugify,
} from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { track } from '@/lib/tracking';

/**
 * THE shared purchase-action component. Every Buy Now / Add to Cart /
 * Pre-Order / Coming Soon / Free Order button on the site renders from this
 * one file — listing cards (Shop, New Arrivals, Deals, homepage Trending
 * Picks through ProductCard) AND product detail pages (Shop detail + Quick
 * Look through QuickLookDetail).
 *
 * Rules encoded here (owner-specified):
 * - mode 'buy'        → cards: Add to Cart + Buy Now (Pre-Order while
 *                       upcoming, Coming Soon when not purchasable);
 *                       detail: Add to Cart + Buy Now + Notify Me.
 * - mode 'free-order' → cards: ONLY the Free Order button (no cart, no
 *                       Pre-Order, no Coming Soon, no Notify Me), so card
 *                       height/layout never change;
 *                       detail: Free Order + Notify Me.
 * - Buy Now and Free Order can NEVER render together: the two blocks are
 *   selected by one ternary on purchaseModeOf() below (the build guard
 *   scripts/check-product-actions.js verifies the marked blocks).
 * - Every action reports the surface it was clicked from (shop-card,
 *   new-arrivals-card, deals-card, shop-detail, quick-look) so the admin
 *   dashboard can attribute Free Orders, Notify clicks and cart adds.
 */

export const PURCHASE_SURFACES = [
  'shop-card',
  'new-arrivals-card',
  'deals-card',
  'shop-detail',
  'quick-look',
] as const;

export type PurchaseSurface = (typeof PURCHASE_SURFACES)[number];

/** Narrow an untrusted query-string value to a known surface. */
export function isPurchaseSurface(value: unknown): value is PurchaseSurface {
  return (
    typeof value === 'string' &&
    (PURCHASE_SURFACES as readonly string[]).includes(value)
  );
}

type ProductActionsProps = {
  product: Product;
  /** Page/placement that produced the click (analytics attribution). */
  surface: PurchaseSurface;
  /** 'card' = compact row inside a listing card; 'detail' = product page. */
  layout?: 'card' | 'detail';
  /** Variant label chosen on a detail page (color/storage). Cards use Standard. */
  variant?: string;
};

const ProductActions: React.FC<ProductActionsProps> = ({
  product,
  surface,
  layout = 'card',
  variant = 'Standard',
}) => {
  const { addToCart, notify } = useCart();
  const [preOrdered, setPreOrdered] = useState(false);

  // One resolver, one ternary — the only source of truth for which actions
  // this product may show.
  const mode = purchaseModeOf(product);
  const slug = slugify(product.title);
  const freeOrderHref = `/free-order?id=${product.id}&surface=${surface}&variant=${encodeURIComponent(variant)}`;
  const notifyHref = `/contact?topic=notify&product=${encodeURIComponent(slug)}&surface=${surface}`;

  const handleAddToCart = () => {
    addToCart(product.id, 1, variant, surface);
  };

  const handlePreOrder = () => {
    setPreOrdered(true);
    notify(`Pre-order request received: ${product.title}`);
  };

  // Shared look for the primary buy button on both layouts.
  const buyClass =
    layout === 'card'
      ? 'tactile flex-1 px-3 py-2 bg-bg-dark text-text-on-dark font-medium rounded-md hover:bg-bg-dark-secondary transition-colors text-sm text-center'
      : 'tactile flex items-center justify-center px-5 py-3 bg-bg-dark text-text-on-dark font-medium rounded-lg hover:bg-bg-dark-secondary transition-colors';

  const addClass =
    layout === 'card'
      ? 'flex-1 px-3 py-2 border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors text-sm font-medium'
      : 'tactile flex items-center justify-center px-5 py-3 bg-accent text-text-on-dark font-medium rounded-lg hover:bg-accent-hover';

  const notifyClass =
    'tactile flex items-center justify-center px-5 py-3 bg-text-on-dark border border-text-heading/20 text-text-body font-medium rounded-md hover:bg-bg-light';

  return (
    <div
      className={
        layout === 'card'
          ? 'mt-auto flex flex-col gap-1.5 md:gap-2 md:flex-row'
          : mode === 'free-order'
            ? 'grid gap-3 sm:grid-cols-2'
            : 'grid gap-3 sm:grid-cols-3'
      }
    >
      {mode === 'free-order' ? (
        /* data-purchase-block: free-order — exactly ONE button, and it must
           never sit next to Buy Now / Add to Cart / Pre-Order / Coming Soon. */
        <div data-purchase-block="free-order" className="contents">
          <Link
            href={freeOrderHref}
            onClick={() =>
              track('free_order_click', { product_id: product.id, surface })
            }
            className={
              layout === 'card'
                ? 'tactile flex-1 px-3 py-2 bg-bg-dark text-text-on-dark font-medium rounded-md hover:bg-bg-dark-secondary transition-colors text-sm text-center'
                : 'tactile flex items-center justify-center px-5 py-3 bg-bg-dark text-text-on-dark font-medium rounded-lg hover:bg-bg-dark-secondary transition-colors'
            }
          >
            Free Order
          </Link>
        </div>
      ) : (
        /* data-purchase-block: buy — Add to Cart + primary buy action. */
        <div data-purchase-block="buy" className="contents">
          <button type="button" onClick={handleAddToCart} className={addClass}>
            Add to Cart
          </button>
          {isUpcoming(product) ? (
            preOrdered && layout === 'detail' ? (
              // Only the detail layout confirms inline; cards keep the tap
              // affordance (the toast is their confirmation).
              <button
                type="button"
                disabled
                className="flex items-center justify-center px-5 py-3 bg-bg-dark/70 text-text-on-dark/80 font-medium rounded-lg cursor-not-allowed"
              >
                ✓ Pre-order Requested
              </button>
            ) : (
              <button type="button" onClick={handlePreOrder} className={buyClass}>
                Pre-Order
              </button>
            )
          ) : isPurchasable(product) ? (
            <Link
              href={`/checkout?id=${product.id}&qty=1&variant=${encodeURIComponent(variant)}&surface=${surface}`}
              onClick={() =>
                track('begin_checkout', { product_id: product.id, surface })
              }
              className={buyClass}
            >
              Buy Now
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title={
                product.priceEstimated
                  ? 'Estimated price only — an official Bangladesh price is required before this can be bought'
                  : "Price coming soon — this product can't be ordered yet"
              }
              className={
                layout === 'card'
                  ? 'flex-1 px-3 py-2 bg-accent/50 text-text-on-dark font-medium rounded-md cursor-not-allowed text-sm'
                  : 'flex items-center justify-center px-5 py-3 bg-bg-dark/50 text-text-on-dark/70 font-medium rounded-lg cursor-not-allowed'
              }
            >
              Coming Soon
            </button>
          )}
        </div>
      )}

      {/* Notify Me — detail pages only, in BOTH modes. Cards never show it,
          so card height and the 4-column grid stay exactly as they are. */}
      {layout === 'detail' && (
        <Link
          href={notifyHref}
          onClick={() =>
            track('notify_click', { product_id: product.id, surface })
          }
          className={notifyClass}
        >
          Notify Me
        </Link>
      )}
    </div>
  );
};

export default ProductActions;
