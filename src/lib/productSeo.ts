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
  /** Appended to the price in the Quick Look description, e.g. "8GB/256GB".
   *  Derived from that product's own spec sheet — for a phone, the storage
   *  and RAM that the headline price buys. */
  quickLookPriceQualifier?: string;
  /** Printed in parentheses right after the seoName in the Quick Look
   *  description, e.g. "(4G)". For products whose model name covers TWO
   *  different phones, so the snippet itself says which one this page is. */
  quickLookModelLabel?: string;
  /** Replaces the generated closing availability sentence in the Quick Look
   *  description. Used where the closing sentence must carry a fact the
   *  shared template cannot build (the Camon 40 Pro 5G's price), or where an
   *  availability claim is not supported by the data. */
  descriptionTail?: string;
  /** Builds the Quick Look description's price phrase from the product's own
   *  PRICED VARIANTS (one taka figure per configuration) instead of from the
   *  flat `price` — so the snippet lists every configuration and can never
   *  disagree with the selector. Pair it with `descriptionTail` for the
   *  closing sentence. Absent = the usual single-price sentence. */
  descriptionFromVariantPrices?: boolean;
  /** Builds the Quick Look description's price phrase from EACH VERSION's
   *  cheapest priced variant — the default version first, then the others as
   *  "{shortLabel} version from about ৳X". Used by a page whose whole point is
   *  the gap between an official price and a cheaper import, so both figures
   *  are read from the data and can never disagree with the selector. Pair it
   *  with `descriptionTail`. Absent = the usual single-price sentence. */
  descriptionFromVersionPrices?: boolean;
  /** Builds the Quick Look description for a product sold ONLY as an
   *  unofficial China import at an estimated price:
   *  "{seoName} price in Bangladesh: about ৳X for the {RAM}+{storage} China
   *  version (unofficial). {tail}" — the figure comes from the product's
   *  price and the configuration from its own spec sheet, so the snippet can
   *  never disagree with either. Pair it with `descriptionTail`. */
  descriptionFromChinaImport?: boolean;
  /** Exact Shop-route description. Needed only for a product whose shared
   *  Shop template would add a claim its data cannot support — the template
   *  ends "In stock, fast delivery", which an unofficial-import product with
   *  no confirmed stock must not say. Absent = the generated Shop copy. */
  shopDescriptionOverride?: string;
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
  /** Titles four models at once otherwise: TECNO sells a Camon 40 Pro (4G,
   *  Helio G100 Ultimate, 120Hz) and a Camon 40 Pro 5G (Dimensity 7300,
   *  144Hz) as two different phones. THIS page is the 4G model — the title
   *  says "4G & 5G" because buyers search both, and the description names
   *  the 4G model and the 5G model's price. Both figures were read on
   *  retailer listings (Sumash Tech "Official" / Gadget & Gear / MRP) that
   *  TECNO's own unreadable BD pages do not contradict; see priceNote. */
  'tecno-camon-40-pro': {
    shopSpecs: '120Hz AMOLED, 50MP OIS camera',
    quickLookSpecs: '120Hz AMOLED, 50MP OIS',
    quickLookPriceQualifier: '8GB/256GB',
    quickLookModelLabel: '4G',
    titleOverride: 'Tecno Camon 40 Pro Price in Bangladesh 2026: 4G & 5G',
    descriptionTail: 'The 5G model costs ৳34,999 official.',
  },
  /** Redmi Note 14 Pro+ 5G — ONE page, TWO versions (Global / China), and
   *  Xiaomi Bangladesh does not sell it, so every price is UNOFFICIAL. The
   *  title is the plain model + "Price in Bangladesh" (no year), the
   *  description quotes the default variant of each version, and the Shop
   *  copy drops the shared "In stock, fast delivery" tail. */
  'redmi-note-14-pro-plus-5g': {
    shopSpecs: 'Global and China versions, 6.67-inch 1.5K 120Hz AMOLED',
    quickLookSpecs: 'Global and China versions',
    titleOverride: 'Redmi Note 14 Pro Plus 5G Price in Bangladesh',
    descriptionOverride:
      'Redmi Note 14 Pro+ 5G price in Bangladesh (BD): Global from ৳37,500, China from ৳35,000, unofficial. Specs, versions and colors.',
    shopDescriptionOverride:
      'Redmi Note 14 Pro+ 5G in Bangladesh: Global ৳37,500 and China ৳35,000, unofficial imports. 200MP OIS, 5110mAh and 120W on the Global version.',
  },
  /** Redmi Note 15 5G — an OFFICIAL Bangladesh launch, so the generated
   *  description prints the authorised-channel price and status. The title is
   *  the model plus "Price in Bangladesh" (36 chars, absolute) and the
   *  qualifier says which memory size that money buys. */
  'redmi-note-15-5g': {
    shopSpecs: '108MP camera, 120Hz AMOLED, 5520mAh battery',
    quickLookSpecs: '6.77-inch 120Hz AMOLED, 108MP camera',
    quickLookPriceQualifier: '8GB/256GB',
    titleOverride: 'Redmi Note 15 5G Price in Bangladesh',
  },
  /** Redmi Note 15 Pro+ 5G — an OFFICIAL Bangladesh launch (Xiaomi's own
   *  Bangladesh page lists both prices), with a China import sold alongside
   *  it. The title is the plain model + "Price in Bangladesh" with no year
   *  (45 chars, absolute); the description quotes the official 8GB/256GB
   *  price and the import floor, and the Shop copy keeps the official
   *  price and warranty. */
  'redmi-note-15-pro-plus-5g': {
    shopSpecs: '200MP OIS camera, 6500mAh battery, 100W charging',
    quickLookSpecs: '200MP OIS, 6500mAh, 100W',
    titleOverride: 'Redmi Note 15 Pro Plus 5G Price in Bangladesh',
    descriptionOverride:
      'Redmi Note 15 Pro+ 5G price in Bangladesh (BD): ৳46,999 official, 8GB/256GB. 200MP OIS, 6500mAh, 100W. China import ৳40,000 unofficial.',
    shopDescriptionOverride:
      'Buy the Redmi Note 15 Pro+ 5G in Bangladesh: ৳46,999 official (8GB/256GB) with a one-year Xiaomi Care warranty. 200MP OIS, 6500mAh, 100W.',
  },
  /** Realme C85 Pro — an official Bangladesh launch sold in three memory
   *  configurations, so the description lists all three from the data (a
   *  single headline figure would misdescribe the launch). The Shop copy
   *  drops the shared "In stock, fast delivery" tail because no retailer we
   *  opened confirms current stock for this handset. */
  /** Xiaomi Redmi Note 17 Pro — one model sold as an official Bangladesh
   *  unit and a cheaper China import, so the description quotes each
   *  version's cheapest priced configuration from the data (the official
   *  ৳54,999 and the import floor). The owner supplied the exact title,
   *  including the brand suffix — see TITLE_SUFFIX_EXCEPTIONS in
   *  scripts/check-seo-metadata.js. */
  'xiaomi-redmi-note-17-pro': {
    shopSpecs: '6.83-inch 1.5K 120Hz AMOLED, 8,340mAh battery, 50MP OIS camera',
    quickLookSpecs: '6.83-inch 1.5K 120Hz AMOLED, 8,340mAh',
    titleOverride: 'Xiaomi Redmi Note 17 Pro Price in Bangladesh | Jupiter BD',
    descriptionFromVersionPrices: true,
    descriptionTail: 'Colors, specs and warranty.',
    shopDescriptionOverride:
      'Buy the Xiaomi Redmi Note 17 Pro in Bangladesh: ৳54,999 official (8GB+256GB), or the China version from about ৳32,000 unofficially. 6.83-inch 1.5K 120Hz AMOLED, 8,340mAh.',
  },
  'realme-c85-pro': {
    shopSpecs: '6.8-inch 120Hz AMOLED, 7000mAh battery, 45W charging',
    quickLookSpecs: '6.8-inch 120Hz AMOLED, 7000mAh battery',
    titleOverride: 'Realme C85 Pro Price in Bangladesh | Jupiter BD',
    descriptionFromVariantPrices: true,
    descriptionTail: 'Colors, full specs and warranty.',
    shopDescriptionOverride:
      'Buy the Realme C85 Pro in Bangladesh: ৳20,999 for 6GB/128GB, ৳22,999 for 8GB/128GB and ৳24,999 for 8GB/256GB at official launch prices. 6.8-inch 120Hz AMOLED, 7000mAh.',
  },
  /** Realme Neo 8 — a China-market phone with no official Bangladesh launch,
   *  documented on Quick Look only (quickLookOnly + purchaseMode 'info'). The
   *  description states the owner's approximate unofficial figure with the
   *  configuration read from the spec sheet; the title is the owner's exact
   *  string including the brand suffix (see TITLE_SUFFIX_EXCEPTIONS in
   *  scripts/check-seo-metadata.js). */
  'realme-neo-8': {
    shopSpecs: 'China import, no official Bangladesh launch',
    quickLookSpecs: '6.78-inch 165Hz AMOLED, Snapdragon 8 Gen 5',
    titleOverride: 'Realme Neo 8 Price in Bangladesh | Jupiter BD',
    descriptionFromChinaImport: true,
    descriptionTail: 'Colors, specs, variants and warranty notes.',
    shopDescriptionOverride:
      'Realme Neo 8: a China-market phone with no official Bangladesh launch. Approximate unofficial price, specs and what to check before buying an import.',
  },
  /** Vivo V80 — an official Bangladesh launch with two configurations, so the
   *  description lists both figures from the data (the taka amounts and their
   *  RAM/storage labels are never typed here). The Shop copy drops the shared
   *  "In stock, fast delivery" tail: the page makes no stock claim. The owner
   *  supplied the exact title, including the brand suffix — see
   *  TITLE_SUFFIX_EXCEPTIONS in scripts/check-seo-metadata.js. */
  'vivo-v80': {
    shopSpecs: '6.59-inch 144Hz AMOLED, 7,200mAh battery, ZEISS cameras',
    quickLookSpecs: '6.59-inch 144Hz AMOLED, Snapdragon 7 Gen 4',
    titleOverride: 'Vivo V80 Price in Bangladesh | Jupiter BD',
    descriptionFromVariantPrices: true,
    descriptionTail: 'Colors, specs, 50MP ZEISS telephoto camera and 7,200mAh battery.',
    shopDescriptionOverride:
      'Buy the Vivo V80 in Bangladesh: ৳79,999 for 8GB/128GB and ৳89,999 for 8GB/256GB at official launch prices. 6.59-inch 144Hz AMOLED, ZEISS cameras, 7,200mAh.',
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
    quickLookSpecs: '15.6-inch IPS display, Core i3-1315U',
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
 *   "{seoName}{ (model)} price in Bangladesh (BD): {price with status[, what
 *    it buys]}. {two specs}. {closing sentence}"
 * The closing sentence is the generated availability tail unless the product
 * declares `descriptionTail` (a fact the template cannot build, such as a
 * sibling model's price — which also removes an availability claim the data
 * does not support). `quickLookModelLabel` names the exact model when one
 * name covers two phones; `quickLookPriceQualifier` says what the price buys.
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
  // Products whose launch price list is the point of the page: every
  // configured price is printed, read from the data itself.
  if (copy?.descriptionFromVariantPrices) {
    return `${name} price in Bangladesh: ${variantPriceList(product)}. ${
      copy.descriptionTail ?? availabilityTail(product)
    }`;
  }
  if (copy?.descriptionFromVersionPrices) {
    return `${name} price in Bangladesh: ${versionPricePhrase(product)}. ${
      copy.descriptionTail ?? availabilityTail(product)
    }`;
  }
  // Information-only China import: the price is an estimate and the memory
  // configuration is read from the spec sheet (never typed into the copy).
  if (copy?.descriptionFromChinaImport) {
    // "12GB LPDDR5X" → "12GB", "256GB UFS 4.1" → "256GB": the snippet
    // names the configuration, not the memory technology.
    const ram = product.specSheet.performance.ram.trim().split(/\s+/)[0];
    const storage = product.specSheet.performance.storage.trim().split(/\s+/)[0];
    const config = [ram, storage].filter(Boolean).join('+');
    const price =
      product.price !== null ? `about ${taka(product.price)}` : 'not announced yet';
    return `${name} price in Bangladesh: ${price} for the ${config} China version (unofficial). ${
      copy.descriptionTail ?? availabilityTail(product)
    }`;
  }
  const model = copy?.quickLookModelLabel ? ` (${copy.quickLookModelLabel})` : '';
  const specs = copy?.quickLookSpecs ?? 'full specifications and Bangladesh price';
  const price = copy?.quickLookPriceQualifier
    ? `${priceWithStatus(product)}, ${copy.quickLookPriceQualifier}`
    : priceWithStatus(product);
  const tail = copy?.descriptionTail ?? availabilityTail(product);
  return `${name}${model} price in Bangladesh (BD): ${price}. ${specs}. ${tail}`;
}

/**
 * "৳20,999 for 6/128GB, ৳22,999 for 8/128GB and ৳24,999 for 8/256GB" — built
 * from the DEFAULT version's priced variants (falling back to the product's
 * own `variants`). A RAM/storage label loses its second unit so the phrase
 * stays short ("6GB/128GB" → "6/128GB"); the numbers themselves are never
 * typed, so the snippet and the selector cannot disagree.
 */
function versionPricePhrase(product: Product): string {
  const versions = product.versions ?? [];
  const def = versions.find((v) => v.id === product.defaultVersion) ?? versions[0];
  if (!def) return priceWithStatus(product);

  const lowest = (v: NonNullable<Product['versions']>[number]) => {
    const prices = (v.variants ?? []).map((x) => x.price).filter((n) => typeof n === 'number');
    return prices.length ? Math.min(...prices) : null;
  };

  // The default version in the product's own wording ("৳54,999 official")
  // plus the memory size that money buys, e.g. "(8GB+256GB)".
  const defPrice = lowest(def);
  const defLabel =
    def.variants.find((v) => v.price === defPrice)?.label.replace(/\//g, '+') ?? '';
  const parts = [
    `${priceWithStatus(product)}${defLabel ? ` (${defLabel})` : ''}`,
  ];

  for (const version of versions) {
    if (version.id === def.id) continue;
    const price = lowest(version);
    if (price === null) continue;
    parts.push(`${version.shortLabel} version from about ${taka(price)}`);
  }

  return parts.join('. ');
}

function variantPriceList(product: Product): string {
  const version =
    product.versions?.find((v) => v.id === product.defaultVersion) ?? product.versions?.[0];
  const priced = version?.variants ?? product.variants ?? [];
  const parts = priced.map((v) => `${taka(v.price)} for ${v.label.replace(/GB\//g, '/')}`);
  if (parts.length === 0) return priceWithStatus(product);
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
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
  if (copy?.shopDescriptionOverride) return copy.shopDescriptionOverride;
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
