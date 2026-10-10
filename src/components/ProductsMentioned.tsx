import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products, slugify } from '@/lib/products';

type MentionedProduct = {
  slug: string;
  title: string;
  brand: string;
  category: string;
};

/**
 * Resolve a post's relatedProducts slugs (rule 6) intoQuick Look cards,
 * preserving declared order. Slugs are validated against products.ts here
 * too — so a stale slug can never render as a broken link even inside a
 * component (the script check-crosslinks.js also fails the build on it).
 */
export function resolveMentionedProducts(
  slugs: string[],
  limit = 5
): MentionedProduct[] {
  const out: MentionedProduct[] = [];
  for (const slug of slugs) {
    if (out.length >= limit) break;
    const product = products.find((candidate) => slugify(candidate.title) === slug);
    if (!product) continue; // rule 6: never link a page that does not exist
    out.push({
      slug,
      title: product.title,
      brand: product.specSheet.basicInfo.brand,
      category: product.category,
    });
  }
  return out;
}

/**
 * "Products mentioned" — end-of-article card block for /posts/[slug].
 * Fed ONLY by the post's relatedProducts field in src/lib/posts.ts (rule 6:
 * the single source of truth); slugs are re-validated against the catalog.
 * Max 5 product links (the resolver slices). Visible server-rendered links,
 * crawlable anchors, no hidden or collapsed content, no nofollow. Colors
 * are @theme tokens only; text is the site's Inter face.
 */
const ProductsMentioned: React.FC<{ slugs?: string[] }> = ({ slugs }) => {
  if (!slugs || slugs.length === 0) return null;
  const mentioned = resolveMentionedProducts(slugs);
  if (mentioned.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby="products-mentioned">
      <h2 id="products-mentioned" className="text-2xl font-bold text-text-heading mb-5">
        Products mentioned
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 gap-y-3">
        {mentioned.map((product) => (
          <Link
            key={product.slug}
            href={`/quick-look/${product.slug}`}
            className="group block border border-text-heading/10 rounded-lg p-4 bg-bg-light hover:border-accent/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="block text-sm md:text-base font-semibold text-text-heading group-hover:text-accent transition-colors leading-snug">
                  {product.title} price in Bangladesh
                </span>
                <span className="mt-1 block text-xs text-text-body">
                  {product.brand} · {product.category}
                </span>
              </div>
              <span className="mt-1 inline-flex flex-shrink-0 items-center gap-1 text-xs font-medium text-accent">
                Full specs
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ProductsMentioned;
