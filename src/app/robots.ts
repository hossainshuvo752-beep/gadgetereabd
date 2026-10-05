import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteUrl';

/**
 * robots.txt for jupiter.bd (canonical domain).
 * Content pages are crawlable; transactional/utility routes (cart,
 * checkout, order confirmation, search, auth/account placeholders) are
 * excluded so search engines don't index empty or personal flows.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cart',
          '/checkout',
          '/order-confirmation',
          '/search',
          '/account',
          '/login',
          '/register',
          '/admin',
          '/api/admin',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
