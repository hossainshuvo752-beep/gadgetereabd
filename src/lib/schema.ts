import type { Post } from './posts';
import type { Product } from './products';

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

/** BlogPosting/Article — visible headline, category, author, publish date. */
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
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'TechBD', url: SITE_URL },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/posts/${post.id}`,
    },
    articleSection: post.category,
    inLanguage: 'en',
  };
}

/** Product — name/brand/category/description from the spec sheet; offers
 *  only for confirmed prices (see module doc). */
export function productSchema(product: Product) {
  const { specSheet: spec } = product;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    brand: { '@type': 'Brand', name: spec.basicInfo.brand },
    category: product.topCategory,
    url: `${SITE_URL}/shop/${product.id}`,
    description: `${spec.basicInfo.brand} ${spec.basicInfo.model}: ${spec.display.size} ${spec.display.type}, ${spec.performance.processor}. Full specs and Bangladesh price on TechBD.`,
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
      url: `${SITE_URL}/shop/${product.id}`,
    };
  }

  return schema;
}
