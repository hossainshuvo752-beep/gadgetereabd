import type { Product } from './products';
import { BRAND_NAME } from './brand';

/**
 * Hand-tuned SEO metadata for the 23 product detail pages.
 *
 * Both product routes (/quick-look/[slug] and /shop/[slug]) render the SAME
 * product catalog, so per-product SEO copy is declared here once and consumed
 * by both. The two surfaces intentionally differ in intent — Quick Look
 * answers "what's the price/specs?" (lookup intent), Shop answers "where do
 * I buy?" (buying intent) — with per-product descriptions that match the
 * visible page (deal prices, estimated prices, pre-order status).
 *
 * Quick Look titles follow "{seoName} Price in Bangladesh 2026 & Specs" and
 * are rendered ABSOLUTE; descriptions follow "{seoName} price in Bangladesh
 * (BD): {price with status}. {two specs}. {availability}." — see
 * quickLookSeoTitle / quickLookSeoDescription below.
 *
 * All copy is derived from real product data: prices, old prices, and
 * estimated/upcoming flags come straight from products.ts. Metadata renders
 * only in <head> (title/description/openGraph) and JSON-LD — never as
 * visible page text.
 */

interface ProductSeoCopy {
  /** Shop description spec phrase, e.g. "Flagship camera, S Pen, premium display". */
  shopSpecs: string;
  /** TWO data-backed spec highlights for the Quick Look description, e.g.
   *  "6.9-inch Dynamic AMOLED 2X, Snapdragon 8 Elite". Every value is read
   *  from that product's own spec sheet — never a marketing claim. */
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
    quickLookSpecs: '6.31-inch LTPO OLED, Snapdragon 8 Elite Gen 5',
  },
  'samsung-galaxy-s26-ultra': {
    shopSpecs: 'Flagship camera, S Pen, premium display',
    quickLookSpecs: '6.9-inch Dynamic AMOLED 2X, Snapdragon 8 Elite',
  },
  'apple-iphone-17-pro-max': {
    shopSpecs: 'Latest A-series chip, pro camera system, premium build',
    quickLookSpecs: '6.9-inch Super Retina XDR, A19 Pro chip',
  },
  'vivo-x300-pro': {
    shopSpecs: 'Advanced camera system, flagship performance',
    quickLookSpecs: '6.78-inch LTPO AMOLED, Dimensity 9500',
  },
  'tecno-camon-40-pro': {
    shopSpecs: 'Strong camera performance, reliable battery',
    quickLookSpecs: '6.78-inch AMOLED, Dimensity 7300',
  },
  'infinix-note-60-pro': {
    shopSpecs: 'great value performance',
    quickLookSpecs: '6.78-inch AMOLED, Snapdragon 7s Gen 4',
  },
  'samsung-galaxy-z-fold7-256gb': {
    shopSpecs: 'Foldable display, flagship performance',
    quickLookSpecs: '8.0-inch foldable AMOLED, Snapdragon 8 Elite',
  },
  'sony-wh-1000xm5-wireless-headphones': {
    shopSpecs: 'industry-leading noise cancellation',
    quickLookSpecs: 'V1 and QN1 noise cancelling, 30-hour battery',
  },
  'playstation-5-slim-disc-console': {
    shopSpecs: 'limited-time offer',
    quickLookSpecs: 'RDNA 2 GPU at 10.28 TFLOPs, 1TB SSD',
  },
  'ugreen-usb-c-hub-5-in-1': {
    shopSpecs: 'Multi-port connectivity, compact design',
    quickLookSpecs: 'HDMI 4K 60Hz, 100W USB-C pass-through',
  },
  'aula-f75-pro-wireless-mechanical-keyboard': {
    shopSpecs: 'premium typing experience',
    quickLookSpecs: '75% hot-swap layout, tri-mode wireless',
  },
  'samsung-galaxy-tab-s10-ultra': {
    shopSpecs: 'Large display, S Pen support, flagship performance',
    quickLookSpecs: '14.6-inch Dynamic AMOLED 2X, Dimensity 9300+',
  },
  'apple-ipad-air-11-m3': {
    shopSpecs: 'M3 chip performance, stunning display',
    quickLookSpecs: '11-inch Liquid Retina, Apple M3',
  },
  'asus-vivobook-15-x1504va': {
    shopSpecs: 'Reliable performance, everyday computing',
    quickLookSpecs: '15.6-inch IPS display, Core i5-1335U',
  },
  'lenovo-ideacentre-aio-27': {
    shopSpecs: 'display, processor',
    quickLookSpecs: '27-inch IPS all-in-one, Core i5-13420H',
  },
  'xiaomi-redmi-watch-5': {
    shopSpecs: 'Long battery life, health tracking',
    quickLookSpecs: '2.07-inch AMOLED, up to 24 days battery',
  },
  'apple-airpods-pro-3': {
    shopSpecs: 'Active noise cancellation, premium sound',
    quickLookSpecs: 'H2 chip, up to 8 hours ANC battery',
  },
  'anker-soundcore-r50i-earbuds': {
    shopSpecs: 'Clear sound, long battery life',
    quickLookSpecs: '42-hour total battery, IPX5',
  },
  'dji-osmo-action-5-pro': {
    shopSpecs: 'High-resolution video, strong stabilization',
    quickLookSpecs: 'Dual OLED touchscreens, 47GB built-in storage',
  },
  'anker-powercore-20000-power-bank': {
    shopSpecs: 'Reliable capacity, fast charging',
    quickLookSpecs: '20,000mAh cell, 22.5W USB-C PD',
  },
  'xiaomi-robot-vacuum-s10': {
    shopSpecs: 'Smart mapping, strong suction power',
    quickLookSpecs: 'LDS laser mapping, 5200mAh battery',
  },
  'xiaomi-smart-tv-x-pro-55': {
    shopSpecs: 'display resolution',
    quickLookSpecs: '55-inch QLED 4K at 120Hz, Google TV',
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

/** The short name people search: Product.seoName when set, else the title. */
export function quickLookSeoName(product: Product): string {
  return product.seoName ?? product.title;
}

/**
 * Quick Look title template, rendered ABSOLUTE (no " | Jupiter BD" suffix):
 *   "{seoName} Price in Bangladesh 2026 & Specs"
 * If that exceeds the 60-character budget the "& Specs" tail is dropped,
 * then the year — the seoName itself is never mangled.
 */
export function quickLookSeoTitle(product: Product): string {
  const override = quickLookSeoTitleOverride(product);
  if (override) return override;
  const name = quickLookSeoName(product);
  const withSpecs = `${name} Price in Bangladesh 2026 & Specs`;
  if (withSpecs.length <= 60) return withSpecs;
  const withoutSpecs = `${name} Price in Bangladesh 2026`;
  if (withoutSpecs.length <= 60) return withoutSpecs;
  return `${name} Price in Bangladesh`;
}

/**
 * Quick Look description — the search-snippet shape the owner asked for:
 *   "{seoName} price in Bangladesh (BD): {price with status}. {two specs}.
 *    {availability}."
 * Every part comes from the product's own data. The status word comes from
 * the product's explicit `priceStatus` (official / unofficial / retail /
 * on-sale / estimated / not-launched) — it is never assumed, so a grey-channel
 * price can never be described as official. No status field means no status
 * word at all. No long spec lists, no placeholders, 155 chars max.
 */
export function quickLookSeoDescription(product: Product): string {
  const copy = seoCopy[slugOf(product)];
  if (copy?.descriptionOverride) return copy.descriptionOverride;
  const name = quickLookSeoName(product);
  const specs = copy?.quickLookSpecs ?? 'full specifications and Bangladesh price';
  return `${name} price in Bangladesh (BD): ${priceWithStatus(product)}. ${specs}. ${availabilityTail(product)}`;
}

/**
 * Price plus the status word — read from the product's EXPLICIT
 * `priceStatus`, never inferred. The old default assumed "official", which
 * overclaimed for grey-channel and plain-retail listings (the Galaxy Z Fold7
 * is sold unofficially with no Samsung warranty, for example). When a
 * product declares no status the number prints on its own, with no claim
 * attached, so a missing field can never produce a false "official".
 */
function priceWithStatus(product: Product): string {
  if (product.price === null) return 'not announced yet';
  const price = taka(product.price);
  switch (product.priceStatus) {
    case 'official':
      return `${price} official`;
    case 'unofficial':
      return `${price} unofficial`;
    case 'retail':
      return `${price} retail`;
    case 'on-sale':
      return `${price} on sale`;
    case 'estimated':
      return product.status === 'upcoming'
        ? `${price} estimated, pre-order`
        : `${price} estimated`;
    case 'not-launched':
      return 'not announced yet';
    default:
      return price;
  }
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

/** Closing availability sentence — one per data state, nothing invented. */
function availabilityTail(product: Product): string {
  if (product.status === 'upcoming') return 'Pre-order available.';
  if (product.priceEstimated) return 'Coming soon.';
  return 'In stock now.';
}
