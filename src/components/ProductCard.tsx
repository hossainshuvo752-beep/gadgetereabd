"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { purchaseModeOf, slugify } from '@/lib/products';
import { productMainAlt } from '@/lib/imageAlt';
import PriceTag from './PriceTag';
import ProductActions, { type PurchaseSurface } from './ProductActions';

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
  /** Render the shared action-button row (ProductActions). DEFAULT TRUE —
   *  Shop, Deals and New Arrivals keep their shopping cards. The Quick Look
   *  LISTING passes false: its cards become simple browse cards (image +
   *  badge + title + price) where the WHOLE card is one link to the detail
   *  page — same click-to-open behavior as blog cards. */
  showActions?: boolean;
  /** Analytics attribution for the purchase buttons — the page this card is
   *  rendered on. Defaults to 'shop-card'; New Arrivals / Deals pass their
   *  own value so the admin dashboard can tell the three listings apart. */
  surface?: PurchaseSurface;
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
  surface = 'shop-card',
}) => {
  const href = `${linkTo}/${slugify(product.title)}`;

  // Free-order products are order REQUESTS (estimated prices) — they must
  // never carry sale/-% badges or a struck-through price that implies they
  // can be bought at that number. The price still renders through PriceTag,
  // which keeps its "Estimated Price" label.
  const isFreeOrder = purchaseModeOf(product) === 'free-order';

  // A genuine discount exists whenever oldPrice > price — shown on mobile
  // regardless of the desktop-only showDiscount flag (which only controls
  // the desktop strike-through, keeping desktop layouts unchanged).
  const hasDeal =
    !isFreeOrder &&
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
            alt={productMainAlt(product)}
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
        {/* The ONLY purchase buttons a card may render — shared component,
            card layout (never Notify Me, so card height stays uniform). */}
        {showActions && (
          <ProductActions product={product} surface={surface} layout="card" />
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
