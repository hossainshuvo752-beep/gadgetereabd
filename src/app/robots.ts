import type { MetadataRoute } from 'next';
import { EXCLUDED_ROUTES } from '@/lib/sitemapData';
import { SITE_URL } from '@/lib/siteUrl';

/**
 * robots.txt for jupiter.bd (canonical domain). Content pages are
 * crawlable; transactional/utility routes (cart, checkout, order
 * confirmation, search, auth/account placeholders, admin, api) are
 * excluded from crawling AND from sitemap.xml.
 *
 * THE DISALLOW LIST IS DERIVED from the same EXCLUDED_ROUTES list the
 * sitemap uses (src/lib/sitemapData.ts) — one list, both files, so a new
 * non-indexable page added to EXCLUDED_ROUTES is disallowed here too with
 * no second edit. See the comment on EXCLUDED_ROUTES for how to classify
 * a new page.
 *
 * Robots rules are PREFIX matches by default, so every value gets a
 * trailing slash anchored form (`/api` → `/api` + `/api/`) to keep exact
 * segments blocked without blocking a future PUBLIC page that merely
 * starts with the same word (e.g. /search-tips would stay crawlable).
 * The homepage ("" = no Disallow side) is unaffected.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: EXCLUDED_ROUTES.flatMap((prefix) =>
          prefix === '' || prefix === '/' ? [] : [prefix, `${prefix}/`]
        ),
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
