import type { Product } from './products';
import { BRAND_NAME } from './brand';

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
}

const seoCopy: Record<string, ProductSeoCopy> = {
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
    quickLookSpecs: 'storage, specs, and current deal',
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

/** Quick Look title template: "{Product} Price in Bangladesh — Specs & Review | Jupiter BD" */
export function quickLookSeoTitle(product: Product): string {
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
  const specs = seoCopy[slugOf(product)]?.quickLookSpecs ?? 'full specifications';

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
  return `${pricePart} Check full specifications, ${specs}. ${availability}`;
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
  const specs = seoCopy[slugOf(product)]?.shopSpecs ?? 'solid specs';

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
