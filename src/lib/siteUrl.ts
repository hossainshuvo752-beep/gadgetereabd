/**
 * Canonical site URL — single source of truth for every absolute URL the
 * app emits: metadataBase (OG/canonical resolution), sitemap.xml entries,
 * robots.txt Sitemap line, JSON-LD @id/url/image fields, and share links.
 *
 * The site's canonical home is https://jupiter.bd (custom domain). The
 * Vercel deployment URL remains online as an alias/fallback but must NOT
 * be referenced as the canonical origin anywhere.
 */
export const SITE_URL = 'https://jupiter.bd';
