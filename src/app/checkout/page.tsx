"use client";

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { products, isPurchasable, type Product } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';
import { makeOrderNumber } from '@/lib/orderNumber';

/**
 * Checkout page — demo only (no payment backend). Two modes:
 * - BUY NOW (?id=<productId>&qty=&variant=): shows a single product from the
 *   query params (set by Buy Now buttons on cards/detail pages).
 * - CART (no ?id): shows the shared cart contents from CartContext (items
 *   added via "Add to Cart" buttons, persisted in localStorage).
 * "Place Order" PERSISTS the order to Supabase (orders + order_items,
 * INSERT-only RLS — guests and logged-in users can both order) and then
 * navigates to /order-confirmation with the real order number. Buy Now
 * params pass through; cart orders pass an order snapshot in the URL so
 * the confirmation summary still displays after the cart is cleared.
 *
 * useSearchParams requires a Suspense boundary for static prerendering —
 * hence the inner/outer component split.
 */

type CheckoutForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
};

type PaymentMethod = 'cod' | 'bkash' | 'nagad';

const EMPTY_FORM: CheckoutForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
};

const DELIVERY_FEE = 150;

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; note: string }[] = [
  { id: 'bkash', label: 'bKash', note: 'Pay via your bKash mobile wallet' },
  { id: 'nagad', label: 'Nagad', note: 'Pay via your Nagad mobile wallet' },
  { id: 'cod', label: 'Cash on Delivery', note: 'Pay in cash when your order arrives' },
];

type SummaryLine = {
  productId: number;
  title: string;
  imageAlt: string;
  variant: string;
  qty: number;
  price: number;
};

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [payment, setPayment] = useState<PaymentMethod>('bkash');
  // Marketing opt-in (checked by default) — on order, also subscribes the
  // buyer to the newsletter (best-effort; never blocks the order).
  const [subscribeUpdates, setSubscribeUpdates] = useState(true);
  // Real persistence state — surfaced inline, never swallowed.
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  // Cart mode (no ?id) reads the shared cart store.
  const { items: cartItems, findProduct, clearCart } = useCart();

  // Buy Now mode: ?id=<productId> + optional qty/variant set by the Buy Now buttons.
  const idParam = searchParams.get('id');
  const found = idParam !== null ? products.find((p) => p.id === Number(idParam)) : undefined;
  // Estimated-price products can't be ordered — they fall back to demo/empty mode.
  const buyNow: Product | null = found && isPurchasable(found) ? found : null;
  const qty = Math.max(1, Number.parseInt(searchParams.get('qty') ?? '1', 10) || 1);
  const variant = searchParams.get('variant') ?? 'Standard';

  // Order summary lines: the Buy Now product if present, else the shared
  // cart contents. Invalid/null-price ?id falls back to cart mode.
  const lines: SummaryLine[] = buyNow
    ? [
        {
          productId: buyNow.id,
          title: buyNow.title,
          imageAlt: buyNow.imageAlt,
          variant,
          qty,
          price: buyNow.price as number,
        },
      ]
    : cartItems.flatMap((item) => {
        const product = findProduct(item.productId);
        if (!product || !isPurchasable(product)) return [];
        return [
          {
            productId: product.id,
            title: product.title,
            imageAlt: product.imageAlt,
            variant: item.variant,
            qty: item.qty,
            price: product.price as number,
          },
        ];
      });

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const total = subtotal + (lines.length > 0 ? DELIVERY_FEE : 0);
  const isEmpty = lines.length === 0;

  // Real order placement: INSERT into Supabase (orders + order_items),
  // then navigate to the confirmation page with the DB order number.
  // Every failure surfaces as an inline error — no silent fake success.
  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEmpty || placing) return;
    setPlacing(true);
    setOrderError(null);

    try {
      // Attach the order to the logged-in user when there is one (guest
      // checkout stays fully supported — user_id is null then).
      const { data: userData } = await supabase.auth.getUser();
      const orderNumber = makeOrderNumber();

      const { data: order, error: orderInsertError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: userData?.user?.id ?? null,
          contact_name: form.name.trim(),
          contact_phone: form.phone.trim(),
          contact_email: form.email.trim() || null,
          address: form.address.trim(),
          city: form.city.trim(),
          payment_method: payment,
          subtotal,
          delivery_fee: DELIVERY_FEE,
          total,
          status: 'pending',
          newsletter_opt_in: subscribeUpdates,
        })
        .select('id')
        .single();

      if (orderInsertError || !order) {
        setOrderError(
          'Could not place your order — please try again in a moment. If it keeps failing, contact us at hello@techbd.com.'
        );
        setPlacing(false);
        return;
      }

      const { error: itemsInsertError } = await supabase.from('order_items').insert(
        lines.map((line) => ({
          order_id: order.id,
          product_id: line.productId,
          title: line.title,
          variant: line.variant,
          qty: line.qty,
          unit_price: line.price,
          line_total: line.price * line.qty,
        }))
      );
      // The order row exists even if items failed (network hiccup between
      // the two inserts) — log loudly server-side, don't block the buyer.
      if (itemsInsertError) {
        console.error('order_items insert failed:', itemsInsertError.message);
      }

      // Best-effort newsletter opt-in (unique violation = already subscribed,
      // which is fine). Never blocks the order.
      if (subscribeUpdates && form.email.trim()) {
        const { error: newsError } = await supabase
          .from('newsletter_subscribers')
          .insert({ email: form.email.trim(), source: 'checkout' });
        if (newsError && newsError.code !== '23505') {
          console.warn('newsletter opt-in insert failed:', newsError.message);
        }
      }

      if (buyNow) {
        router.push(
          `/order-confirmation?src=buy-now&id=${buyNow.id}&qty=${qty}&variant=${encodeURIComponent(variant)}&order=${encodeURIComponent(orderNumber)}`
        );
        return;
      }
      const snapshot = lines.map(({ productId, variant, qty }) => ({
        productId,
        variant,
        qty,
      }));
      clearCart();
      router.push(
        `/order-confirmation?src=cart&data=${encodeURIComponent(JSON.stringify(snapshot))}&order=${encodeURIComponent(orderNumber)}`
      );
    } catch {
      setOrderError('Connection problem — please check your internet and try again.');
      setPlacing(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const inputClasses =
    'w-full px-4 py-2 border border-text-heading/20 rounded-md text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-8">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Billing / shipping form */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-3 space-y-8">
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6">
              <h2 className="text-lg font-bold text-text-heading mb-4">
                Billing &amp; Shipping
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-heading mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-heading mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-heading mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-text-heading mb-2">
                    Street Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    required
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House, road, area"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-text-heading mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Dhaka"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6">
              <h2 className="text-lg font-bold text-text-heading mb-4">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      payment === option.id
                        ? 'border-accent bg-accent/5'
                        : 'border-text-heading/20 hover:border-accent/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.id}
                      checked={payment === option.id}
                      onChange={() => setPayment(option.id)}
                      className="mt-1 accent-accent"
                    />
                    <span>
                      <span className="block font-medium text-text-heading">{option.label}</span>
                      <span className="block text-xs text-text-body mt-0.5">{option.note}</span>
                    </span>
                  </label>
                ))}
              </div>
              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribeUpdates}
                  onChange={(e) => setSubscribeUpdates(e.target.checked)}
                  className="mt-0.5 accent-accent"
                />
                <span className="text-sm text-text-body">
                  Notify me about upcoming gadgets and deals — subscribe to
                  updates
                </span>
              </label>
            </div>

            {orderError && (
              <p role="alert" className="text-sm text-danger">
                {orderError}
              </p>
            )}
            <button
              type="submit"
              disabled={isEmpty || placing}
              className="w-full sm:w-auto px-8 py-3 bg-accent text-text-on-dark font-medium rounded-lg hover:bg-accent-hover transition-colors disabled:bg-accent/50 disabled:cursor-not-allowed"
            >
              {placing ? 'Placing Order…' : 'Place Order'}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-text-heading mb-4">Order Summary</h2>
              {isEmpty && (
                <p className="text-sm text-text-body mb-4">
                  Nothing to check out yet — add items from the{' '}
                  <Link href="/shop" className="text-accent hover:text-accent-hover font-medium">
                    shop
                  </Link>{' '}
                  with “Add to Cart”, or use Buy Now on any product.
                </p>
              )}
              <div className="space-y-3 mb-4">
                {lines.map((line) => (
                  <div key={line.productId} className="flex items-center gap-3 text-sm">
                    {/* Image placeholder (no real product images yet) */}
                    <div className="shrink-0 w-12 h-12 bg-bg-dark-secondary/10 rounded flex items-center justify-center">
                      <span className="text-[9px] text-text-body text-center px-1 line-clamp-2">
                        {line.imageAlt}
                      </span>
                    </div>
                    <span className="text-text-body min-w-0 flex-1">
                      <Link
                        href={`/shop/${line.productId}`}
                        className="hover:text-accent transition-colors line-clamp-1"
                      >
                        {line.title}
                      </Link>
                      <span className="block text-xs">
                        {line.variant} × {line.qty}
                      </span>
                    </span>
                    <span className="text-text-heading shrink-0">
                      ৳{(line.price * line.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-text-heading/10 pt-3">
                <div className="flex justify-between text-text-body">
                  <span>Subtotal</span>
                  <span className="text-text-heading">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-body">
                  <span>Delivery</span>
                  <span className="text-text-heading">৳{DELIVERY_FEE.toLocaleString()}</span>
                </div>
                <div className="border-t border-text-heading/10 pt-3 mt-3 flex justify-between">
                  <span className="font-semibold text-text-heading">Total</span>
                  <span className="font-bold text-accent text-lg">৳{total.toLocaleString()}</span>
                </div>
              </div>
              {buyNow && (
                <p className="text-xs text-text-body mt-4">
                  You&apos;re buying this item directly — your cart isn&apos;t included.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-text-body">Loading checkout…</p>
          </div>
        </section>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
