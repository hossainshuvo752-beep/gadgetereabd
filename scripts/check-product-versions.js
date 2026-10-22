/**
 * Version guard — run with `node scripts/check-product-versions.js`
 * (wired into the build BEFORE next build).
 *
 * A product may carry `versions` (Global / China): a third variant dimension
 * that swaps its gallery, its colours, its priced storage options and its
 * version-specific specs. That only works when every version is COMPLETE, so
 * this guard fails the build when:
 *
 *   1. a version has no id / label / shortLabel, or two versions share an id;
 *   2. a version has no colorImages (the gallery and the swatches both come
 *      from them), an empty colour name, or a colour with no images;
 *   3. a version has no priced variant (nothing selectable to buy/price), or
 *      a variant with a missing/non-positive price;
 *   4. an image path a version points at does not exist in public/ (a typo
 *      here is a broken gallery on a live page);
 *   5. `defaultVersion` does not name one of the versions;
 *   6. the product's flat `price` is not the default version's lowest priced
 *      variant — the cards, JSON-LD and metadata all read that flat price,
 *      so it must be what the page shows when it opens.
 *
 * Products without `versions` are not inspected at all.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();

function fail(messages) {
  console.error('\n\x1b[31mcheck-product-versions: FAILED\x1b[0m');
  for (const m of messages) console.error(`  - ${m}`);
  console.error('');
  process.exit(1);
}

/** Load the shared catalog fresh (same approach as check-product-actions). */
function loadCatalog() {
  try {
    if (fs.existsSync(path.join(root, 'node_modules/ts-node'))) {
      require('ts-node/register/transpile-only');
      return require(path.join(root, 'src/lib/products.ts'));
    }
    const outDir = path.join(root, '.next/tmp-product-versions');
    execSync(
      `npx tsc src/lib/products.ts --outDir "${outDir}" --module commonjs --target es2020 --moduleResolution node --skipLibCheck`,
      { stdio: 'inherit', cwd: root }
    );
    return require(path.join(outDir, 'products.js'));
  } catch (error) {
    fail([`could not load the product catalog: ${error.message}`]);
  }
}

const { products } = loadCatalog();
const problems = [];
let versionedProducts = 0;
let versionsChecked = 0;
let variantsChecked = 0;
let imagesChecked = 0;

for (const product of products) {
  const versions = product.versions ?? [];
  if (versions.length === 0) continue;
  versionedProducts++;
  const where = `"${product.title}" (id ${product.id})`;

  const ids = new Set();
  for (const version of versions) {
    versionsChecked++;
    const vWhere = `${where} version "${version.id || version.label || '?'}"`;
    if (!version.id || !version.id.trim()) problems.push(`${vWhere}: missing id`);
    if (!version.label || !version.label.trim()) problems.push(`${vWhere}: missing label`);
    if (!version.shortLabel || !version.shortLabel.trim()) problems.push(`${vWhere}: missing shortLabel`);
    if (ids.has(version.id)) problems.push(`${vWhere}: duplicate version id`);
    ids.add(version.id);

    const colors = version.colorImages ?? [];
    if (colors.length === 0) {
      problems.push(`${vWhere}: no colorImages — the gallery and colour swatches come from them`);
    }
    for (const set of colors) {
      if (!set.color || !set.color.trim()) problems.push(`${vWhere}: a colour has no name`);
      if (!set.images || set.images.length === 0) {
        problems.push(`${vWhere}: colour "${set.color}" has no images`);
        continue;
      }
      for (const img of set.images) {
        imagesChecked++;
        const file = path.join(root, 'public', img.replace(/^\//, ''));
        if (!fs.existsSync(file)) problems.push(`${vWhere}: image missing on disk — ${img}`);
      }
    }

    const variants = version.variants ?? [];
    if (variants.length === 0) {
      problems.push(`${vWhere}: no priced variant — nothing can be selected or priced`);
    }
    for (const variant of variants) {
      variantsChecked++;
      if (!variant.label || !variant.label.trim()) problems.push(`${vWhere}: a variant has no label`);
      if (typeof variant.price !== 'number' || !(variant.price > 0)) {
        problems.push(`${vWhere}: variant "${variant.label}" has no positive price`);
      }
    }
  }

  const fallback = versions.find((v) => v.id === product.defaultVersion);
  if (!fallback) {
    problems.push(`${where}: defaultVersion "${product.defaultVersion ?? '(unset)'}" is not one of its versions`);
  } else {
    const prices = fallback.variants.map((v) => v.price).filter((n) => typeof n === 'number');
    const lowest = prices.length ? Math.min(...prices) : null;
    if (lowest !== null && product.price !== lowest) {
      problems.push(
        `${where}: flat price ${product.price} is not the default version's lowest variant price ${lowest} — cards, JSON-LD and metadata would disagree with the page`
      );
    }
  }
}

if (problems.length > 0) fail(problems);

console.log(
  `check-product-versions: OK — ${versionedProducts} versioned product(s), ${versionsChecked} version(s), ` +
    `${variantsChecked} priced variant(s), ${imagesChecked} image(s) present.`
);
