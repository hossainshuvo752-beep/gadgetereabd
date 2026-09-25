/**
 * Product image converter (one-off utility, kept for future batches).
 *
 * Usage: node scripts/convert-product-images.cjs "<source root folder>"
 *
 * For each immediate sub-folder of the source root (one folder per product):
 *  - URL-safe slug for the folder name -> public/images/products/<slug>/
 *  - Images renamed 1.webp, 2.webp, ... in natural (numeric-aware) order;
 *    1.webp is the HERO image.
 *  - WebP, max effort, quality starts at 82 and steps down only if a file
 *    exceeds ~200KB (floor of 64 — never sacrifices visible quality).
 *  - Downscales to max 1600px on the long side (never enlarges). Warns if a
 *    source's short side is below 800px (below hero resolution target).
 *  - Writes scripts/product-images-manifest.json mapping slug -> gallery
 *    paths for wiring into src/lib/products.ts.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_ROOT = process.argv[2];
if (!SRC_ROOT) {
  console.error('Usage: node scripts/convert-product-images.cjs "<source folder>"');
  process.exit(1);
}
const OUT_ROOT = path.join(process.cwd(), 'public', 'images', 'products');
const MANIFEST = path.join(process.cwd(), 'scripts', 'product-images-manifest.json');
const IMG_RE = /\.(jpe?g|jfif|png|webp|avif|gif)$/i;
const SKIP_FOLDERS = new Set(['new folder']);
const MAX_BYTES = 200 * 1024;
const QUALITIES = [82, 76, 70, 64];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[\u201c\u201d\u2032\u2033"']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

async function encodeImage(src, outPath) {
  const base = sharp(src)
    .rotate() // respect EXIF orientation
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });
  const meta = await base.metadata();
  let chosen = null;
  for (const q of QUALITIES) {
    const { data, info } = await base
      .clone()
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
    chosen = { data, quality: q, width: info.width, height: info.height };
    if (data.length <= MAX_BYTES) break;
  }
  fs.writeFileSync(outPath, chosen.data);
  return chosen;
}

(async () => {
  const folders = fs
    .readdirSync(SRC_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !SKIP_FOLDERS.has(d.name.toLowerCase()))
    .map((d) => d.name)
    .sort(collator.compare);

  let totalBefore = 0;
  let totalAfter = 0;
  let totalCount = 0;
  const warnings = [];
  const manifest = [];

  for (const folder of folders) {
    const files = fs
      .readdirSync(path.join(SRC_ROOT, folder))
      .filter((f) => IMG_RE.test(f))
      .sort(collator.compare);
    if (files.length === 0) continue;

    const slug = slugify(folder);
    const outDir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(outDir, { recursive: true });
    const gallery = [];
    let before = 0;
    let after = 0;

    for (let i = 0; i < files.length; i++) {
      const src = path.join(SRC_ROOT, folder, files[i]);
      const outPath = path.join(outDir, `${i + 1}.webp`);
      const b = fs.statSync(src).size;
      const res = await encodeImage(src, outPath);
      const a = fs.statSync(outPath).size;
      before += b;
      after += a;
      gallery.push(`/images/products/${slug}/${i + 1}.webp`);
      const shortSide = Math.min(res.width, res.height);
      if (shortSide < 800) {
        warnings.push(`${slug}/${i + 1}.webp: short side ${shortSide}px (< 800)`);
      }
      if (res.quality < QUALITIES[0]) {
        warnings.push(`${slug}/${i + 1}.webp: quality reduced to ${res.quality} (source ${Math.round(b / 1024)}KB)`);
      }
    }

    totalBefore += before;
    totalAfter += after;
    totalCount += gallery.length;
    manifest.push({ folder, slug, gallery });
    console.log(
      `${slug}: ${gallery.length} images | ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(2)}MB`,
    );
  }

  fs.writeFileSync(MANIFEST, JSON.stringify({ generated: new Date().toISOString(), products: manifest }, null, 2));
  console.log('-----------------------------------------------------------');
  console.log(`TOTAL: ${totalCount} images | ${(totalBefore / 1048576).toFixed(1)}MB -> ${(totalAfter / 1048576).toFixed(2)}MB`);
  if (warnings.length) {
    console.log('WARNINGS:');
    warnings.forEach((w) => console.log(`  - ${w}`));
  } else {
    console.log('No warnings.');
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
