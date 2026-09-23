"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { products, isPurchasable, type Product } from '@/lib/products';
import { makeOrderNumber } from '@/lib/orderNumber';

/**
 * Order confirmation page — shows the REAL order number passed from
 * /checkout (persisted in Supabase), falling back to a locally generated
 * display ID only for legacy/snapshot URLs, and an order summary. Two modes:
 * - BUY NOW (?src=buy-now&id=&qty=&variant=): the single product passed from
 *   /checkout when the order came from a Buy Now button.
 * - CART (?src=cart&data=<json>): the order snapshot /checkout passed in the
 *   URL — the cart itself was cleared on order, so the snapshot keeps the
 *   summary intact (also survives refreshing the confirmation page).
 */

const DELIVERY_FEE = 150;

const makeOrderId = makeOrderNumber;

function OrderConfirmationInner() {
  const searchParams = useSearchParams();
  // The real order number from /checkout (persisted in Supabase). The local
  // fallback only fires for legacy URLs without ?order= — it's cosmetic and
  // is NOT the DB's order_number in that case.
  const realOrder = searchParams.get('order');
  const [fallbackId, setFallbackId] = useState<string | null>(null);

  // Generate the fallback after mount so the SSR markup matches hydration.
  useEffect(() => {
    if (!realOrder) setFallbackId(makeOrderNumber());
  }, [realOrder]);

  const orderId = realOrder ?? fallbackId;

  // Buy Now mode: single product from the query params passed by /checkout.
  const idParam = searchParams.get('id');
  const found =
    searchParams.get('src') === 'buy-now' && idParam !== null
      ? products.find((p) => p.id === Number(idParam))
      : undefined;
  const buyNow: Product | null =
    found && isPurchasable(found) ? found : null;
  const qty = Math.max(1, Number.parseInt(searchParams.get('qty') ?? '1', 10) || 1);
  const variant = searchParams.get('variant') ?? 'Standard';

  // Cart mode: validate the order snapshot against the catalog (never trust
  // client JSON for prices — resolve every line through products.ts).
  const cartLines = useMemo(() => {
    if (searchParams.get('src') !== 'cart') return [];
    const raw = searchParams.get('data');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as {
        productId?: unknown;
        qty?: unknown;
        variant?: unknown;
      }[];
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((entry) => {
        const product =
          typeof entry?.productId === 'number'
            ? products.find((p) => p.id === entry.productId)
            : undefined;
        if (!product || !isPurchasable(product)) return [];
        return [
          {
            item: {
              productId: product.id,
              qty:
                typeof entry.qty === 'number' && entry.qty > 0
                  ? Math.min(99, Math.floor(entry.qty))
                  : 1,
              variant:
                typeof entry.variant === 'string' && entry.variant
                  ? entry.variant
                  : 'Standard',
            },
            product,
          },
        ];
      });
    } catch {
      return [];
    }
  }, [searchParams]);

  // Order summary lines: the Buy Now product if present, else the snapshot.
  const priced = buyNow
    ? [
        {
          item: { productId: buyNow.id, qty, variant },
          product: buyNow,
        },
      ]
    : cartLines;

  const subtotal = priced.reduce(
    (sum, { item, product }) => sum + (product.price as number) * item.qty,
    0
  );
  const total = subtotal + (priced.length > 0 ? DELIVERY_FEE : 0);

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 sm:p-10 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-text-heading mb-2">
            Order Confirmed!
          </h1>
          <p className="text-text-body mb-6">
            Thank you for your order! We&apos;ll confirm it by phone shortly and
            email your receipt.
          </p>

          <div className="inline-block bg-bg-light border border-text-heading/10 rounded-lg px-6 py-3 mb-8">
            <div className="text-xs uppercase tracking-wide text-text-body">Order ID</div>
            <div className="text-lg font-bold text-accent">
              {orderId ?? 'Generating…'}
            </div>
          </div>

          {/* Order summary */}
          <div className="text-left bg-bg-light border border-text-heading/10 rounded-lg p-5 mb-6">
            <h2 className="text-base font-semibold text-text-heading mb-3">
              Order Summary
            </h2>
            <div className="space-y-2 mb-3">
              {priced.map(({ item, product }) => (
                <div key={item.productId} className="flex justify-between gap-3 text-sm">
                  <span className="text-text-body min-w-0">
                    {product.title}
                    <span className="block text-xs">
                      {item.variant} × {item.qty}
                    </span>
                  </span>
                  <span className="text-text-heading shrink-0">
                    ৳{((product.price as number) * item.qty).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-sm border-t border-text-heading/10 pt-3">
              <div className="flex justify-between text-text-body">
                <span>Subtotal</span>
                <span className="text-text-heading">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-text-body">
                <span>Delivery</span>
                <span className="text-text-heading">৳{DELIVERY_FEE.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-text-heading">Total</span>
                <span className="font-bold text-accent">৳{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-text-body mb-8">
            Estimated delivery: 2–4 business days inside Dhaka, 3–7 days outside.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Continue Shopping →
            </Link>
            <Link
              href="/"
              className="px-6 py-2.5 border border-text-heading/20 text-text-body font-medium rounded-md hover:bg-bg-light transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-text-body">Loading…</p>
          </div>
        </section>
      }
    >
      <OrderConfirmationInner />
    </Suspense>
  );
}
