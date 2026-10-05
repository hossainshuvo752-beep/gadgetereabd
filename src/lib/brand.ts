/**
 * Brand single source of truth.
 *
 * Every user-facing reference to the site name — metadata titles,
 * openGraph siteName, JSON-LD Organization/WebSite/publisher names,
 * headers, footers, and legal copy — should read from here so a future
 * rename touches one file only.
 *
 * NOTE: internal identifiers (storage keys like `techbd_cart_v1`, CSV
 * export filename prefixes, and the internal package name) are deliberately
 * NOT derived from this constant — renaming them would orphan existing
 * browser storage and break admin tooling for zero user-visible benefit.
 * The order-number prefix (orderNumber.ts) uses the compact no-space
 * `JupiterBD-` literal because IDs must stay space-free.
 */
export const BRAND_NAME = 'Jupiter BD';

/** Brand name used for authorship of editorial content (blog posts). */
export const BRAND_AUTHOR = 'Jupiter BD Team';
