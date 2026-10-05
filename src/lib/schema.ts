import type { Post } from './posts';
import { slugify, type Product } from './products';
import { postHref } from './posts';
import { BRAND_NAME } from './brand';

/**
 * JSON-LD structured data builders (AEO — Answer Engine Optimization).
 *
 * Rules these builders enforce (per the schema-markup skill):
 * - Only data that is VISIBLE on the page may be marked up — no invented
 *   ratings, reviews, or dates.
 * - Product `offers` are emitted ONLY when the price is confirmed
 *   (status 'available' && !priceEstimated). Estimated prices and
 *   upcoming products are deliberately omitted from machine-readable
 *   offers so answer engines never quote an unconfirmed price.
 * - ISO 8601 dates only.
 */

export const SITE_URL = 'https://gadgetereabd.vercel.app';

/** Organization — site-wide identity. Minimal by design: only verifiable
 *  fields (no fabricated logo URL, social profiles, or address). */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    url: SITE_URL,
    description:
      "Bangladesh's honest source for gadget reviews, buying guides, and tech news.",
  };
}

/** WebSite + SearchAction — searchbox eligibility. The target mirrors the
 *  real /search?q= route the site's header search already uses. */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** FAQPage — pass the EXACT same array the page renders. */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** BlogPosting/Article — visible headline, category, author, publish date.
 *  @id/mainEntityOfPage use the slug URL for slug posts (legacy posts keep
 *  their numeric /posts/<id> URLs). Hero photo attached when present. */
export function articleSchema(post: Post) {
  const published = new Date(post.date);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    // post.date is a display string ("Sep 10, 2026"); omit rather than
    // guess if it ever fails to parse.
    ...(Number.isNaN(published.getTime())
      ? {}
      : { datePublished: published.toISOString().slice(0, 10) }),
    ...(post.heroImage ? { image: `${SITE_URL}${post.heroImage}` } : {}),
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: BRAND_NAME, url: SITE_URL },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}${postHref(post)}`,
    },
    articleSection: post.category,
    inLanguage: 'en',
  };
}

/** Product schema for a product MENTIONED inside an article (e.g. a
 *  buying-guide roundup). Deliberately minimal: name + brand ONLY — the
 *  two things an article mention actually confirms. No offers (an article
 *  does not verify a store price), no ratings/reviews (none exist). */
export function mentionsSchema(mention: { name: string; brand: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: mention.name,
    brand: { '@type': 'Brand', name: mention.brand },
  };
}

/** Product — name/brand/category/description/image from the spec sheet
 *  and shared data; offers only for confirmed prices (see module doc).
 *  The canonical product URL is the slug-based /shop/<slug> route. */
export function productSchema(product: Product) {
  const { specSheet: spec } = product;
  const productUrl = `${SITE_URL}/shop/${slugify(product.title)}`;
  // Avoid "HONOR HONOR Robot Phone"-style duplication when the model name
  // already starts with the brand name.
  const brandModel = spec.basicInfo.model
    .toLowerCase()
    .startsWith(spec.basicInfo.brand.toLowerCase())
    ? spec.basicInfo.model
    : `${spec.basicInfo.brand} ${spec.basicInfo.model}`;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    brand: { '@type': 'Brand', name: spec.basicInfo.brand },
    category: product.topCategory,
    url: productUrl,
    description: `${brandModel}: ${spec.display.size} ${spec.display.type}, ${spec.performance.processor}. Full specs and Bangladesh price on ${BRAND_NAME}.`,
    // Real hero photo (absolute URL) when the product has one.
    ...(product.heroImage ? { image: `${SITE_URL}${product.heroImage}` } : {}),
  };

  if (
    product.status === 'available' &&
    !product.priceEstimated &&
    product.price != null
  ) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: productUrl,
    };
  }

  return schema;
}
