"use client";

import React from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import { isPurchasable, isUpcoming } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import PriceTag from './PriceTag';

type ProductCardProps = {
  product: Product;
  /** Show discount badge + struck-through old price when the product is on deal */
  showDiscount?: boolean;
  /** Show the release year in the card meta */
  showReleasedYear?: boolean;
};

/**
 * Shared product card used by the New Arrivals and Deals pages.
 * Same visual design as the Shop / ShopTeaser cards, built on the
 * color tokens from globals.css.
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showDiscount = false,
  showReleasedYear = false,
}) => {
  const { addToCart, notify } = useCart();

  const isDeal =
    showDiscount &&
    product.price !== null &&
    product.oldPrice !== null &&
    product.oldPrice > product.price;
  const discountPct = isDeal
    ? Math.round((1 - product.price! / product.oldPrice!) * 100)
    : 0;

  return (
    <>
      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
        <div className="h-40 bg-bg-dark-secondary/10 flex items-center justify-center relative">
          {isDeal && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold bg-accent text-text-on-dark rounded-full">
              -{discountPct}%
            </span>
          )}
          <span className="text-text-body text-sm">{product.imageAlt}</span>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <span className="inline-flex items-center self-start px-2.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent-hover rounded-full mb-2">
            {product.category}
          </span>
          <h3 className="text-base font-bold text-text-heading mb-2 line-clamp-2">
            <Link href={`/shop/${product.id}`} className="hover:text-accent transition-colors">
              {product.title}
            </Link>
          </h3>
          {showReleasedYear && (
            <p className="text-xs text-text-body mb-2">
              Released {product.specSheet.basicInfo.releaseDate}
            </p>
          )}
          {/* Struck old price only on the Deals page (hideOldPrice otherwise) */}
          <div className="mb-4">
            <PriceTag product={product} hideOldPrice={!isDeal} />
          </div>
          <div className="mt-auto flex gap-2">
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
    </>
  );
};

export default ProductCard;
