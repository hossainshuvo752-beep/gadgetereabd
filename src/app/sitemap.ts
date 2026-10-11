import type { MetadataRoute } from 'next';
import { buildSitemapEntries } from '@/lib/sitemapData';

/**
 * Sitemap for jupiter.bd (canonical domain) — built entirely from the
 * shared data in src/lib/sitemapData.ts:
 *   - static public pages (STATIC_ROUTES, with real last-change dates)
 *   - every post (src/lib/posts.ts) → /posts/<slug|id>
 *   - every product (src/lib/products.ts) → /shop/<slug> + /quick-look/<slug>
 *   - every blog category in use (derived from the posts data)
 *
 * Route classification (indexable vs excluded), the "how to add a new
 * page" instructions and the build-time route check live in
 * src/lib/sitemapData.ts + scripts/check-sitemap-routes.js.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
