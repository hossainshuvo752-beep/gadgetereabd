import type { MetadataRoute } from 'next';

/**
 * robots.txt for gadgetereabd.vercel.app.
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
        ],
      },
    ],
    sitemap: 'https://gadgetereabd.vercel.app/sitemap.xml',
  };
}
