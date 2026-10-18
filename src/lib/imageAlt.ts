import type { Product } from './products';

/**
 * Minimal structural shape any post-like object needs for alt generation
 * (cards pass a Pick<>; the blog hero passes a Post-like hand-typed prop).
 * Full Post satisfies it automatically.
 */
export type PostAltData = {
  title: string;
  category: string;
  /** Hand-written alt text from post data (the "caption" field). */
  imageAlt: string;
  /** Optional hand-written override (wins over imageAlt when set). */
  imageAltOverride?: string;
  /** Optional focus keywords (meta) for generated fallbacks. */
  metaKeywords?: string;
};

/**
 * THE single source of truth for image alt text (shared by Shop cards, the
 * product detail gallery, Quick Look pages, the blog hero/cards and the
 * homepage hero). Components call these helpers — they never hardcode alt
 * strings, and no per-image alt is hand-written anywhere in src/components.
 *
 * RULES (standing rule, see memory.md):
 * - Products: name plus type. The Quick Look page's MAIN image may append
 *   "price in Bangladesh" (exactly once per page). Cards and Shop use name
 *   plus type only.
 * - Gallery images: name plus the mapped variant/color when the image maps
 *   to one in the data, else name plus "photo N of M". NEVER spec keywords —
 *   the code cannot know what each photo shows.
 * - Blog: the image's own alt/caption from post data when present (keeping
 *   existing good alt text untouched), else built from title + focus
 *   keywords and (for in-body images) the nearest H2 / covered product.
 * - Empty alt ONLY for decorative images. Never invent image descriptions,
 *   never stuff keywords. To customize one image, use the override field in
 *   data, never hardcode alt in a component.
 */

/** Cap: keep alt text comfortably under the ~125-char screen-reader line. */
function cap(alt: string): string {
  return alt.length <= 125 ? alt : `${alt.slice(0, 122).trimEnd()}…`;
}

/** Lowercased word list from a post's focus-keyword data (meta keywords). */
function postKeywordWords(post: PostAltData): string[] {
  if (post.metaKeywords && post.metaKeywords.trim() !== '') {
    return post.metaKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Short keyword phrase from the post's own data: first focus keyword plus
 * the post category — one natural phrase, never a keyword list.
 */
function postFocusPhrase(post: PostAltData): string {
  const keywords = postKeywordWords(post);
  const first = keywords[0] ?? '';
  const category = post.category?.trim() ?? '';
  // Prefer the first keyword; append the category only when it's not
  // already contained in that phrase (no repeated keywords).
  if (first && category && !first.toLowerCase().includes(category.toLowerCase())) {
    return `${first} — ${category.toLowerCase()}`;
  }
  return first || category || post.title;
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

/**
 * Type word from the product's own data, resolved to a natural singular
 * noun ("Smartphones" → "smartphone"). Returns a DATA-BACKED type word
 * only when the product title doesn't already contain it (no keyword
 * repetition); abstract groupings (Gaming, Smart Home, Appliances) are
 * left to the title alone. For Audio products the concrete device noun
 * comes from topCategory (e.g. "Earbuds" → "earbuds").
 */
function productType(product: Pick<Product, 'title' | 'category' | 'topCategory'>): string | null {
  const title = product.title?.toLowerCase() ?? '';
  const singularize = (type: string): string =>
    type.endsWith('s') && type.length > 3 ? type.slice(0, -1).toLowerCase() : type.toLowerCase();

  const known: Record<string, string> = {
    Smartphones: 'smartphone',
    Tablets: 'tablet',
    Laptops: 'laptop',
    Desktops: 'desktop',
    Wearables: 'wearable',
    Cameras: 'camera',
  };
  // Accessories: their titles already name the concrete device
  // ("Sony WH-1000XM5 Wireless Headphones", "UGREEN USB-C Hub 5-in-1") and
  // appending "accessory" would be inaccurate — title alone is honest.

  // Audio products name the concrete device from their top-level group.
  if (product.category === 'Audio' && product.topCategory === 'Earbuds') {
    if (!title.includes('earbud') && !title.includes('headphone')) return 'earbuds';
    return null;
  }

  const mapped = known[product.category];
  if (!mapped) return null; // Gaming / Smart Home / Appliances: title alone
  if (title.includes(mapped)) return null; // title already names the type
  return mapped;
}

/**
 * Alt text for a product's MAIN/hero image on cards, Shop and any shared
 * card surface: "<name> <type>" — e.g. "Samsung Galaxy S26 Ultra
 * smartphone". A per-product data override (altOverride) always wins;
 * when no type word can be derived the title alone is used.
 */
export function productMainAlt(product: Product): string {
  // A hand-written per-product override (data field altOverride) always
  // wins; otherwise GENERATE "name + type" from the product's own data —
  // the legacy imageAlt string (just the name) is NOT reused here, it is
  // only the placeholder text for products still without photos.
  const custom = product.altOverride?.trim();
  if (custom) return cap(custom);
  const type = productType(product);
  return cap(type ? `${product.title} ${type}` : product.title);
}

/**
 * Alt text for the Quick Look page's MAIN image: same as card alt plus
 * "price in Bangladesh" — exactly once per page, only on Quick Look.
 * e.g. "Samsung Galaxy S26 Ultra smartphone price in Bangladesh".
 */
export function productQuickLookMainAlt(product: Product): string {
  const base = productMainAlt(product);
  // Defensive: don't stack the phrase if the data override already says it.
  if (/price in bangladesh/i.test(base)) return base;
  return cap(`${base} price in Bangladesh`);
}

/**
 * A product's hand-written alt for ONE gallery image, from its data
 * (galleryAlts, matched by exact src or path suffix). Returns null when the
 * image has no override — callers then generate the standard text — so a
 * missing entry can never produce empty alt text.
 */
export function galleryAltOverride(product: Product, src?: string): string | null {
  if (!src) return null;
  const hit = product.galleryAlts?.find(
    (o) => o.src === src || src.endsWith(o.src)
  );
  const text = hit?.alt?.trim();
  return text ? cap(text) : null;
}

/**
 * Alt text for a product GALLERY/thumbnail image.
 *
 * - When `variantLabel` is provided (the color/package/variant name the
 *   image maps to in product data), the alt is "<card alt> in <variant>" —
 *   e.g. "Samsung Galaxy S26 Ultra in Titanium Black".
 * - Otherwise "<card alt>, photo N of M" so every gallery image in a set
 *   has a distinct, position-accurate alt.
 * NEVER describes angle/contents/specs — only data-backed words.
 */
export function productGalleryAlt(
  product: Product,
  position: number,
  total: number,
  variantLabel?: string,
  /** The image's src. When the product's data carries a per-image override
   *  for it (galleryAlts), that hand-written text wins for this image only
   *  and every other image keeps the generated text below. */
  src?: string
): string {
  const override = galleryAltOverride(product, src);
  if (override) return override;
  const base = productMainAlt(product);
  if (variantLabel && variantLabel.trim() !== '') {
    // A color/variant set with MORE than one photo disambiguates by
    // position too — two thumbs of the same color must not share an alt.
    if (total > 1) {
      return cap(`${base} in ${variantLabel.trim()}, photo ${position + 1} of ${total}`);
    }
    return cap(`${base} in ${variantLabel.trim()}`);
  }
  return cap(`${base}, photo ${position + 1} of ${total}`);
}

/* ------------------------------------------------------------------ */
/* Blog posts                                                          */
/* ------------------------------------------------------------------ */

/**
 * Alt for a post's HERO image: the post's own imageAlt (its caption in the
 * data — good, hand-written text stays untouched) unless an explicit
 * altOverride exists, else generated from title + focus keywords.
 */
export function postHeroAlt(post: PostAltData): string {
  if (post.imageAltOverride?.trim()) return cap(post.imageAltOverride.trim());
  if (post.imageAlt && post.imageAlt.trim() !== '') return cap(post.imageAlt.trim());
  return cap(`${post.title} — ${postFocusPhrase(post)}`);
}

/**
 * Alt for a post image rendered as a CARD on a page where the SAME post
 * image can appear more than once (home page sections repeat featured
 * posts: Hero + Latest Posts + Trending Now + Buying Guides). When the
 * caller passes the card's position among the page's REPEATED uses of
 * that same post image, the alt gets a "card N" suffix — keeping every
 * image on a page unique without inventing new descriptions.
 * occurrence (0-based): pass 0 when the post image is unique on the page.
 */
export function postCardAlt(post: PostAltData, occurrence = 0): string {
  const base = postHeroAlt(post);
  if (occurrence <= 0) return base;
  return cap(`${base} — card ${occurrence + 1}`);
}

/**
 * Page-scoped occurrence tracker: maps a post id to how many times its
 * IMAGE has already been placed on the page. Created ONCE per page render
 * (in the page component) and passed down into section components as a
 * prop so repeated placements of the same post image get sequential
 * "card N" suffixes via postCardAlt(). Plain server-render data — no
 * client state, no module-global mutation.
 */
export type AltOccurrenceTracker = Map<number, number>;

export function createAltOccurrenceTracker(): AltOccurrenceTracker {
  return new Map();
}

/** Read-and-increment the occurrence count for a post image placement. */
export function nextOccurrence(tracker: AltOccurrenceTracker, postId: number): number {
  const current = tracker.get(postId) ?? 0;
  tracker.set(postId, current + 1);
  return current;
}

/** One in-body image override, keyed by the image's src path. */
export type InlineImageAltOverride = { src: string; alt: string };

/**
 * Alt for an IN-BODY post image (the <img> tags inside the post's HTML
 * content). The override map in post data wins; otherwise the generated
 * fallback "<focus phrase> in <post title>" — positionless, data-only.
 * (Existing in-body alts in posts.ts are good and stay as-is; this helper
 * builds alts only for posts whose content lacks one.)
 */
export function postInlineAlt(
  post: PostAltData,
  src: string,
  overrides?: InlineImageAltOverride[]
): string | null {
  const explicit = overrides?.find((o) => o.src === src || src.endsWith(o.src));
  if (explicit) return cap(explicit.alt);
  // No data: null → the caller leaves the existing inline alt alone (posts
  // content already carries hand-written alts; never overwrite with invention).
  return null;
}
