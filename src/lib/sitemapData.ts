import type { MetadataRoute } from 'next';
import { posts, postHref } from '@/lib/posts';
import { products, slugify } from '@/lib/products';
import { SITE_URL } from '@/lib/siteUrl';

/**
 * THE single source of truth for sitemap.xml (src/app/sitemap.ts) and the
 * build-time route check (scripts/check-sitemap-routes.js).
 *
 * SELF-UPDATING: content pages are built from the SHARED data sources —
 * adding a post to src/lib/posts.ts, a product to src/lib/products.ts, or a
 * blog category to the posts data makes the URL appear in sitemap.xml with
 * NO edit here. Only STATIC pages (new files under src/app/**\/page.tsx)
 * need a one-line addition to STATIC_ROUTES below.
 *
 * ADDING A NEW STATIC PAGE: (1) create src/app/<name>/page.tsx as usual,
 * (2) add an entry to STATIC_ROUTES below with its real last-change date
 * (NOT the build date — see the lastmod note), (3) run the build. If you
 * forget step 2, `next build` fails with a WARNING listing the unlisted
 * route (unless the route belongs in EXCLUDED_ROUTES instead).
 */

/**
 * Every STATIC public indexable page, one entry per route.
 *
 * `path`: '' is the homepage; everything else starts with '/'.
 * `lastChanged`: the real last substantive-change date of the page (ISO
 * 'YYYY-MM-DD' or any string the Date parser accepts). NOT the build time —
 * lastmod should move only when the page's content actually changes, or
 * search engines stop trusting it. Update this value when you materially
 * edit a static page.
 */
export const STATIC_ROUTES: { path: string; lastChanged: string }[] = [
  { path: '', lastChanged: '2026-10-11' }, // Home — hero copy + sections
  { path: '/blog', lastChanged: '2026-09-27' }, // Blog listing
  { path: '/quick-look', lastChanged: '2026-10-10' }, // Quick Look listing
  { path: '/shop', lastChanged: '2026-10-10' }, // Shop listing
  { path: '/new-arrivals', lastChanged: '2024-10-05' }, // derived grid; changes only with new products
  { path: '/deals', lastChanged: '2026-09-20' }, // derived grid; changes only with new deals
  { path: '/about', lastChanged: '2026-09-28' },
  { path: '/contact', lastChanged: '2026-09-28' },
  { path: '/faq', lastChanged: '2026-09-28' },
  { path: '/privacy-policy', lastChanged: '2026-09-28' },
  { path: '/terms', lastChanged: '2026-09-28' },
];

/**
 * Every route prefix that must NOT appear in sitemap.xml — private/utility
 * or deliberately noindex pages. KEEP IN SYNC with the disallow list in
 * src/app/robots.ts AND the noindex metadata on those routes (search,
 * admin, order-confirmation already carry `robots: { index: false }`).
 *
 * ADDING A NON-INDEXABLE PAGE: create the page as usual, then add its
 * route prefix here AND to robots.ts's disallow list (plus a noindex
 * metadata entry for good measure). If you create a new static page and
 * add it to neither list, the build-time check warns about it — deciding
 * "indexable → STATIC_ROUTES" vs "private → EXCLUDED_ROUTES" is the only
 * manual step the sitemap will ever need for a new page.
 */
export const EXCLUDED_ROUTES: string[] = [
  '/api', // JSON endpoints — never for crawlers
  '/account', // personal account area
  '/admin', // password-gated dashboard + analytics
  '/cart', // transactional flow
  '/checkout', // transactional flow
  '/login', // auth flow
  '/register', // auth flow
  '/order-confirmation', // post-transaction receipt (noindex in its layout)
  '/search', // query-result page (noindex in its layout)
];

/**
 * Build the full sitemap entry list. Exported so the build-time route
 * check can validate the URL set against the routes that actually exist
 * in src/app without duplicating this logic.
 */
export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, lastChanged }) => {
    // Real last-change date — parsed from the explicit STATIC_ROUTES entry;
    // today's date is ONLY a last-resort fallback for an unparseable value.
    const parsed = new Date(lastChanged);
    return {
      url: `${SITE_URL}${path}`,
      lastModified: Number.isNaN(parsed.getTime()) ? new Date() : parsed,
      changeFrequency: path === '' || path === '/blog' ? ('daily' as const) : ('weekly' as const),
      priority: path === '' ? 1 : path === '/blog' || path === '/shop' ? 0.9 : 0.7,
    };
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    // post.date is a display string like "Sep 27, 2026" — parse it for
    // lastModified; fall back to today if it ever fails to parse.
    const parsed = new Date(post.date);
    return {
      url: `${SITE_URL}${postHref(post)}`,
      lastModified: Number.isNaN(parsed.getTime()) ? new Date() : parsed,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    };
  });

  const productRoutes: MetadataRoute.Sitemap = products.flatMap((product) => {
    const added = new Date(product.dateAdded);
    const lastModified = Number.isNaN(added.getTime()) ? new Date() : added;
    return [
      {
        url: `${SITE_URL}/shop/${slugify(product.title)}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/quick-look/${slugify(product.title)}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ];
  });

  // Blog category pages (/category/<name>) — derived from the posts data so
  // a new post category is listed automatically (only categories with at
  // least one post are listed — an empty category page is a dead end).
  const categoryRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(posts.map((post) => post.category.toLowerCase()))
  ).map((category) => {
    // A category's lastmod is its newest post's date (the page's content
    // changes when a new post lands in it) — not the build time.
    const newest = posts
      .filter((post) => post.category.toLowerCase() === category)
      .map((post) => new Date(post.date).getTime())
      .filter((t) => !Number.isNaN(t))
      .sort((a, b) => b - a)[0];
    return {
      url: `${SITE_URL}/category/${category}`,
      lastModified: newest ? new Date(newest) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    };
  });

  return [...staticRoutes, ...postRoutes, ...productRoutes, ...categoryRoutes];
}

/**
 * Every URL the sitemap will emit, as plain paths ('' for the homepage).
 * Used by scripts/check-sitemap-routes.js to detect NEW static page routes
 * that were added under src/app but never added to STATIC_ROUTES.
 */
export function sitemapPaths(): Set<string> {
  return new Set(
    buildSitemapEntries().map((entry) => new URL(entry.url).pathname.replace(/\/$/, ''))
  );
}

/**
 * The EXCLUDED_ROUTES prefixes, verbatim — exported so the build-time
 * route check references the same list instead of a copied one.
 */
export function excludedRoutePrefixes(): string[] {
  return EXCLUDED_ROUTES;
}
