import type { MetadataRoute } from 'next';
import { posts } from '@/lib/posts';
import { products, slugify } from '@/lib/products';

/**
 * Sitemap for gadgetereabd.vercel.app.
 *
 * Includes every content page (static + generated from the shared data
 * sources) so search engines can discover posts and products without
 * crawling. Transactional/utility routes (cart, checkout, login, etc.)
 * are deliberately excluded from the sitemap and disallowed in robots.ts.
 */

const SITE_URL = 'https://gadgetereabd.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/blog',
    '/quick-look',
    '/shop',
    '/new-arrivals',
    '/deals',
    '/about',
    '/contact',
    '/faq',
    '/privacy-policy',
    '/terms',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/blog' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/blog' || path === '/shop' ? 0.9 : 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    // post.date is a display string like "Sep 10, 2026" — parse it for
    // lastModified; fall back to today if it ever fails to parse.
    const parsed = new Date(post.date);
    return {
      url: `${SITE_URL}/posts/${post.id}`,
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
        url: `${SITE_URL}/shop/${product.id}`,
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

  const categoryRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(posts.map((post) => post.category.toLowerCase()))
  ).map((category) => ({
    url: `${SITE_URL}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes, ...productRoutes, ...categoryRoutes];
}
