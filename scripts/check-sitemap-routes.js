/**
 * Sitemap completeness check — run automatically during `next build`
 * (see package.json "build"). Fails the build with a clear WARNING list
 * whenever a STATIC page route exists under src/app but is neither:
 *   - listed in STATIC_ROUTES (public + indexable → must be in the
 *     sitemap), nor
 *   - covered by EXCLUDED_ROUTES (private/utility/noindex → sitemap may
 *     not list it).
 *
 * This makes "forgot to add the new page to the sitemap" a build failure
 * instead of a silent SEO gap. Dynamic routes (posts/products/category
 * details) are data-generated and always covered by buildSitemapEntries();
 * the check therefore only needs to reason about STATIC page files.
 *
 * How it classifies a found page.tsx:
 *   page.tsx at src/app/X/page.tsx      → route '/X'
 *   page.tsx at src/app/page.tsx        → route '' (homepage)
 *   nested folders (admin/analytics/…)  → full nested path
 * If the route starts with an EXCLUDED_ROUTES prefix → OK (deliberately
 * not in the sitemap). Otherwise it must appear in STATIC_ROUTES.
 *
 * Loading the TS data sources: no ts-node in this project, so the same
 * tsc-transpile fallback used by check-crosslinks.js compiles the lib
 * files into .next/tmp-sitemapcheck via tsconfig.check-crosslinks.json.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Register the '@/' path alias for the transpiled CommonJS lib modules —
 * the emitted JS keeps `require('@/lib/x')` verbatim, which plain Node
 * cannot resolve. Every transpiled file lives in .next/tmp-crosslinks/lib,
 * so an '@/'-suffixed specifier maps to that directory.
 */
function registerAliasResolver() {
  const cwd = process.cwd();
  const Module = require('module');
  const outDir = path.join(cwd, '.next', 'tmp-crosslinks', 'lib');
  const originalResolve = Module._resolveFilename;
  Module._resolveFilename = function (request, ...rest) {
    if (request.startsWith('@/')) {
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      return originalResolve.call(this, `${outDir}/${request.slice('@/lib/'.length)}.js`, ...rest);
    }
    return originalResolve.apply(this, [request, ...rest]);
  };
}

function loadSitemapData() {
  const cwd = process.cwd();
  const tsNode = `${cwd}/node_modules/ts-node`;
  if (require('fs').existsSync(tsNode)) {
    require('ts-node/register/transpile-only');
    return require('../src/lib/sitemapData.ts');
  }
  // No ts-node available: transpile the sitemap data libs with the shared
  // check tsconfig (path aliases resolved) into a temp dir and require it.
  execSync('npx tsc --project tsconfig.check-crosslinks.json', { stdio: 'inherit' });
  registerAliasResolver();
  return require(`${cwd}/.next/tmp-crosslinks/lib/sitemapData.js`);
}

const { STATIC_ROUTES, sitemapPaths, excludedRoutePrefixes } = loadSitemapData();

// ── Scan src/app for static page routes ─────────────────────────────────
// (src/lib/sitemapData.ts cannot import fs — build-scoped concern only.)
const APP_DIR = path.join(process.cwd(), 'src', 'app');

/**
 * Route segment whose folder name is a Next.js dynamic param (e.g.
 * '[slug]', '[category]') — data-generated routes. Their URLs come from
 * buildSitemapEntries() (posts/products/category data) or from an
 * excluded prefix, never from STATIC_ROUTES; the check cannot enumerate
 * them statically and treats the parent route as authoritative.
 */
const DYNAMIC_SEGMENT = /^\[.+\]$/;

/** Recursively find every page.tsx under src/app → its route path. */
function findPageRoutes(dir, base = '') {
  const routes = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_')) continue;
    const full = path.join(dir, entry.name);
    const isPage = fs.existsSync(path.join(full, 'page.tsx'));
    const routePath = `${base}/${entry.name}`;
    if (isPage && !DYNAMIC_SEGMENT.test(entry.name)) routes.push(routePath);
    routes.push(...findPageRoutes(full, routePath));
  }
  if (fs.existsSync(path.join(dir, 'page.tsx')) && base === '') {
    routes.unshift('');
  }
  return routes;
}

const appRoutes = findPageRoutes(APP_DIR);
const listed = sitemapPaths();
const excluded = excludedRoutePrefixes();

const problems = [];

for (const route of appRoutes) {
  const inSitemap = listed.has(route.replace(/\/$/, ''));
  const isExcluded = excluded.some(
    (prefix) => prefix !== '' && (route === prefix || route.startsWith(`${prefix}/`))
  );
  if (inSitemap || isExcluded) continue;

  problems.push(route);
}

if (problems.length > 0) {
  console.warn(
    [
      '',
      '┌─────────────────────────────────────────────────────────────────┐',
      '│  SITEMAP COMPLETENESS WARNING (scripts/check-sitemap-routes.js) │',
      '└─────────────────────────────────────────────────────────────────┘',
      '',
      'The following src/app page routes are NOT in sitemap.xml and NOT in',
      'the explicit exclude list. Decide what each one is:',
      '',
      ...problems.map((route) => `  • ${route || '/'}`),
      '',
      '→ PUBLIC + INDEXABLE: add it to STATIC_ROUTES in',
      '  src/lib/sitemapData.ts (with its real last-change date).',
      '→ PRIVATE / UTILITY / NOINDEX: add its route prefix to EXCLUDED_ROUTES',
      '  in the same file (and to the matching robots.ts disallow rules).',
      '',
    ].join('\n')
  );
  process.exit(1);
}

console.log(
  `check-sitemap-routes: OK — ${appRoutes.length} static page route(s) accounted for ` +
    `(${STATIC_ROUTES.length} in sitemap, ${excluded.length} excluded).`
);
