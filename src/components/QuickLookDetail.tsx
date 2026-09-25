"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/products';
import { track } from '@/lib/tracking';
import PriceTag from '@/components/PriceTag';
import LightboxGallery from '@/components/LightboxGallery';
import { isPurchasable, isUpcoming, storageOptionsOf, variantPrice, type ResolvedPrice } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import {
  Info,
  Monitor,
  Cpu,
  Camera,
  BatteryCharging,
  Box,
  Signal,
  Fingerprint,
  Sparkles,
  AlertTriangle,
  AppWindow,
  Smartphone,
} from 'lucide-react';

/* ---------- color swatch helpers ---------- */

const COLOR_HEX: Record<string, string> = {
  black: '#111827',
  silver: '#c0c4cc',
  green: '#2f6b4f',
  white: '#f4f4f5',
  graphite: '#3f3f46',
  'pale grey': '#d4d4d8',
  blue: '#1d4ed8',
  red: '#dc2626',
};

// Marketing color names whose first word alone is not enough — matched on the
// full lowercase name first, then on any known color word inside the name.
const COLOR_HEX_EXTRA: Record<string, string> = {
  'titanium black': '#2e2e33',
  'titanium gray': '#8a8d93',
  'titanium silver': '#c7cbd1',
  'cosmic orange': '#e8722a',
  'deep blue': '#1e3a8a',
  'phantom black': '#151519',
  'mist blue': '#a8c0d8',
  'dune brown': '#8b6d4f',
  'cloud white': '#f2f2f0',
  'emerald lake green': '#2f6b4f',
  'galaxy black': '#18181b',
  'glacier white': '#eef2f5',
  'mist titanium': '#9aa3ad',
  'midnight black': '#131316',
  'fizz blue': '#38bdf8',
};

const COLOR_WORDS: Record<string, string> = {
  black: '#111827',
  silver: '#c0c4cc',
  green: '#2f6b4f',
  white: '#f4f4f5',
  graphite: '#3f3f46',
  'pale grey': '#d4d4d8',
  blue: '#1d4ed8',
  orange: '#e8722a',
  red: '#dc2626',
  brown: '#8b6d4f',
  gray: '#8a8d93',
  grey: '#8a8d93',
  titanium: '#9aa3ad',
};

function colorHex(name: string): string {
  const lower = name.toLowerCase().trim();
  if (COLOR_HEX[lower]) return COLOR_HEX[lower];
  if (COLOR_HEX_EXTRA[lower]) return COLOR_HEX_EXTRA[lower];
  for (const word of Object.keys(COLOR_WORDS)) {
    if (lower.includes(word)) return COLOR_WORDS[word];
  }
  return '#9ca3af';
}

/* ---------- presentational pieces ---------- */

const SECTION_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  'Basic Info': Info,
  'Display': Monitor,
  'Performance': Cpu,
  'Camera System': Camera,
  'Battery & Charging': BatteryCharging,
  'Build & Design': Box,
  'Connectivity': Signal,
  'Sensors': Fingerprint,
  'AI Features': Sparkles,
  'Notable Limitations': AlertTriangle,
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const Icon = SECTION_ICON[title] ?? Info;
  return (
    <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-text-heading mb-3">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent/10 text-accent">
          <Icon className="w-4 h-4" />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-text-heading/10 last:border-b-0">
      <span className="text-sm font-medium text-text-body shrink-0">{label}</span>
      <span className="text-sm text-text-heading text-right">{value}</span>
    </div>
  );
}

function IconList({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="text-sm text-text-body">None</span>;
  return (
    <ul className="space-y-1.5 mt-1">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-sm text-text-body">
          <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function VariantButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
        selected
          ? 'border-accent bg-accent/10 text-accent-hover font-semibold'
          : 'border-text-heading/20 bg-text-on-dark text-text-body hover:border-accent/50'
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- detail view ---------- */

/**
 * Full Quick Look detail layout for any product: sticky gallery column on the
 * left (native CSS sticky), info column on the right, sectioned spec cards below.
 */
const QuickLookDetail: React.FC<{
  product: Product;
  /** Render the full-width sectioned Specifications below the CTA row?
   *  Quick Look pages keep it (default true); the Shop detail page ends at
   *  the Add to Cart / Buy Now / Notify Me buttons and omits it. */
  showFullSpecs?: boolean;
}> = ({ product, showFullSpecs = true }) => {
  const router = useRouter();
  const { addToCart, notify } = useCart();
  // Gallery + variant state
  // Funnel signal (fire-and-forget, once per mount): a product detail page
  // was actually viewed with this product's data.
  useEffect(() => {
    track('product_view', { product_id: product.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const [activeImage, setActiveImage] = useState(0);
  // Real photo gallery (hero first) when the product has one; empty for
  // products still on the placeholder flow (single gray box, no thumbs).
  const galleryImages: string[] =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.heroImage
        ? [product.heroImage]
        : [];
  // Color→image sets. Absent/empty = the product has no color-specific
  // photos → NO color selector is rendered at all (nothing meaningful to
  // select) and the flat gallery shows for every storage option.
  const colorImages = product.colorImages ?? [];
  const showColorSwatches = colorImages.length > 0;
  const [activeColor, setActiveColor] = useState(0);
  const [activeStorage, setActiveStorage] = useState(0);
  // While a color is selected, that color's images REPLACE the flat gallery.
  const activeGallery: string[] =
    showColorSwatches ? colorImages[activeColor]?.images ?? galleryImages : galleryImages;
  // Keeps prev/next + display consistent even if state ever overshoots.
  const activeIdx = activeGallery.length > 0 ? activeImage % activeGallery.length : 0;

  // Storage/variant options (e.g. "256GB/512GB UFS 4.0" -> ["256GB", "512GB UFS 4.0"])
  // — the same split every surface uses via storageOptionsOf().
  const storageOptions: string[] = storageOptionsOf(product);

  // Selected-variant pricing — the displayed price follows the chosen option.
  // Package options (purchaseOptions) take priority when present; otherwise
  // the storage selection drives the price.
  const purchaseOptions: string[] = product.purchaseOptions ?? [];
  const [activePurchase, setActivePurchase] = useState(0);
  const selectedOptionLabel =
    purchaseOptions.length > 0
      ? purchaseOptions[Math.min(activePurchase, purchaseOptions.length - 1)]
      : storageOptions[activeStorage] ?? null;
  const resolvedPrice: ResolvedPrice = variantPrice(product, selectedOptionLabel);

  // Keep the color selection inside bounds (defensive; no render-phase setState).
  const safeActiveColor = showColorSwatches
    ? Math.min(activeColor, colorImages.length - 1)
    : 0;
  // Pre-order confirmation state (upcoming products only).
  const [preOrdered, setPreOrdered] = useState(false);
  // Amazon-style "see all" lightbox for galleries with more than MAX_THUMBS images.
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const MAX_THUMBS = 3;
  // More than MAX_THUMBS + 1 images (>4): show 3 thumbs + the "+N" tile.
  // MAX_THUMBS + 1 or fewer (≤4): show them ALL inline, no tile.
  const showSeeAll = activeGallery.length > MAX_THUMBS + 1;
  const inlineThumbs = showSeeAll
    ? activeGallery.slice(0, MAX_THUMBS)
    : activeGallery;

  // Storage variants (see storageOptions above)

  // Deterministic pseudo "Spec Score": share of filled key spec fields, not invented data.
  const filled = [
    product.specSheet.display.type !== 'None',
    product.specSheet.performance.processor !== 'N/A',
    product.specSheet.cameraSystem.rear !== 'None',
    product.specSheet.batteryCharging.capacity !== 'N/A',
    product.specSheet.connectivity.network !== 'N/A',
    product.specSheet.aiFeatures.length > 0,
  ].filter(Boolean).length;
  const specScore = Math.round((filled / 6) * 100);

  // Add to Cart → shared cart store, with the currently selected variant.
  const handleAddToCart = () => {
    const chosenColor = showColorSwatches
      ? colorImages[safeActiveColor]?.color ?? 'Standard'
      : 'Standard';
    const chosenStorage = storageOptions[activeStorage] ?? '';
    const chosenPackage = purchaseOptions[activePurchase] ?? '';
    const variant =
      [chosenPackage || chosenColor, chosenStorage].filter(Boolean).join(' / ') || 'Standard';
    addToCart(product.id, 1, variant);
  };

  // Buy Now → /checkout with this product + the currently selected variant.
  // Only reachable when the product is purchasable (button disabled otherwise).
  const handleBuyNow = () => {
    const chosenColor = showColorSwatches
      ? colorImages[safeActiveColor]?.color ?? 'Standard'
      : 'Standard';
    const chosenStorage = storageOptions[activeStorage] ?? '';
    const chosenPackage = purchaseOptions[activePurchase] ?? '';
    const variant =
      [chosenPackage || chosenColor, chosenStorage].filter(Boolean).join(' / ') || 'Standard';
    router.push(
      `/checkout?id=${product.id}&qty=1&variant=${encodeURIComponent(variant)}`
    );
  };

  // Notify Me for coming-soon products → the contact form (no newsletter signup exists).
  const handleNotifyMe = () => {
    router.push('/contact');
  };

  // Pre-Order for upcoming products — a request, not an order (no confirmed
  // price to checkout with). Confirmed inline + toast; Buy Now still replaced
  // by Pre-Order on every surface per the site-wide rule.
  const handlePreOrder = () => {
    setPreOrdered(true);
    notify(`Pre-order request received: ${product.title}`);
  };

  return (
    <section className="py-10 bg-bg-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== Title block ===== */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-text-body mb-1">
              <Smartphone className="w-4 h-4" />
              <span className="font-semibold text-text-heading">{product.specSheet.basicInfo.brand}</span>
            </div>
            <h1 className="text-3xl font-bold text-text-heading">{product.title}</h1>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent-hover">
            {isUpcoming(product) ? '◌ Upcoming — Pre-Order Open' : '● In Stock'}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-bg-dark-secondary/10 text-text-heading border border-text-heading/10">
            Official Warranty
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-bg-dark-secondary/10 text-text-heading border border-text-heading/10">
            Released {product.specSheet.basicInfo.releaseDate}
          </span>
        </div>

        {/* ===== Highlight strip ===== */}
        <div className="hidden lg:grid grid-cols-5 gap-4 mb-8">
          {[
            { icon: Cpu, value: product.specSheet.performance.processor, label: 'Processor' },
            { icon: Camera, value: product.specSheet.cameraSystem.rear.split('+')[0].trim(), label: 'Main Camera' },
            { icon: Monitor, value: product.specSheet.display.size, label: 'Display' },
            { icon: BatteryCharging, value: product.specSheet.batteryCharging.capacity, label: 'Battery' },
            { icon: AppWindow, value: product.specSheet.performance.os, label: 'OS' },
          ].map((h, i) => (
            <div key={i} className="flex items-center gap-3 bg-text-on-dark border border-text-heading/10 rounded-lg p-3">
              <h.icon className="w-6 h-6 text-accent shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text-heading truncate">{h.value}</div>
                <div className="text-xs text-text-body">{h.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== Two-column hero: gallery left (sticky), info right ===== */}
        <div className="grid gap-8 lg:grid-cols-5 mb-10">
          {/* LEFT — gallery (2/5). Native CSS sticky below the 64px header
              (top-24 = 96px = 64px header + 32px gap); releases when the row ends. */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start">
            <div className="relative bg-text-on-dark border border-text-heading/10 rounded-lg p-4">
              {/* Spec Score badge overlay */}
              <div className="absolute top-3 left-3 z-10 bg-bg-dark text-text-on-dark rounded-lg px-3 py-2 shadow-md">
                <div className="text-[10px] uppercase tracking-wide text-text-on-dark/70">Spec Score</div>
                <div className="text-lg font-bold text-accent leading-none">{specScore}%</div>
              </div>
              {/* main image — real photo when available, gray placeholder
                  otherwise (fill + object-contain preserves any aspect) */}
              <div className="relative aspect-square w-full bg-bg-dark-secondary/10 flex items-center justify-center rounded-md overflow-hidden">
                {activeGallery.length > 0 ? (
                  <Image
                    src={activeGallery[activeIdx]!}
                    alt={`${product.imageAlt} — view ${activeIdx + 1} of ${activeGallery.length}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 384px"
                    onClick={showSeeAll ? () => setLightboxOpen(true) : undefined}
                    className={`object-contain p-2 ${showSeeAll ? 'cursor-zoom-in' : ''}`}
                    priority
                  />
                ) : (
                  <span className="text-text-body text-sm">
                    {activeImage === 0 ? product.imageAlt : `View ${activeImage + 1}`}
                  </span>
                )}
              </div>
              {/* prev / next */}
              <button
                aria-label="Previous image"
                onClick={() =>
                  activeGallery.length > 0 &&
                  setActiveImage((activeImage + activeGallery.length - 1) % activeGallery.length)
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-text-on-dark border border-text-heading/10 shadow flex items-center justify-center text-text-body hover:text-accent"
              >
                ‹
              </button>
              <button
                aria-label="Next image"
                onClick={() =>
                  activeGallery.length > 0 && setActiveImage((activeImage + 1) % activeGallery.length)
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-text-on-dark border border-text-heading/10 shadow flex items-center justify-center text-text-body hover:text-accent"
              >
                ›
              </button>
            </div>

            {/* thumbnail strip — SINGLE ROW always: up to MAX_THUMBS real
                thumbs, then a "+N" see-all tile that opens the lightbox
                (Amazon pattern) when the gallery is larger; ≤4 images show
                inline with no tile. Legacy placeholder buttons unchanged. */}
            {activeGallery.length > 0 ? (
              <div className="flex gap-3 mt-3">
                {inlineThumbs.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative aspect-square w-20 shrink-0 rounded-md overflow-hidden border transition-colors ${
                      activeIdx === i
                        ? 'border-accent bg-accent/10'
                        : 'border-text-heading/10 bg-text-on-dark hover:border-accent/50'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.imageAlt} — thumbnail ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-0.5"
                    />
                  </button>
                ))}
                {showSeeAll && (
                  <button
                    onClick={() => setLightboxOpen(true)}
                    aria-label={`See all ${activeGallery.length} images`}
                    className="relative aspect-square w-20 shrink-0 rounded-md overflow-hidden border transition-colors bg-bg-dark/60 hover:bg-bg-dark/80"
                  >
                    <Image
                      src={activeGallery[MAX_THUMBS]!}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover opacity-40"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-text-on-dark">
                      +{activeGallery.length - MAX_THUMBS}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-20 rounded-md flex items-center justify-center text-xs border transition-colors ${
                      activeImage === i
                        ? 'border-accent text-text-body bg-accent/10'
                        : 'border-text-heading/10 bg-text-on-dark text-text-body hover:border-accent/50'
                    }`}
                  >
                    {i === 0 ? product.imageAlt : `View ${i + 1}`}
                  </button>
                ))}
                <button
                  disabled
                  className="h-20 rounded-md flex items-center justify-center text-xs border border-text-heading/10 bg-text-on-dark text-text-body cursor-default"
                >
                  +3
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — info (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Variant (left) + Price (right) — side-by-side on desktop,
                stacked Variant-first on mobile. One grid row so both boxes
                stretch to equal height. */}
            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              {/* variant selector */}
              <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5">
                <h2 className="text-base font-semibold text-text-heading mb-4">Choose Variant</h2>
                <div className="space-y-4">
                  {/* Color swatches — rendered ONLY when the product has
                      color-specific photos (colorImages). No color images =
                      no selector, per the catalog rule. */}
                  {showColorSwatches && (
                    <div>
                      <div className="text-sm font-medium text-text-body mb-2">
                        Color: <span className="text-text-heading">{colorImages[safeActiveColor]?.color}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {colorImages.map((ci, i) => (
                          <button
                            key={ci.color}
                            aria-label={ci.color}
                            title={ci.color}
                            onClick={() => {
                              setActiveColor(i);
                              setActiveImage(0); // restart on the new color's hero
                            }}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              safeActiveColor === i
                                ? 'border-accent scale-110'
                                : 'border-text-heading/10 hover:border-text-heading/40'
                            }`}
                            style={{ backgroundColor: colorHex(ci.color) }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Package/bundle options (e.g. DJI Standard vs Adventure
                      Combo) — a purchasable dimension, not a color. Drives
                      the variant price like storage does. */}
                  {purchaseOptions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-text-body mb-2">Package:</div>
                      <div className="flex flex-wrap gap-2">
                        {purchaseOptions.map((opt, i) => (
                          <VariantButton
                            key={opt}
                            selected={activePurchase === i}
                            onClick={() => setActivePurchase(i)}
                          >
                            {opt}
                          </VariantButton>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-text-body mb-2">Storage:</div>
                    <div className="flex flex-wrap gap-2">
                      {storageOptions.map((opt, i) => (
                        <VariantButton
                          key={opt}
                          selected={activeStorage === i}
                          onClick={() => setActiveStorage(i)}
                        >
                          {opt}
                        </VariantButton>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* price info — no CTA ("Check Latest Price" removed); content
                  vertically centered to fill the space beside the variant box.
                  Shows the SELECTED VARIANT's price (variantPrice) — updates
                  immediately when storage changes. */}
              <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5 flex flex-col justify-center">
                {/* Confirmed vs estimated price + source note (detailed). */}
                <div className="text-3xl font-bold">
                  <PriceTag product={product} detailed resolved={resolvedPrice} />
                </div>
                <div className="text-sm text-text-body mt-1">
                  {resolvedPrice.priceEstimated
                    ? 'Estimated market reference — not an official Bangladesh price'
                    : '(Official Price in Bangladesh)'}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-body mt-3">
                  <Info className="w-3.5 h-3.5" />
                  Prices may vary by store and variant
                </div>
              </div>
            </div>

            {/* key specifications (right column summary) */}
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5">
              <h2 className="text-base font-semibold text-text-heading mb-4">Key Specifications</h2>
              <div className="space-y-1">
                <KeyValue label="Display" value={`${product.specSheet.display.size}, ${product.specSheet.display.type}, ${product.specSheet.display.refreshRate}`} />
                <KeyValue label="Processor" value={product.specSheet.performance.processor} />
                <KeyValue label="RAM" value={product.specSheet.performance.ram} />
                <KeyValue label="Storage" value={product.specSheet.performance.storage} />
                <KeyValue label="Main Camera" value={product.specSheet.cameraSystem.rear} />
                <KeyValue label="Battery" value={`${product.specSheet.batteryCharging.capacity}, ${product.specSheet.batteryCharging.charging}`} />
                <KeyValue label="OS" value={product.specSheet.performance.os} />
              </div>
            </div>

            {/* additional info */}
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5">
              <h2 className="text-base font-semibold text-text-heading mb-4">Additional Info</h2>
              <div className="space-y-1">
                <KeyValue label="Brand" value={product.specSheet.basicInfo.brand} />
                <KeyValue label="Model" value={product.specSheet.basicInfo.model} />
                <KeyValue label="Released" value={product.specSheet.basicInfo.releaseDate} />
                <KeyValue label="Weight" value={product.specSheet.buildDesign.weight} />
                <KeyValue label="Network" value={product.specSheet.connectivity.network} />
                <KeyValue label="Bluetooth" value={product.specSheet.connectivity.bluetooth} />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center px-5 py-3 bg-accent text-text-on-dark font-medium rounded-lg hover:bg-accent-hover transition-colors"
              >
                Add to Cart
              </button>
              {/* Upcoming → Pre-Order (inline confirmation, not checkout).
                  Estimated-price products must never reach checkout — Coming Soon. */}
              {isUpcoming(product) ? (
                preOrdered ? (
                  <button
                    disabled
                    className="flex items-center justify-center px-5 py-3 bg-bg-dark/70 text-text-on-dark/80 font-medium rounded-lg cursor-not-allowed"
                  >
                    ✓ Pre-order Requested
                  </button>
                ) : (
                  <button
                    onClick={handlePreOrder}
                    className="flex items-center justify-center px-5 py-3 bg-bg-dark text-text-on-dark font-medium rounded-lg hover:bg-bg-dark-secondary transition-colors"
                  >
                    Pre-Order
                  </button>
                )
              ) : isPurchasable(product) ? (
                <button
                  onClick={handleBuyNow}
                  className="flex items-center justify-center px-5 py-3 bg-bg-dark text-text-on-dark font-medium rounded-lg hover:bg-bg-dark-secondary transition-colors"
                >
                  Buy Now
                </button>
              ) : (
                <button
                  disabled
                  title={
                    product.priceEstimated
                      ? 'Estimated price only — Buy Now opens once an official Bangladesh price is confirmed'
                      : "Price coming soon — this product can't be ordered yet"
                  }
                  className="flex items-center justify-center px-5 py-3 bg-bg-dark/50 text-text-on-dark/70 font-medium rounded-lg cursor-not-allowed"
                >
                  {product.priceEstimated ? 'Buy Now (Estimated Price)' : 'Buy Now (Price TBD)'}
                </button>
              )}
              {isPurchasable(product) ? (
                <button className="flex items-center justify-center px-5 py-3 bg-text-on-dark border border-text-heading/20 text-text-body font-medium rounded-md hover:bg-bg-light transition-colors">
                  Notify Me
                </button>
              ) : (
                <button
                  onClick={handleNotifyMe}
                  className="flex items-center justify-center px-5 py-3 bg-accent text-text-on-dark font-medium rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Notify Me
                </button>
              )}
            </div>
          </div>
        </div>

        {showFullSpecs && (
        <>
        {/* ===== Full-width sectioned specifications ===== */}
        <h2 className="text-2xl font-bold text-text-heading mb-5">Specifications</h2>
        <div className="grid gap-5 md:grid-cols-2 mb-12">
          <SectionCard title="Basic Info">
            <KeyValue label="Model" value={product.specSheet.basicInfo.model} />
            <KeyValue label="Brand" value={product.specSheet.basicInfo.brand} />
            <KeyValue label="Release Date" value={product.specSheet.basicInfo.releaseDate} />
          </SectionCard>

          <SectionCard title="Display">
            <KeyValue label="Type" value={product.specSheet.display.type} />
            <KeyValue label="Size" value={product.specSheet.display.size} />
            <KeyValue label="Resolution" value={product.specSheet.display.resolution} />
            <KeyValue label="Refresh Rate" value={product.specSheet.display.refreshRate} />
            <KeyValue label="Protection" value={product.specSheet.display.protection} />
          </SectionCard>

          <SectionCard title="Performance">
            <KeyValue label="Processor" value={product.specSheet.performance.processor} />
            <KeyValue label="RAM" value={product.specSheet.performance.ram} />
            <KeyValue label="Storage" value={product.specSheet.performance.storage} />
            <KeyValue label="OS" value={product.specSheet.performance.os} />
          </SectionCard>

          <SectionCard title="Camera System">
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-text-body">Rear: </span>
                <span className="text-text-heading">{product.specSheet.cameraSystem.rear}</span>
              </div>
              <div>
                <span className="font-medium text-text-body">Front: </span>
                <span className="text-text-heading">{product.specSheet.cameraSystem.front}</span>
              </div>
              <div>
                <span className="font-medium text-text-body">Features:</span>
                <IconList items={product.specSheet.cameraSystem.features} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Battery & Charging">
            <KeyValue label="Capacity" value={product.specSheet.batteryCharging.capacity} />
            <KeyValue label="Charging" value={product.specSheet.batteryCharging.charging} />
          </SectionCard>

          <SectionCard title="Build & Design">
            <KeyValue label="Dimensions" value={product.specSheet.buildDesign.dimensions} />
            <KeyValue label="Weight" value={product.specSheet.buildDesign.weight} />
            <KeyValue label="Materials" value={product.specSheet.buildDesign.materials} />
            <KeyValue label="Colors" value={product.specSheet.buildDesign.colors.join(', ')} />
          </SectionCard>

          <SectionCard title="Connectivity">
            <KeyValue label="Network" value={product.specSheet.connectivity.network} />
            <KeyValue label="Bluetooth" value={product.specSheet.connectivity.bluetooth} />
            <div className="flex items-baseline justify-between gap-4 py-1.5">
              <span className="text-sm font-medium text-text-body shrink-0">Ports</span>
              <span className="text-sm text-text-heading text-right">
                {product.specSheet.connectivity.ports.join(', ')}
              </span>
            </div>
          </SectionCard>

          <SectionCard title="Sensors">
            <IconList items={product.specSheet.sensors} />
          </SectionCard>

          <SectionCard title="AI Features">
            <IconList items={product.specSheet.aiFeatures} />
          </SectionCard>

          <SectionCard title="Notable Limitations">
            <IconList items={product.specSheet.notableLimitations} />
          </SectionCard>
        </div>
        </>
        )}
      </div>
      {/* Amazon-style see-all lightbox — only for galleries larger than the
          inline thumb row; opens on the currently active image. */}
      {lightboxOpen && activeGallery.length > 0 && (
        <LightboxGallery
          images={activeGallery}
          alt={product.title}
          initialIndex={activeIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
};

export default QuickLookDetail;
