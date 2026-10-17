/**
 * Purchase-action guard — run with `node scripts/check-product-actions.js`
 * (wired into the build BEFORE next build, so a hand-rolled CTA fails it).
 *
 * Why this exists: every Buy Now / Add to Cart / Pre-Order / Coming Soon /
 * Free Order button must come from src/components/ProductActions.tsx, because
 * that one component owns the mode switch:
 *
 *   mode 'buy'        → Add to Cart + Buy Now (Pre-Order / Coming Soon)
 *   mode 'free-order' → ONE Free Order button
 *
 * The checks below fail the build when:
 *   1. a product surface stops delegating to ProductActions (it imports the
 *      component and renders it), or
 *   2. a product surface starts rendering its own purchase CTA text again, or
 *   3. ProductActions loses the purchaseModeOf() switch, or
 *   4. the free-order block can render a buy action / the buy block can
 *      render Free Order (i.e. Buy Now and Free Order together), or
 *   5. a DEAL — any product flagged isDeal, i.e. anything /deals can list — is
 *      in 'free-order' mode or only has an estimated price. /deals shows a
 *      Buy Now + Add to Cart price offer, so a product nobody may actually
 *      buy at a confirmed price must never appear there.
 *
 * Copy that is not a CTA (checkout/cart/terms/faq/confirmation pages) is not
 * scanned — only the surfaces that render product cards / detail CTAs.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = process.cwd();
const ACTIONS_FILE = 'src/components/ProductActions.tsx';

/** Product surfaces that must render the shared component, never raw CTAs. */
const SURFACES = [
  'src/components/ProductCard.tsx',
  'src/components/ShopTeaser.tsx',
  'src/components/QuickLookDetail.tsx',
  'src/app/shop/page.tsx',
  'src/app/shop/[slug]/page.tsx',
  'src/app/new-arrivals/page.tsx',
  'src/app/deals/page.tsx',
  'src/app/quick-look/page.tsx',
  'src/app/quick-look/[slug]/page.tsx',
];

/** These two render the buttons directly, so they must import ProductActions. */
const DIRECT_RENDERERS = [
  'src/components/ProductCard.tsx',
  'src/components/QuickLookDetail.tsx',
];

/** A rendered CTA is JSX text: `>Buy Now<`, not prose or a status string. */
const CTA_WORDS = />\s*(Buy Now|Add to Cart|Pre-Order|Coming Soon|Free Order)\s*</;
const FREE_ORDER_BLOCK = /data-purchase-block="free-order"/;
const BUY_BLOCK = /data-purchase-block="buy"/;
const BUY_ACTIONS = /(\bBuy Now\b|\bAdd to Cart\b|\bPre-Order\b|\bComing Soon\b)/;
const FREE_ACTION = /\bFree Order\b/;

function fail(message) {
  console.error('\n\x1b[31mcheck-product-actions: FAILED\x1b[0m');
  console.error(`  ${message}\n`);
  process.exit(1);
}

/** Strip // and block comments so documentation may name the CTAs freely. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

/**
 * Load the shared catalog (typescript). ts-node reads the source directly;
 * otherwise the single file is transpiled FRESH into .next/tmp-product-actions
 * on every run — never a cached copy from an earlier build, because this
 * guard must judge the products as they are right now (a stale artifact would
 * silently pass a deal that was just flipped to free-order). The catalog MUST
 * load: this guard's whole point is the product data, so a load failure is a
 * build failure, never a skip.
 */
function loadCatalog() {
  const cwd = root;
  try {
    if (fs.existsSync(path.join(cwd, 'node_modules/ts-node'))) {
      require('ts-node/register/transpile-only');
      return require(path.join(cwd, 'src/lib/products.ts'));
    }
    const outDir = path.join(cwd, '.next/tmp-product-actions');
    execSync(
      `npx tsc src/lib/products.ts --outDir "${outDir}" --module commonjs --target es2020 --moduleResolution node --skipLibCheck`,
      { stdio: 'inherit', cwd }
    );
    return require(path.join(outDir, 'products.js'));
  } catch (error) {
    fail(`could not load the product catalog to check /deals: ${error.message}`);
  }
}

const problems = [];

for (const rel of SURFACES) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) {
    problems.push(`${rel} is missing (listed as a product surface).`);
    continue;
  }
  const src = fs.readFileSync(abs, 'utf8');
  const code = stripComments(src);

  const delegates =
    /from ['"](@\/components\/ProductActions|\.\/ProductActions)['"]/.test(code) ||
    /from ['"](@\/components\/(ProductCard|QuickLookDetail)|\.\/(ProductCard|QuickLookDetail))['"]/.test(
      code
    );
  if (!delegates) {
    problems.push(
      `${rel} renders a product listing/detail but neither imports ProductActions nor reuses ProductCard/QuickLookDetail.`
    );
  }
  if (DIRECT_RENDERERS.includes(rel) && !/ProductActions/.test(code)) {
    problems.push(`${rel} must render the shared ProductActions component.`);
  }
  const match = code.match(CTA_WORDS);
  if (match) {
    problems.push(
      `${rel} renders its own purchase button ("${match[1]}") — use ProductActions instead.`
    );
  }
}

// ---- ProductActions itself -------------------------------------------------
const actionsAbs = path.join(root, ACTIONS_FILE);
if (!fs.existsSync(actionsAbs)) fail(`${ACTIONS_FILE} is missing.`);
const actionsCode = stripComments(fs.readFileSync(actionsAbs, 'utf8'));

if (!/purchaseModeOf\s*\(/.test(actionsCode)) {
  problems.push(`${ACTIONS_FILE} must derive its mode with purchaseModeOf(product).`);
}
if (!FREE_ORDER_BLOCK.test(actionsCode) || !BUY_BLOCK.test(actionsCode)) {
  problems.push(
    `${ACTIONS_FILE} must keep the data-purchase-block="free-order" and "buy" markers (the guard needs them to prove the actions never mix).`
  );
} else {
  const freeStart = actionsCode.search(FREE_ORDER_BLOCK);
  const buyStart = actionsCode.search(BUY_BLOCK);
  const freeBlock = actionsCode.slice(freeStart, buyStart > freeStart ? buyStart : undefined);
  const buyBlock = actionsCode.slice(buyStart);

  const clashInFree = freeBlock.match(BUY_ACTIONS);
  if (clashInFree) {
    problems.push(
      `${ACTIONS_FILE}: the free-order block renders "${clashInFree[0]}" — Buy Now and Free Order must never appear together.`
    );
  }
  if (FREE_ACTION.test(buyBlock)) {
    problems.push(
      `${ACTIONS_FILE}: the buy block can render Free Order — a product must have exactly one purchase mode.`
    );
  }
  // Exactly one visible label per action across the whole component (the
  // detail + card layouts share the same JSX branch, so one occurrence each).
  const freeLabels = (actionsCode.match(/>\s*Free Order\s*</g) || []).length;
  const buyLabels = (actionsCode.match(/>\s*Buy Now\s*</g) || []).length;
  if (freeLabels !== 1) {
    problems.push(`${ACTIONS_FILE}: expected exactly one "Free Order" label, found ${freeLabels}.`);
  }
  if (buyLabels !== 1) {
    problems.push(`${ACTIONS_FILE}: expected exactly one "Buy Now" label, found ${buyLabels}.`);
  }
}

// ---- Deals exclusivity -----------------------------------------------------
const dealsRel = 'src/app/deals/page.tsx';
const dealsCode = stripComments(fs.readFileSync(path.join(root, dealsRel), 'utf8'));
if (!/isDeal/.test(dealsCode)) {
  problems.push(
    `${dealsRel} no longer filters the shared catalog on isDeal — /deals must list deals only.`
  );
}

const { products, purchaseModeOf } = loadCatalog();
const forbiddenDeals = products.filter(
  (p) => p.isDeal === true && (purchaseModeOf(p) === 'free-order' || p.priceEstimated === true)
);
if (forbiddenDeals.length > 0) {
  problems.push(
    `${forbiddenDeals.length} product(s) on /deals are free-order or estimated-price: ` +
      forbiddenDeals
        .map((p) => `"${p.title}" (id ${p.id}${p.priceEstimated ? ', estimated price' : ''})`)
        .join(', ') +
      ' — a deal must be buyable at a confirmed price (drop isDeal or set purchaseMode: "buy" with a real price).'
  );
}

if (problems.length > 0) {
  fail(problems.map((p) => `- ${p}`).join('\n  '));
}

console.log(
  `check-product-actions: OK — ${SURFACES.length} product surface(s) delegate to ProductActions; ` +
    'free-order and buy blocks are mutually exclusive; ' +
    `${products.filter((p) => p.isDeal === true).length} deal(s) all in buy mode.`
);
