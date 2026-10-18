import type { Product } from './products';
import { BRAND_NAME } from './brand';
import { productSpecDescription } from './productDescription';

/**
 * Hand-tuned SEO metadata for the 22 product detail pages.
 *
 * Both product routes (/quick-look/[slug] and /shop/[slug]) render the SAME
 * product catalog, so per-product SEO copy is declared here once and consumed
 * by both. The two surfaces intentionally differ in intent — Quick Look
 * answers "what's the price/specs?" (lookup intent), Shop answers "where do
 * I buy?" (buying intent) — with per-product descriptions that match the
 * visible page (deal prices, estimated prices, pre-order status).
 *
 * All copy is derived from real product data: prices, old prices, and
 * estimated/upcoming flags come straight from products.ts. Metadata renders
 * only in <head> (title/description/openGraph) and JSON-LD — never as
 * visible page text.
 */

interface ProductSeoCopy {
  /** Shop description spec phrase, e.g. "Flagship camera, S Pen, premium display". */
  shopSpecs: string;
  /** Quick Look description spec phrase, e.g. "camera, display, and performance details". */
  quickLookSpecs: string;
  /** Exact <title> when the generated template cannot fit the 60-char
   *  budget (the template adds " | Jupiter BD"). Rendered as an ABSOLUTE
   *  title — see quickLookSeoTitleOverride — so no suffix is appended. */
  titleOverride?: string;
  /** Exact meta/og/twitter description when the generated one would state
   *  something the data cannot support (e.g. a Bangladesh price that does
   *  not exist). Used by BOTH product routes. */
  descriptionOverride?: string;
}

const seoCopy: Record<string, ProductSeoCopy> = {
  /** Apple announced HomeView on October 13, 2026 with US pricing only —
   *  there is no Bangladesh price or release date, so both the title (49
   *  chars, forced absolute) and the description state only what Apple
   *  announced. Figures come from the Apple pages listed in the guide's
   *  "sources checked" line. */
  'apple-homeview-smart-display': {
    shopSpecs: 'US launch price, setup costs, and availability',
    quickLookSpecs: 'US launch price, setup costs, and Bangladesh availability',
    titleOverride: 'Apple HomeView Price in Bangladesh & Release Date',
    descriptionOverride:
      'Apple HomeView smart display: US launch price from $299, US availability from Nov 13, 7-inch screen, four colors. Not yet announced for Bangladesh.',
  },
  'honor-robot-phone': {
    shopSpecs: 'Innovative design',
    quickLookSpecs: 'release status, and buying guide',
  },
  'samsung-galaxy-s26-ultra': {
    shopSpecs: 'Flagship camera, S Pen, premium display',
    quickLookSpecs: 'camera, display, and performance details',
  },
  'apple-iphone-17-pro-max': {
    shopSpecs: 'Latest A-series chip, pro camera system, premium build',
    quickLookSpecs: 'camera system, chip performance, and availability',
  },
  'vivo-x300-pro': {
    shopSpecs: 'Advanced camera system, flagship performance',
    quickLookSpecs: 'camera setup, and display details',
  },
  'tecno-camon-40-pro': {
    shopSpecs: 'Strong camera performance, reliable battery',
    quickLookSpecs: 'camera, battery, and performance',
  },
  'infinix-note-60-pro': {
    shopSpecs: 'great value performance',
    quickLookSpecs: 'current deal',
  },
  'samsung-galaxy-z-fold7-256gb': {
    shopSpecs: 'Foldable display, flagship performance',
    quickLookSpecs: 'foldable display specs, camera, and performance',
  },
  'sony-wh-1000xm5-wireless-headphones': {
    shopSpecs: 'industry-leading noise cancellation',
    quickLookSpecs: 'noise cancellation, battery life, and sound quality',
  },
  'playstation-5-slim-disc-console': {
    shopSpecs: 'limited-time offer',
    quickLookSpecs: 'storage options, gaming features, and current deal',
  },
  'ugreen-usb-c-hub-5-in-1': {
    shopSpecs: 'Multi-port connectivity, compact design',
    quickLookSpecs: 'ports and compatibility',
  },
  'aula-f75-pro-wireless-mechanical-keyboard': {
    shopSpecs: 'premium typing experience',
    quickLookSpecs: 'switch type, connectivity, and current deal',
  },
  'samsung-galaxy-tab-s10-ultra': {
    shopSpecs: 'Large display, S Pen support, flagship performance',
    quickLookSpecs: 'display, performance, and S Pen support',
  },
  'apple-ipad-air-11-m3': {
    shopSpecs: 'M3 chip performance, stunning display',
    quickLookSpecs: 'M3 chip performance, display, and storage options',
  },
  'asus-vivobook-15-x1504va': {
    shopSpecs: 'Reliable performance, everyday computing',
    quickLookSpecs: 'processor, RAM, storage, and display specs',
  },
  'lenovo-ideacentre-aio-27': {
    shopSpecs: 'display, processor',
    quickLookSpecs: 'display, and processor',
  },
  'xiaomi-redmi-watch-5': {
    shopSpecs: 'Long battery life, health tracking',
    quickLookSpecs: 'battery life, display, and health tracking features',
  },
  'apple-airpods-pro-3': {
    shopSpecs: 'Active noise cancellation, premium sound',
    quickLookSpecs: 'noise cancellation, battery life, and features',
  },
  'anker-soundcore-r50i-earbuds': {
    shopSpecs: 'Clear sound, long battery life',
    quickLookSpecs: 'battery life, sound quality, and features',
  },
  'dji-osmo-action-5-pro': {
    shopSpecs: 'High-resolution video, strong stabilization',
    quickLookSpecs: 'video resolution, stabilization, and battery life',
  },
  'anker-powercore-20000-power-bank': {
    shopSpecs: 'Reliable capacity, fast charging',
    quickLookSpecs: 'capacity, charging speed, and port options',
  },
  'xiaomi-robot-vacuum-s10': {
    shopSpecs: 'Smart mapping, strong suction power',
    quickLookSpecs: 'suction power, mapping, and battery life',
  },
  'xiaomi-smart-tv-x-pro-55': {
    shopSpecs: 'display resolution',
    quickLookSpecs: 'display resolution and smart features',
  },
};

const taka = (n: number): string => `৳${n.toLocaleString('en-US')}`;

/**
 * A product's exact <title> when the owner supplied one because the
 * generated template would break the 60-character budget. Callers MUST
 * render this as an absolute title (metadata `title: { absolute }`),
 * otherwise the root layout's "%s | Jupiter BD" template pushes it back
 * over 60. Returns null for every other product (no behavior change).
 */
export function quickLookSeoTitleOverride(product: Product): string | null {
  return seoCopy[slugOf(product)]?.titleOverride ?? null;
}

/** Quick Look title template: "{Product} Price in Bangladesh — Specs & Review | Jupiter BD" */
export function quickLookSeoTitle(product: Product): string {
  const override = quickLookSeoTitleOverride(product);
  if (override) return override;
  return `${product.title} Price in Bangladesh — Specs & Review | ${BRAND_NAME}`;
}

/**
 * Quick Look description. Matches the SEO brief per product state:
 * - deal: "{Product} price in Bangladesh: ৳X (was ৳Y). Check … In stock."
 * - regular: "{Product} price in Bangladesh: ৳X. Check … In stock now."
 * - estimated+available: "{Product} estimated price in Bangladesh: ৳X. Check … Coming soon."
 * - upcoming (pre-order): "{Product} estimated price in Bangladesh: ৳X. Check … Pre-order available."
 */
export function quickLookSeoDescription(product: Product): string {
  const copy = seoCopy[slugOf(product)];
  if (copy?.descriptionOverride) return copy.descriptionOverride;
  const specs = copy?.quickLookSpecs ?? 'full specifications';

  let pricePart: string;
  if (product.price === null) {
    pricePart = `${product.title} price in Bangladesh: coming soon.`;
  } else if (product.oldPrice !== null && !product.priceEstimated) {
    pricePart = `${product.title} price in Bangladesh: ${taka(product.price)} (was ${taka(product.oldPrice)}).`;
  } else if (product.priceEstimated) {
    pricePart = `${product.title} estimated price in Bangladesh: ${taka(product.price)}.`;
  } else {
    pricePart = `${product.title} price in Bangladesh: ${taka(product.price)}.`;
  }

  const availability = productStatusTail(product);
  // Spec attributes from the SHARED filtered builder — the same source the
  // Product JSON-LD description uses, so meta/og/twitter and schema stay
  // consistent. The builder's filter guarantees no "N/A", "None", "TBD",
  // or double-space residue can ever appear here. Sentence:
  // "… price in Bangladesh: ৳X. 250g, USB-C charging. Pre-order available."
  const specClause = specClauseOf(product);
  const specPart = specClause ? ` ${specClause}.` : '';
  return `${pricePart}${specPart} Check full specifications, ${specs}. ${availability}`;
}

/**
 * Comma-joined list of the product's usable spec values (display size
 * + type, processor, storage, weight) — built by the shared filtered
 * builder, with the brand-model lead and closing tail stripped. Empty
 * when nothing usable (then the generic "Check full specifications"
 * fallback above applies).
 */
function specClauseOf(product: Product): string {
  const { specSheet: spec } = product;
  const brandModel = spec.basicInfo.model
    .toLowerCase()
    .startsWith(spec.basicInfo.brand.toLowerCase())
    ? spec.basicInfo.model
    : `${spec.basicInfo.brand} ${spec.basicInfo.model}`;
  const full = productSpecDescription(product, brandModel);
  // Shape: "<brandModel>: <clauses>. Full specs and Bangladesh price on
  // Jupiter BD." — take only the clause segment between the two.
  const start = full.indexOf(': ');
  const end = full.lastIndexOf('. Full specs');
  if (start === -1 || end === -1 || end <= start) return '';
  const clause = full.slice(start + 2, end).trim();
  return clause.length > 0 ? clause : '';
}

/** Shop title template: "{Product} — Buy Online in Bangladesh | Jupiter BD" */
export function shopSeoTitle(product: Product): string {
  return `${product.title} — Buy Online in Bangladesh | ${BRAND_NAME}`;
}

/**
 * Shop description. Matches the SEO brief per product state:
 * - regular: "Buy {Product} in Bangladesh. {Specs}. Price: ৳X. In stock, fast delivery."
 * - deal: "Buy {Product} in Bangladesh. Now ৳X (was ৳Y), {spec clause}. In stock."
 * - estimated+available: "Coming soon: {Product} in Bangladesh. Estimated price ৳X. Reserve your spot for launch updates."
 * - upcoming (pre-order): "Pre-order {Product} in Bangladesh. {Specs}, estimated price ৳X. Reserve yours before stock runs out."
 */
export function shopSeoDescription(product: Product): string {
  const copy = seoCopy[slugOf(product)];
  if (copy?.descriptionOverride) return copy.descriptionOverride;
  const specs = copy?.shopSpecs ?? 'solid specs';

  if (product.status === 'upcoming') {
    const price =
      product.price !== null
        ? `estimated price ${taka(product.price)}`
        : 'price to be announced';
    return `Pre-order ${product.title} in Bangladesh. ${specs}, ${price}. Reserve yours before stock runs out.`;
  }

  if (product.priceEstimated) {
    const price =
      product.price !== null ? `Estimated price ${taka(product.price)}.` : '';
    return `Coming soon: ${product.title} in Bangladesh. ${price} Reserve your spot for launch updates.`;
  }

  if (product.price === null) {
    return `Buy ${product.title} in Bangladesh. ${specs}. Price coming soon.`;
  }

  if (product.oldPrice !== null) {
    return `Buy ${product.title} in Bangladesh. Now ${taka(product.price)} (was ${taka(product.oldPrice)}), ${specs}. In stock, fast delivery.`;
  }

  return `Buy ${product.title} in Bangladesh. ${specs}. Price: ${taka(product.price)}. In stock, fast delivery.`;
}

function slugOf(product: Product): string {
  return product.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function productStatusTail(product: Product): string {
  if (product.status === 'upcoming') return 'Pre-order available.';
  if (product.priceEstimated) return 'Coming soon.';
  if (product.oldPrice !== null) return 'In stock.';
  return 'In stock now.';
}
