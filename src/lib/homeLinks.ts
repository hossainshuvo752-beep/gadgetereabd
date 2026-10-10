/**
 * Shared link data for the homepage's internal-navigation sections
 * (Browse by Category + Latest Quick Look pages).
 *
 * Both lists are DERIVED from the existing single sources of truth
 * (src/lib/categories.ts, src/lib/products.ts) — never hand-typed in JSX,
 * so a renamed category or a renamed product automatically flows through
 * to the homepage instead of going stale.
 *
 * ROUTE NOTE: the site has no per-category product route. Category
 * filtering on /shop and /quick-look is client-side state driven by
 * CategoryNav, and the only /category/<name> route that exists is the BLOG
 * category page (news, review, guide, …) — a product category name like
 * "Mobile" would render an empty blog page there. /search is excluded from
 * the sitemap and disallowed in robots.txt, so it must not be linked from
 * the homepage either. Every product-category card therefore points at the
 * real listing route that carries that catalog: /shop.
 */
import { categoryTree } from './categories';
import { products, slugify, type Product } from './products';

export type HomeCategoryLink = {
  label: string;
  /** Number of catalog products in this top-level category. */
  count: number;
  href: string;
};

/** Top-level categories in sidebar order, each with its live product count. */
export const homeCategoryLinks: HomeCategoryLink[] = categoryTree.map((node) => ({
  label: node.name,
  count: products.filter((product) => product.topCategory === node.name).length,
  href: '/shop',
}));

export type HomeProductLink = {
  label: string;
  description: string;
  href: string;
};

/**
 * Curated Quick Look picks for the homepage — one slug list, resolved
 * through the shared catalog so labels/prices/brands always match the
 * product data. The selection spans the main product types (smartphone,
 * audio, gaming, smart home) rather than repeating one category.
 */
const HOME_QUICK_LOOK_SLUGS = [
  'samsung-galaxy-s26-ultra',
  'apple-iphone-17-pro-max',
  'sony-wh-1000xm5-wireless-headphones',
  'playstation-5-slim-disc-console',
  'xiaomi-robot-vacuum-s10',
  'xiaomi-smart-tv-x-pro-55',
];

export const homeQuickLookLinks: HomeProductLink[] = HOME_QUICK_LOOK_SLUGS.flatMap(
  (slug): HomeProductLink[] => {
    const product: Product | undefined = products.find(
      (candidate) => slugify(candidate.title) === slug
    );
    if (!product) return [];
    return [
      {
        label: `${product.title} price in Bangladesh`,
        description: `${product.specSheet.basicInfo.brand} · ${product.category}`,
        href: `/quick-look/${slug}`,
      },
    ];
  }
);
