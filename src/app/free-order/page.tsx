'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  products,
  purchaseModeOf,
  slugify,
  variantPrice,
  type Product,
} from '@/lib/products';
import {
  isPurchaseSurface,
  type PurchaseSurface,
} from '@/components/ProductActions';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/tracking';
import { makeOrderNumber } from '@/lib/orderNumber';
import { productMainAlt } from '@/lib/imageAlt';
import PriceTag from '@/components/PriceTag';

/**
 * Free Order — the checkout-style request form for products sold in
 * 'free-order' mode (estimated prices; nobody is charged an unconfirmed
 * number). Opened by the single Free Order button on listing cards and on
 * product detail pages, always carrying the product id, the chosen variant
 * and the surface the click came from.
 *
 * Persistence: `free_orders` (INSERT-only RLS, same pattern as `orders`).
 * Run supabase/free-orders-schema.sql once to create the table.
 *
 * The product is taken from the ?id= query param and resolved against the
 * shared catalog; the summary below the form always shows exactly the item
 * that was picked, plus its variant.
 */

type FreeOrderForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  note: string;
};

const EMPTY_FORM: FreeOrderForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  note: '',
};

function FreeOrderInner() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const surfaceParam = searchParams.get('surface');
  const surface: PurchaseSurface = isPurchaseSurface(surfaceParam)
    ? surfaceParam
    : 'shop-card';
  const variant = searchParams.get('variant') || 'Standard';

  const product: Product | undefined =
    idParam !== null
      ? products.find((p) => p.id === Number(idParam))
      : undefined;
  // Only free-order products may use this form — a hand-typed Buy Now product
  // id gets sent to its normal product page instead.
  const eligible = product ? purchaseModeOf(product) === 'free-order' : false;
  const resolvedPrice = product ? variantPrice(product, variant) : null;

  const [form, setForm] = useState<FreeOrderForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  // Funnel signal: the form was opened for a specific product + surface.
  useEffect(() => {
    if (eligible && product) {
      track('free_order_view', { product_id: product.id, surface });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, surface, eligible]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product || !eligible || submitting) return;

    if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) {
      setError('Please enter a valid phone number so we can confirm your order.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const nextReference = makeOrderNumber();

      const { error: insertError } = await supabase.from('free_orders').insert({
        id: crypto.randomUUID(),
        reference: nextReference,
        user_id: userData?.user?.id ?? null,
        product_id: product.id,
        product_title: product.title,
        product_slug: slugify(product.title),
        variant,
        list_price: resolvedPrice?.price ?? null,
        price_estimated: resolvedPrice?.priceEstimated ?? product.priceEstimated,
        contact_name: form.name.trim(),
        contact_phone: form.phone.trim(),
        contact_email: form.email.trim() || null,
        address: form.address.trim(),
        city: form.city.trim(),
        note: form.note.trim() || null,
        surface,
        status: 'pending',
      });

      if (insertError) {
        setError(
          'Could not send your free order request — please try again in a moment. If it keeps failing, email us at hossainshuvo752@gmail.com.'
        );
        setSubmitting(false);
        return;
      }

      track('free_order_submit', {
        product_id: product.id,
        surface,
        variant,
      });
      setReference(nextReference);
    } catch {
      setError('Connection problem — please check your internet and try again.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  };

  const inputClasses =
    'w-full px-4 py-2 border border-text-heading/20 rounded-md text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent';

  const shell = (children: React.ReactNode) => (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );

  if (!product) {
    return shell(
      <div className="max-w-xl bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-text-heading mb-2">
          Product not found
        </h1>
        <p className="text-text-body mb-6">
          This free order link points to a product that is no longer in the
          catalog.
        </p>
        <Link
          href="/shop"
          className="inline-flex px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  if (!eligible) {
    return shell(
      <div className="max-w-xl bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-text-heading mb-2">
          {product.title} is available to buy
        </h1>
        <p className="text-text-body mb-6">
          This product has a confirmed price, so it uses the normal cart and
          checkout instead of a free order request.
        </p>
        <Link
          href={`/shop/${slugify(product.title)}`}
          className="inline-flex px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
        >
          View {product.title}
        </Link>
      </div>
    );
  }

  if (reference) {
    return shell(
      <div className="max-w-xl bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center">
        <div className="text-3xl mb-3">✅</div>
        <h1 className="text-2xl font-bold text-text-heading mb-2">
          Free order request received
        </h1>
        <p className="text-text-body mb-2">
          Reference <span className="font-semibold text-text-heading">{reference}</span>
        </p>
        <p className="text-sm text-text-body mb-6">
          No payment is needed now. Our team will call you to confirm stock,
          delivery and the final price for {product.title}.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/shop/${slugify(product.title)}`}
            className="px-6 py-2.5 border border-accent text-accent font-medium rounded-md hover:bg-accent/10 transition-colors"
          >
            Back to {product.title}
          </Link>
          <Link
            href="/shop"
            className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return shell(
    <>
      <h1 className="text-3xl font-bold text-text-heading mb-2">Free Order</h1>
      <p className="text-text-body mb-8 max-w-2xl">
        Request this product without paying online. We&apos;ll confirm stock,
        delivery and the final Bangladesh price with you by phone.
      </p>

      <div className="grid gap-8 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6">
            <h2 className="text-lg font-bold text-text-heading mb-4">
              Contact &amp; Delivery
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
                  Email Address <span className="text-text-body font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
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
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-text-heading mb-2">
                  Note <span className="text-text-body font-normal">(optional)</span>
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={2}
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Colour, storage or anything else we should know"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6">
            <h2 className="text-lg font-bold text-text-heading mb-2">No payment now</h2>
            <p className="text-sm text-text-body">
              A free order is a request, not a purchase. Nothing is charged and
              no cart is used — we agree the final price with you before
              anything is shipped.
            </p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 bg-bg-dark text-text-on-dark font-medium rounded-lg hover:bg-bg-dark-secondary transition-colors disabled:bg-bg-dark/50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending Request…' : 'Send Free Order Request'}
          </button>
        </form>

        <aside className="lg:col-span-2">
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-text-heading mb-4">Your item</h2>
            <div className="flex items-start gap-3">
              <div className="relative shrink-0 w-20 h-20 bg-bg-dark-secondary/10 rounded overflow-hidden flex items-center justify-center">
                {product.heroImage ? (
                  <Image
                    src={product.heroImage}
                    alt={productMainAlt(product)}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                  />
                ) : (
                  <span className="text-[10px] text-text-body text-center px-1">
                    {product.imageAlt}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text-heading">{product.title}</p>
                <p className="text-xs text-text-body mt-0.5">Variant: {variant}</p>
                <div className="mt-2">
                  {resolvedPrice ? (
                    <PriceTag product={product} resolved={resolvedPrice} />
                  ) : (
                    <PriceTag product={product} />
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-text-body mt-4">
              The price shown is a reference only — this product has no
              confirmed Bangladesh price yet, which is why it is a free order.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export default function FreeOrderPage() {
  return (
    <Suspense
      fallback={
        <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-text-body">Loading free order form…</p>
          </div>
        </section>
      }
    >
      <FreeOrderInner />
    </Suspense>
  );
}
