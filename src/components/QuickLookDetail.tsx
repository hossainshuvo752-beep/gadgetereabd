"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/products';
import { track } from '@/lib/tracking';
import PriceTag from '@/components/PriceTag';
import LightboxGallery from '@/components/LightboxGallery';
import ProductActions, { type PurchaseSurface } from '@/components/ProductActions';
import {
  isUpcoming,
  storageOptionsOf,
  specSheetOf,
  variantPrice,
  defaultVersionOf,
  versionOf,
  type ResolvedPrice,
} from '@/lib/products';
import {
  productQuickLookMainAlt,
  productGalleryAlt,
  galleryAltOverride,
} from '@/lib/imageAlt';
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

/** ISO date (YYYY-MM-DD) → "22 October 2026" for the visible provenance line.
 *  Parsed by hand rather than through Date, so a UTC build host and a local
 *  one print the same day (the ISO date is already the checked day). */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
function formatCheckedDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day || !MONTH_NAMES[month - 1]) return iso;
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

function KeyValue({ label, value }: { label: string; value: string }) {
  // A field the manufacturer does not publish is left as an empty string in
  // the data and the ROW IS OMITTED here — that is how a spec we cannot
  // verify stays off the page instead of printing "TBD" or "N/A".
  if (!value || !value.trim()) return null;
  // Two-column CSS GRID row (not flex): the label owns a fixed-width left
  // column (min 90px, max 35%), the value owns the rest — a long value can
  // only ever wrap WITHIN its own column, never below/into the label space
  // (the old flex-wrap made wrapped values stack under the label, reading
  // as one merged blob). items-start pins the label to the row top; the
  // border + padding keep even 3-line values reading as one pair.
  // SECONDARY compactness: very long values render one step smaller on
  // mobile only (md: restores the standard size) — no information trimmed.
  const long = value.length > 40;
  return (
    <div className="grid grid-cols-[minmax(90px,35%)_1fr] items-start gap-x-4 py-1.5 border-b border-text-heading/10 last:border-b-0">
      <span className="text-sm font-medium text-text-body">{label}</span>
      <span
        className={`min-w-0 break-words ${
          // long (wrapping) values read better left-aligned inside their
          // column; short ones keep the tidy right edge.
          long ? 'text-left text-[13px] md:text-sm' : 'text-right text-sm'
        } text-text-heading`}
      >
        {value}
      </span>
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
      onClick={onClick}              className={`tactile px-4 py-1.5 text-sm rounded-md border ${
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
 * FEATURE FLAG — availability/warranty/release-date pill row under the
 * product title. Currently OFF: the row kept overlapping on mobile, and its
 * info is redundant (CTA button row communicates availability; release
 * date + warranty live in Additional Info). Flip to true to restore the
 * pills everywhere (Quick Look + Shop detail share this component).
 */
const SHOW_AVAILABILITY_BADGES = false;

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
  /** Which detail surface this is — 'shop-detail' for /shop/[slug],
   *  'quick-look' for /quick-look/[slug]. Forwarded to ProductActions so
   *  Buy Now / Free Order / Notify Me clicks are attributed correctly. */
  surface?: PurchaseSurface;
}> = ({ product, showFullSpecs = true, surface = 'quick-look' }) => {
  // Gallery + variant state
  // Funnel signal (fire-and-forget, once per mount): a product detail page
  // was actually viewed with this product's data.
  useEffect(() => {
    track('product_view', { product_id: product.id, surface });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, surface]);

  const [activeImage, setActiveImage] = useState(0);
  // Real photo gallery (hero first) when the product has one; empty for
  // products still on the placeholder flow (single gray box, no thumbs).
  const galleryImages: string[] =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : product.heroImage
        ? [product.heroImage]
        : [];
  // VERSIONS (Global / China) — the optional dimension ABOVE color. Products
  // without `versions` never render the Version row and keep the exact gallery,
  // color, storage and spec behavior they had before.
  const versions = product.versions ?? [];
  const hasVersions = versions.length > 0;
  const defaultVersion = defaultVersionOf(product);
  const [activeVersionId, setActiveVersionId] = useState(defaultVersion?.id ?? '');
  const version = versions.find((v) => v.id === activeVersionId) ?? defaultVersion;
  // Color→image sets for the SELECTED version. Absent/empty = the product has
  // no color-specific photos → NO color selector is rendered at all (nothing
  // meaningful to select) and the flat gallery shows instead.
  const colorImages = (version ? version.colorImages : product.colorImages) ?? [];
  const showColorSwatches = colorImages.length > 0;
  const [activeColor, setActiveColor] = useState(0);
  const [activeStorage, setActiveStorage] = useState(0);
  // Deep link: /quick-look/<slug>?version=china opens on that version. Read on
  // the client (window.location) so the route stays statically rendered and
  // the server-rendered default / canonical URL stay version-free.
  useEffect(() => {
    if (!hasVersions) return;
    const requested = versionOf(product, new URLSearchParams(window.location.search).get('version'));
    if (requested && requested.id !== activeVersionId) {
      setActiveVersionId(requested.id);
      setActiveColor(0);
      setActiveStorage(0);
      setActiveImage(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // While a color is selected, that color's images REPLACE the flat gallery.
  const activeGallery: string[] =
    showColorSwatches ? colorImages[activeColor]?.images ?? galleryImages : galleryImages;
  // Keeps prev/next + display consistent even if state ever overshoots.
  const activeIdx = activeGallery.length > 0 ? activeImage % activeGallery.length : 0;

  // The spec sheet for the SELECTED version: the base sheet with that
  // version's overrides merged (cameras, battery, charging, body…).
  const spec = specSheetOf(product, version?.id);

  // Storage/variant options (e.g. "256GB/512GB UFS 4.0" -> ["256GB", "512GB UFS 4.0"])
  // — the same split every surface uses via storageOptionsOf(). A version
  // product lists exactly its PRICED options instead, so an unpriced
  // combination can never be selected.
  const storageOptions: string[] = version
    ? version.variants.map((v) => v.label)
    : storageOptionsOf(product);

  // Selected-variant pricing — the displayed price follows the chosen option.
  // Package options (purchaseOptions) take priority when present; otherwise
  // the storage selection drives the price.
  const purchaseOptions: string[] = product.purchaseOptions ?? [];
  const [activePurchase, setActivePurchase] = useState(0);
  const selectedOptionLabel =
    purchaseOptions.length > 0
      ? purchaseOptions[Math.min(activePurchase, purchaseOptions.length - 1)]
      : storageOptions[activeStorage] ?? null;
  const resolvedPrice: ResolvedPrice = variantPrice(product, selectedOptionLabel, version?.id);

  // One click on a version button swaps EVERYTHING that belongs to it: its
  // gallery (back to the first image), its colors (first preselected), its
  // priced storage options and, through `spec` above, its differing specs.
  const switchVersion = (id: string) => {
    setActiveVersionId(id);
    setActiveColor(0);
    setActiveStorage(0);
    setActivePurchase(0);
    setActiveImage(0);
  };

  // Keep the color selection inside bounds (defensive; no render-phase setState).
  const safeActiveColor = showColorSwatches
    ? Math.min(activeColor, colorImages.length - 1)
    : 0;
  // Alt label for a gallery image: the colour, plus the VERSION when this
  // product has versions, so every gallery/thumbnail/lightbox alt names both
  // ("Frost Blue (Global version)"). Products without versions pass the
  // colour alone — byte-identical alt text to before this change.
  const galleryVariantLabel = (color?: string) =>
    color ? `${color}${version ? ` (${version.shortLabel} version)` : ''}` : undefined;
  const activeColorName = showColorSwatches ? colorImages[safeActiveColor]?.color : undefined;
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
  // Computed from the SELECTED version's spec sheet — the same formula every
  // other product uses, so the badge is per-version and deterministic (the
  // Global sheet is the base, China's overrides are merged in).
  const filled = [
    spec.display.type !== 'None',
    spec.performance.processor !== 'N/A',
    spec.cameraSystem.rear !== 'None',
    spec.batteryCharging.capacity !== 'N/A',
    spec.connectivity.network !== 'N/A',
    spec.aiFeatures.length > 0,
  ].filter(Boolean).length;
  const specScore = Math.round((filled / 6) * 100);

  // The currently selected variant ("Titanium Black / 512GB"), composed once
  // and handed to ProductActions — Add to Cart, Buy Now and Free Order all
  // carry the same selection.
  // Does this product have anything to choose at all? Products whose data
  // has no color photos, no package options and no real storage dimension
  // (the HomeView) render no variant card, and the price card then takes
  // the full row instead of leaving an empty half-width box.
  const hasVariantChoices =
    showColorSwatches || storageOptions.length > 0 || purchaseOptions.length > 0;

  const selectedVariant = (() => {
    const chosenColor = showColorSwatches
      ? colorImages[safeActiveColor]?.color ?? 'Standard'
      : 'Standard';
    const chosenStorage = storageOptions[activeStorage] ?? '';
    const chosenPackage = purchaseOptions[activePurchase] ?? '';
    return (
      [version?.shortLabel, chosenPackage || chosenColor, chosenStorage]
        .filter(Boolean)
        .join(' / ') || 'Standard'
    );
  })();

  return (
    <section className="py-5 md:py-10 bg-bg-light min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== Title block ===== */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-text-body mb-1">
              <Smartphone className="w-4 h-4" />
              <span className="font-semibold text-text-heading">{spec.basicInfo.brand}</span>
            </div>
            <h1 className="text-3xl font-bold text-text-heading">{product.title}</h1>
          </div>
        </div>

        {/* Status pills — TEMPORARILY HIDDEN via SHOW_AVAILABILITY_BADGES.
            Why: the row kept overlapping/clipping on mobile (long data-driven
            labels like "Upcoming — Pre-Order Open" + "Released Aug 2026"
            can't fit small screens), and the information is redundant —
            availability is already communicated by the CTA button row
            (Add to Cart / Buy Now / Pre-Order / Notify Me), while release
            date and warranty live in the Additional Info table.
            To restore: flip the flag below to true. */}
        {SHOW_AVAILABILITY_BADGES && (
          <div className="flex flex-nowrap items-center gap-1.5 md:gap-2 mb-3 md:mb-6 overflow-x-auto hide-scrollbar">
            <span className="inline-flex items-center gap-1 min-w-0 truncate px-2 py-0.5 text-[11px] md:px-3 md:py-1 md:text-xs rounded-full font-semibold bg-accent/10 text-accent-hover">
              {isUpcoming(product) ? '◌ Upcoming — Pre-Order Open' : '● In Stock'}
            </span>
            <span className="inline-flex items-center gap-1 min-w-0 truncate px-2 py-0.5 text-[11px] md:px-3 md:py-1 md:text-xs rounded-full font-semibold bg-bg-dark-secondary/10 text-text-heading border border-text-heading/10">
              Official Warranty
            </span>
            <span className="inline-flex items-center gap-1 min-w-0 truncate px-2 py-0.5 text-[11px] md:px-3 md:py-1 md:text-xs rounded-full font-semibold bg-bg-dark-secondary/10 text-text-heading border border-text-heading/10">
              Released {spec.basicInfo.releaseDate}
            </span>
          </div>
        )}

        {/* ===== Highlight strip ===== */}
        <div className="hidden lg:grid grid-cols-5 gap-4 mb-8">
          {[
            { icon: Cpu, value: spec.performance.processor, label: 'Processor' },
            { icon: Camera, value: spec.cameraSystem.rear.split('+')[0].trim(), label: 'Main Camera' },
            { icon: Monitor, value: spec.display.size, label: 'Display' },
            { icon: BatteryCharging, value: spec.batteryCharging.capacity, label: 'Battery' },
            { icon: AppWindow, value: spec.performance.os, label: 'OS' },
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
        <div className="grid gap-4 md:gap-8 lg:grid-cols-5 mb-6 md:mb-10">
          {/* LEFT — gallery (2/5). Native CSS sticky below the 64px header
              (top-24 = 96px = 64px header + 32px gap); releases when the row ends.
              min-w-0: lets the column shrink below the gallery's min-content
              width on mobile — without it the thumb strip's intrinsic width
              pushed the whole grid past the viewport. */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start min-w-0">
            {/* ONE framed gallery unit on every breakpoint: the main image
                and its thumbnails share a single bordered container. DOM
                order is [thumbs, main]; flex-col-reverse shows main on top
                with a horizontal thumb row below on mobile/tablet, while
                lg:flex-row moves the thumbs into a VERTICAL column on the
                LEFT of the main image (Amazon-style rail, scrollable when
                a future gallery grows past the column height). */}
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-2.5 md:p-4 min-w-0">
              <div className="flex flex-col-reverse gap-2 md:gap-3 min-w-0 lg:flex-row lg:gap-4 lg:items-start">
                {/* thumbnails — horizontal SCROLLABLE row on mobile (more
                    thumbs than fit swipe sideways instead of pushing the
                    page wide — the root cause of the mobile overflow),
                    vertical column on desktop; same "+N" see-all tile rule
                    as before */}
                {activeGallery.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar lg:flex-col lg:overflow-x-visible lg:w-20 lg:max-h-[26rem] lg:overflow-y-auto shrink-0 min-w-0">
                    {inlineThumbs.map((img, i) => (
                      <button
                        key={img}
                        onClick={() => setActiveImage(i)}
                        aria-label={`View image ${i + 1}`}
                        className={`tactile relative aspect-square w-16 md:w-20 shrink-0 rounded-md overflow-hidden border ${
                          activeIdx === i
                            ? 'border-accent bg-accent/10'
                            : 'border-text-heading/10 bg-text-on-dark hover:border-accent/50'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={productGalleryAlt(product, i, activeGallery.length, galleryVariantLabel(colorImages[safeActiveColor]?.color), img)}
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
                  <div className="grid grid-cols-4 gap-3 overflow-x-auto hide-scrollbar lg:grid-cols-1 lg:overflow-x-visible lg:w-20 shrink-0 min-w-0">
                    {[0, 1, 2].map((i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}                          className={`h-16 md:h-20 rounded-md flex items-center justify-center text-xs border transition-colors ${
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
                      className="h-16 md:h-20 rounded-md flex items-center justify-center text-xs border border-text-heading/10 bg-text-on-dark text-text-body cursor-default"
                    >
                      +3
                    </button>
                  </div>
                )}

                {/* main image — Spec Score badge and prev/next arrows ride
                    on the image box itself (correct in both layouts) */}
                <div className="relative aspect-square w-full bg-bg-dark-secondary/10 flex items-center justify-center rounded-md overflow-hidden">
                  {/* Spec Score badge overlay */}
                  <div className="absolute top-3 left-3 z-10 bg-bg-dark text-text-on-dark rounded-lg px-3 py-2 shadow-md">
                    <div className="text-[10px] uppercase tracking-wide text-text-on-dark/70">Spec Score</div>
                    <div className="text-lg font-bold text-accent leading-none">{specScore}%</div>
                  </div>
                  {activeGallery.length > 0 ? (
                    <>
                      {/* Quick Look main image carries the price-keyword alt
                          (exactly once per page, Quick Look ONLY). */}
                      <Image
                        src={activeGallery[activeIdx]!}
                        /* A per-image override describes the ACTIVE image; the
                           thumbnail above renders the same file on the same
                           page, so the main image adds its placement to stay
                           unique (duplicate alt on one page fails the build
                           guard). Products without galleryAlts are unchanged. */
                        alt={
                          galleryAltOverride(product, activeGallery[activeIdx])
                            ? `${galleryAltOverride(product, activeGallery[activeIdx])} — main product image`
                            : version && activeColorName
                              ? productQuickLookMainAlt(
                                  product,
                                  `${version.shortLabel} version in ${activeColorName}`
                                )
                              : productQuickLookMainAlt(product)
                        }
                        fill
                        sizes="(max-width: 1024px) 100vw, 380px"
                        onClick={showSeeAll ? () => setLightboxOpen(true) : undefined}
                        className={`object-contain p-2 ${showSeeAll ? 'cursor-zoom-in' : ''}`}
                        priority
                      />
                    </>
                  ) : (
                    <span className="text-text-body text-sm">
                      {activeImage === 0 ? product.imageAlt : `View ${activeImage + 1}`}
                    </span>
                  )}
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
              </div>
            </div>
            {/* Visible product-level gallery note (only when the data sets
                one — e.g. "Images are renders…" for the HomeView). */}
            {product.galleryNote && (
              <p className="mt-2 text-xs text-text-body">{product.galleryNote}</p>
            )}
          </div>

          {/* RIGHT — info (3/5) */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Variant (left) + Price (right) — side-by-side on desktop,
                stacked Variant-first on mobile. One grid row so both boxes
                stretch to equal height. */}
            <div
              className={
                hasVariantChoices
                  ? 'grid gap-4 md:gap-6 md:grid-cols-2 items-stretch'
                  : 'grid gap-4 md:gap-6 items-stretch'
              }
            >
              {/* variant selector — only when the product has something to
                  choose (color swatches, package options or storage). */}
              {hasVariantChoices && (
              <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-3.5 md:p-5">
                <h2 className="text-base font-semibold text-text-heading mb-3 md:mb-4">Choose Variant</h2>
                <div className="space-y-3 md:space-y-4">
                  {/* Version — first, because it decides the gallery, the
                      colors, the priced storage options and the specs below.
                      Rendered ONLY for products that declare versions. */}
                  {hasVersions && version && (
                    <div>
                      <div className="text-sm font-medium text-text-body mb-2">
                        Version: <span className="text-text-heading">{version.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {versions.map((v) => (
                          <VariantButton
                            key={v.id}
                            selected={v.id === version.id}
                            onClick={() => switchVersion(v.id)}
                          >
                            {v.label}
                          </VariantButton>
                        ))}
                      </div>
                    </div>
                  )}
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
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
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
                  {storageOptions.length > 0 && (
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
                  )}
                </div>
              </div>
              )}

              {/* price info — no CTA ("Check Latest Price" removed); content
                  vertically centered to fill the space beside the variant box.
                  Shows the SELECTED VARIANT's price (variantPrice) — updates
                  immediately when storage changes. */}
              <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-3.5 md:p-5 flex flex-col justify-center">
                {/* Confirmed vs estimated price + source note (detailed). */}
                <div className="text-3xl font-bold">
                  <PriceTag product={product} detailed resolved={resolvedPrice} />
                </div>
                <div className="text-sm text-text-body mt-1">
                  {product.priceDisplayNote
                    ? product.priceDisplayNote
                    : resolvedPrice.priceEstimated
                      ? 'Estimated market reference — not an official Bangladesh price'
                      : '(Official Price in Bangladesh)'}
                </div>
                {/* Only meaningful when a price is actually shown — a product
                    with no price at all (the Apple HomeView) would otherwise
                    invite comparison shopping for a figure that does not
                    exist yet. */}
                {product.price !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-text-body mt-3">
                    <Info className="w-3.5 h-3.5" />
                    Prices may vary by store and variant
                  </div>
                )}
                {/* Freshness: only products whose price was re-checked against
                    named sources carry `priceCheckedAt`; every other product
                    renders nothing here (no invented date, no empty label). */}
                {product.priceCheckedAt && (
                  <div className="text-xs text-text-body mt-1.5">
                    Prices checked: {formatCheckedDate(product.priceCheckedAt)}
                  </div>
                )}
              </div>
            </div>

            {/* key specifications (right column summary) */}
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5">
              <h2 className="text-base font-semibold text-text-heading mb-4">Key Specifications</h2>
              <div className="space-y-1">
                <KeyValue label="Display" value={`${spec.display.size}, ${spec.display.type}, ${spec.display.refreshRate}`} />
                <KeyValue label="Processor" value={spec.performance.processor} />
                <KeyValue label="RAM" value={spec.performance.ram} />
                <KeyValue label="Storage" value={spec.performance.storage} />
                <KeyValue label="Main Camera" value={spec.cameraSystem.rear} />
                <KeyValue label="Battery" value={`${spec.batteryCharging.capacity}, ${spec.batteryCharging.charging}`} />
                <KeyValue label="OS" value={spec.performance.os} />
              </div>
            </div>

            {/* additional info */}
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5">
              <h2 className="text-base font-semibold text-text-heading mb-4">Additional Info</h2>
              <div className="space-y-1">
                <KeyValue label="Brand" value={spec.basicInfo.brand} />
                <KeyValue label="Model" value={spec.basicInfo.model} />
                <KeyValue label="Released" value={spec.basicInfo.releaseDate} />
                <KeyValue label="Weight" value={spec.buildDesign.weight} />
                <KeyValue label="Network" value={spec.connectivity.network} />
                <KeyValue label="Bluetooth" value={spec.connectivity.bluetooth} />
              </div>
            </div>

            {/* CTA buttons — the SHARED ProductActions row (Buy Now + Add to
                Cart, or Free Order only, plus Notify Me in both modes). Never
                hand-roll purchase buttons here. */}
            <ProductActions
              product={product}
              surface={surface}
              layout="detail"
              variant={selectedVariant}
            />
          </div>
        </div>

        {showFullSpecs && (
        <>
        {/* ===== Full-width sectioned specifications ===== */}
        <h2 className="text-2xl font-bold text-text-heading mb-5">Specifications</h2>
        <div className="grid gap-5 md:grid-cols-2 mb-12">
          <SectionCard title="Basic Info">
            <KeyValue label="Model" value={spec.basicInfo.model} />
            <KeyValue label="Brand" value={spec.basicInfo.brand} />
            <KeyValue label="Release Date" value={spec.basicInfo.releaseDate} />
          </SectionCard>

          <SectionCard title="Display">
            <KeyValue label="Type" value={spec.display.type} />
            <KeyValue label="Size" value={spec.display.size} />
            <KeyValue label="Resolution" value={spec.display.resolution} />
            <KeyValue label="Refresh Rate" value={spec.display.refreshRate} />
            <KeyValue label="Protection" value={spec.display.protection} />
          </SectionCard>

          <SectionCard title="Performance">
            <KeyValue label="Processor" value={spec.performance.processor} />
            <KeyValue label="RAM" value={spec.performance.ram} />
            <KeyValue label="Storage" value={spec.performance.storage} />
            <KeyValue label="OS" value={spec.performance.os} />
          </SectionCard>

          <SectionCard title="Camera System">
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-text-body">Rear: </span>
                <span className="text-text-heading">{spec.cameraSystem.rear}</span>
              </div>
              <div>
                <span className="font-medium text-text-body">Front: </span>
                <span className="text-text-heading">{spec.cameraSystem.front}</span>
              </div>
              <div>
                <span className="font-medium text-text-body">Features:</span>
                <IconList items={spec.cameraSystem.features} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Battery & Charging">
            <KeyValue label="Capacity" value={spec.batteryCharging.capacity} />
            <KeyValue label="Charging" value={spec.batteryCharging.charging} />
          </SectionCard>

          <SectionCard title="Build & Design">
            <KeyValue label="Dimensions" value={spec.buildDesign.dimensions} />
            <KeyValue label="Weight" value={spec.buildDesign.weight} />
            <KeyValue label="Materials" value={spec.buildDesign.materials} />
            <KeyValue label="Colors" value={spec.buildDesign.colors.join(', ')} />
          </SectionCard>

          <SectionCard title="Connectivity">
            <KeyValue label="Network" value={spec.connectivity.network} />
            <KeyValue label="Bluetooth" value={spec.connectivity.bluetooth} />
            <div className="grid grid-cols-[minmax(90px,35%)_1fr] items-start gap-x-4 py-1.5">
              <span className="text-sm font-medium text-text-body">Ports</span>
              <span className="text-sm text-text-heading text-right min-w-0 break-words">
                {spec.connectivity.ports.join(', ')}
              </span>
            </div>
          </SectionCard>

          <SectionCard title="Sensors">
            <IconList items={spec.sensors} />
          </SectionCard>

          <SectionCard title="AI Features">
            <IconList items={spec.aiFeatures} />
          </SectionCard>

          <SectionCard title="Notable Limitations">
            <IconList items={spec.notableLimitations} />
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
          alts={activeGallery.map((img, i) => productGalleryAlt(product, i, activeGallery.length, galleryVariantLabel(colorImages[safeActiveColor]?.color), img))}
          ariaLabelBase={product.title}
          initialIndex={activeIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </section>
  );
};

export default QuickLookDetail;
