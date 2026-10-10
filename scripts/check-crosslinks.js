/**
 * Cross-link guard (rule 6) — run with `node scripts/check-crosslinks.js`
 * (wired into the `prebuild` npm script, so a broken slug fails the build).
 *
 * Every slug declared in a post's relatedProducts (src/lib/posts.ts) must
 * match a real product via slugify(product.title). Because BOTH renderers
 * derive from that single field — the post's "Products mentioned" block and
 * the product's Quick Look "Keep exploring" row — a typo here would ship a
 * broken link in two places at once. This script makes that a build
 * failure instead of a live-site bug.
 *
 * Also warns when relatedProducts grow past the standing limits (5 per
 * post) so the rules stay honest as content expands.
 */
const { execSync } = require('child_process');

function loadModules() {
  const cwd = process.cwd();
  const tsNode = `${cwd}/node_modules/ts-node`;
  let products, posts, slugify;
  if (require('fs').existsSync(tsNode)) {
    require('ts-node/register/transpile-only');
    ({ products, slugify } = require('../src/lib/products.ts'));
    ({ posts } = require('../src/lib/posts.ts'));
  } else {
    // No ts-node available: transpile the two shared libs with the project
    // tsconfig (path aliases resolved) into a temp dir and require the JS.
    execSync(
      'npx tsc --project tsconfig.check-crosslinks.json',
      { stdio: 'inherit' }
    );
    ({ products, slugify } = require(`${cwd}/.next/tmp-crosslinks/lib/products.js`));
    ({ posts } = require(`${cwd}/.next/tmp-crosslinks/lib/posts.js`));
  }
  return { products, posts, slugify };
}

const { products, posts, slugify } = loadModules();
const realSlugs = new Set(products.map((p) => slugify(p.title)));

let failures = 0;
let warnings = 0;

for (const post of posts) {
  if (!post.relatedProducts) continue;
  if (post.relatedProducts.length > 5) {
    console.warn(
      `WARNING: post "${post.slug ?? post.id}" declares ${post.relatedProducts.length} products (max 5)`
    );
    warnings += 1;
  }
  for (const slug of post.relatedProducts) {
    if (!realSlugs.has(slug)) {
      console.error(
        `ERROR: post "${post.slug ?? post.id}" references unknown product slug "${slug}" — fix or remove it in src/lib/posts.ts`
      );
      failures += 1;
    } else if (post.relatedProducts.indexOf(slug) !== post.relatedProducts.lastIndexOf(slug)) {
      console.warn(
        `WARNING: post "${post.slug ?? post.id}" lists "${slug}" twice`
      );
      warnings += 1;
    }
  }
}

if (failures > 0) {
  console.error(`\ncheck-crosslinks: ${failures} broken link(s), aborting.`);
  process.exit(1);
}
console.log(
  `check-crosslinks: OK — ${posts.filter((p) => p.relatedProducts?.length).length} post(s) cross-linked, ${realSlugs.size} catalog slugs${warnings ? `, ${warnings} warning(s)` : ''}`
);
