"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { isPurchasable, isUpcoming, slugify } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import PriceTag from './PriceTag';

type ProductCardProps = {
  product: Product;
  /** Show the struck-through old price on DESKTOP (Deals page passes true;
   *  other pages keep the desktop card exactly as before). Mobile always
   *  gets the full deal presentation (badges + strike) when a discount
   *  actually exists. */
  showDiscount?: boolean;
  /** Show the release year in the card meta */
  showReleasedYear?: boolean;
  /** Detail-page base the card links to. Defaults to '/shop'; the Quick Look
   *  listing passes '/quick-look' so its cards open the spec-sheet page. */
  linkTo?: string;
  /** Render the action-button row (Add to Cart / Buy Now / Pre-Order /
   *  Coming Soon). DEFAULT TRUE — Shop, Deals and New Arrivals keep their
   *  shopping cards. The Quick Look LISTING passes false: its cards become
   *  simple browse cards (image + badge + title + price) where the WHOLE
   *  card is one link to the detail page — same click-to-open behavior as
   *  blog cards. The Quick Look DETAIL page keeps its own action buttons,
   *  untouched, inside QuickLookDetail. */
  showActions?: boolean;
};

/**
 * Shared product card used by the Shop, New Arrivals, Deals and Quick Look
 * listing pages. Same visual design as the ShopTeaser cards, built on the
 * color tokens from globals.css.
 *
 * Mobile-only enhancements (all wrapped in md:hidden so desktop never
 * changes): SALE badge (top-left, red/orange), discount-percentage badge
 * (top-right, gold), and the struck-through old price next to the current
 * price. A star-rating row is intentionally omitted — the Product type has
 * no rating/review data yet; add it here (e.g. "★★★★★ 4.6 (1721)") when
 * real rating data lands on products.
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showDiscount = true,
  showReleasedYear = false,
  linkTo = '/shop',
  showActions = true,
}) => {
  const { addToCart, notify } = useCart();

  const href = `${linkTo}/${slugify(product.title)}`;

  // A genuine discount exists whenever oldPrice > price — shown on mobile
  // regardless of the desktop-only showDiscount flag (which only controls
  // the desktop strike-through, keeping desktop layouts unchanged).
  const hasDeal =
    product.price !== null &&
    product.oldPrice !== null &&
    product.oldPrice > product.price;
  // Desktop strike-through follows the caller's showDiscount choice.
  const isDeal = showDiscount && hasDeal;
  const discountPct = hasDeal
    ? Math.round((1 - product.price! / product.oldPrice!) * 100)
    : 0;

  // Shared card body. The title link and the action row are the only parts
  // that differ between the two variants:
  // - showActions: title carries its own link (card itself is NOT one big
  //   link, so the buttons stay individually clickable);
  // - !showActions: the ROOT is the link (blog-card style), so the title
  //   must be plain text — a link inside a link is invalid HTML.
  const cardBody = (
    <>
      <div className="aspect-square bg-bg-dark-secondary/10 flex items-center justify-center relative overflow-hidden">
        {/* Mobile-only deal badges (desktop card is untouched) */}
        {hasDeal && (
          <>
            <span className="md:hidden absolute top-2 left-2 px-2 py-0.5 text-xs font-bold text-text-on-dark bg-red-600 rounded">
              SALE
            </span>
            <span className="md:hidden absolute top-2 right-2 px-2 py-0.5 text-xs font-bold text-bg-dark bg-yellow-400 rounded">
              -{discountPct}%
            </span>
          </>
        )}
        {isDeal && (
          <span className="hidden md:inline-flex absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold bg-accent text-text-on-dark rounded-full">
            -{discountPct}%
          </span>
        )}
        {/* Real photo when available (fill + object-contain preserves any
            aspect ratio); gray placeholder text otherwise. */}
        {product.heroImage ? (
          <Image
            src={product.heroImage}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="card-zoom object-contain p-2"
          />
        ) : (
          <span className="text-text-body text-sm">{product.imageAlt}</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="inline-flex items-center self-start px-2.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent-hover rounded-full mb-2">
          {product.category}
        </span>
        {/* Title area reserves EXACTLY 2 lines (2 × 24px line-height = h-12)
            regardless of actual length, and line-clamp-2 hard-caps longer
            titles at 2 lines with an ellipsis — so price/buttons below sit
            at the same vertical position on every card in a grid row.
            The empty space under 1-line titles is intentional. */}
        <h3 className="text-base font-bold text-text-heading mb-2 line-clamp-2 h-12 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden group-hover:text-accent transition-colors">
          {showActions ? (
            <Link href={href} className="hover:text-accent transition-colors">
              {product.title}
            </Link>
          ) : (
            product.title
          )}
        </h3>
        {/* Release year (New Arrivals) — hidden on mobile so the compact
            2-col cards stay short; desktop unchanged */}
        {showReleasedYear && (
          <p className="hidden md:block text-xs text-text-body mb-2">
            Released {product.specSheet.basicInfo.releaseDate}
          </p>
        )}
        {/* Price — mobile shows the deal presentation (current + struck old
            price) whenever a real discount exists; desktop keeps PriceTag
            exactly as each page renders it today. */}
        {/* Price — mb-3 on mobile (was mb-4): tighter above the button group.
            Without actions the price is the last row: mb-0 so the reserved
            space below sits INSIDE the flex column, not under the price. */}
        <div className={showActions ? 'mb-3 md:mb-4' : ''}>
          {hasDeal && !isDeal ? (
            <>
              <div className="md:hidden">
                <PriceTag product={product} hideOldPrice />
                <span className="ml-1.5 text-sm text-text-body line-through">
                  ৳{product.oldPrice!.toLocaleString()}
                </span>
              </div>
              <div className="hidden md:block">
                <PriceTag product={product} hideOldPrice />
              </div>
            </>
          ) : (
            <PriceTag product={product} hideOldPrice={!isDeal} />
          )}
        </div>
        {showActions && (
          <>
            {/* MOBILE: stacked full-width buttons (side-by-side wrapped
                awkwardly in the narrow 2-col grid); md: side-by-side as before. */}
            {/* MOBILE: stacked; gap-1.5 (was gap-2) tightens between buttons.
                Button py-2 KEPT: reducing it would drop height to 32px, below
                the ~40px tap-target floor (36px text+padding today). */}
            <div className="mt-auto flex flex-col gap-1.5 md:gap-2 md:flex-row">
              {/* Add to Cart → cart context + toast; works for every product
                  (unpurchasable ones get an explanatory toast from the store). */}
              <button
                onClick={() => addToCart(product.id, 1, 'Standard')}
                className="flex-1 px-3 py-2 border border-accent text-accent rounded-md hover:bg-accent/10 transition-colors text-sm font-medium"
              >
                Add to Cart
              </button>
              {/* Upcoming products: Pre-Order (simple confirmation — no checkout,
                  since unreleased products have no confirmed price to order against).
                  Estimated-price products can't be ordered — Coming Soon. Else Buy Now. */}
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
                  className="tactile flex-1 px-3 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover text-sm text-center"
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
          </>
        )}
      </div>
    </>
  );

  // Root: action cards are a plain div (buttons inside must not sit inside a
  // link); action-less Quick Look cards ARE the link — one big click target,
  // same pattern as ArticleCard.
  return showActions ? (
    <div className="card-lift bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden flex flex-col h-full">
      {cardBody}
    </div>
  ) : (
    <Link
      href={href}
      aria-label={product.title}
      className="card-lift group bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden flex flex-col h-full"
    >
      {cardBody}
    </Link>
  );
};

export default ProductCard;
