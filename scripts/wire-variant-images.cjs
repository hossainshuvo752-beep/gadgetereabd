/**
 * One-off wiring: injects colorImages + variants fields into matching product
 * blocks in src/lib/products.ts, inserted right after each product's `gallery`
 * line (kept in one place per product, easy to review/edit by hand later).
 *
 * colorImages come from scripts/color-images-manifest.json (converted WebP
 * sets). Variant prices come from the VARIANTS table below (prices the user
 * supplied; empty = no variants entry for that product).
 *
 * Color-name alignment: buildDesign.colors for color-image products is
 * aligned to the image filenames here (see ALIGN table) — the user approved
 * aligning data colors to image filenames.
 *
 * Usage: node scripts/wire-variant-images.cjs
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'src', 'lib', 'products.ts');
const manifest = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'scripts', 'color-images-manifest.json'), 'utf8')
);

/** Product title (exact) → variant price rows (label must match a storage option). */
const VARIANTS = {}; // none yet — prices pending from the user

/** Color-name fixes: product title → { old: new } applied to buildDesign.colors. */
const ALIGN = {
  'Tecno Camon 40 Pro': { 'Glacier White': 'Sandy Titanium' },
  'Infinix Note 60 Pro': {
    'Mist Titanium': 'Frost Silver',
    'Midnight Black': 'Torino Black',
    'Fizz Blue': 'Solar Orange',
  },
  'Xiaomi Redmi Watch 5': {
    Black: 'Obsidian Black',
    Silver: 'Silver Gray',
    Blue: 'Lavender Purple',
  },
  'Lenovo IdeaCentre AIO 27\\u2033': { 'Cloud Gray': 'Dark Grey' },
  'ASUS Vivobook 15 (X1504VA)': { 'Quiet Blue': 'Quiet Blue', 'Cool Silver': 'Cool Silver' },
};

/** Folder names in the manifest that are AI-generated images, not colors. */
const AI_TOKEN = 'Gemini_Generated_Image';

const norm = (s) => s.toLowerCase().replace(/\\u2033/g, '″').replace(/[^a-z0-9]/g, '');
const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

(async () => {
  const src = fs.readFileSync(FILE, 'utf8');
  const lines = src.split('\n');

  // Pass 1 — align buildDesign.colors entries (exact array-item replacement).
  // Scan until the NEXT product title (colors sit deep in buildDesign, far
  // past the specSheet sub-objects).
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)title: '(.+?)',\s*$/);
    if (!m) continue;
    const rawTitle = m[2].replace(/\\u2033/g, '″');
    const fixes = ALIGN[rawTitle];
    if (!fixes) continue;
    for (let j = i + 1; j < Math.min(i + 200, lines.length); j++) {
      if (/^    title: /.test(lines[j])) break; // reached the next product
      const cm = lines[j].match(/^(\s*)colors: \[(.*)\],\s*$/);
      if (!cm) continue;
      let items = cm[2].match(/'[^']*'/g) || [];
      items = items.map((it) => {
        const val = it.slice(1, -1).replace(/\\u2033/g, '″');
        return fixes[val] ? `'${fixes[val]}'` : it;
      });
      lines[j] = `${cm[1]}colors: [${items.join(', ')}],`;
      break;
    }
  }

  // Pass 2 — inject colorImages (and variants when present) after the gallery line.
  let injected = 0;
  const byNormTitle = {};
  for (const [folder, data] of Object.entries(manifest)) {
    byNormTitle[norm(folder)] = data;
  }

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\s*)title: '(.+?)',\s*$/);
    if (!m) continue;
    const rawTitle = m[2].replace(/\\u2033 escapes/g, '');
    const normTitle = norm(m[2]);
    const data = byNormTitle[normTitle];
    if (!data) continue;

    // Idempotency: skip products already injected in a previous run.
    const alreadyInjected = lines
      .slice(i + 1, i + 80)
      .some((l) => l.includes('colorImages: ['));
    if (alreadyInjected) continue;

    // Skip AI-generated "colors" — they are gallery art, not purchasable colors.
    const realColors = data.colorSets.filter((c) => !c.color.startsWith(AI_TOKEN));
    if (realColors.length === 0) continue;

    // Align colorImages color names with the (aligned) buildDesign colors.
    const fixes = ALIGN[rawTitle] || {};
    const colorImages = realColors.map((c) => {
      const aligned = fixes[c.color] || c.color;
      return `      { color: '${esc(aligned)}', images: [${c.images
        .map((p) => `'${p}'`)
        .join(', ')}] },`;
    });

    const variantLines = (VARIANTS[m[2]] || []).map(
      (v) =>
        `      { label: '${esc(v.label)}', price: ${v.price}${
          v.oldPrice !== undefined ? `, oldPrice: ${v.oldPrice}` : ''
        }${v.priceEstimated ? ', priceEstimated: true' : ''} },`
    );

    const block = [];
    if (variantLines.length) {
      block.push('    variants: [');
      block.push(...variantLines);
      block.push('    ],');
    }
    block.push('    colorImages: [');
    block.push(...colorImages);
    block.push('    ],');

    // Find this product's gallery line and insert after it.
    for (let j = i; j < Math.min(i + 60, lines.length); j++) {
      if (/^\s{4}gallery: \[/.test(lines[j])) {
        let end = j;
        while (lines[end] && !/\],\s*$/.test(lines[end])) end++;
        lines.splice(end + 1, 0, ...block);
        injected++;
        break;
      }
    }
  }

  fs.writeFileSync(FILE, lines.join('\n'));
  console.log(`Injected colorImages/variants into ${injected} products.`);
})();
