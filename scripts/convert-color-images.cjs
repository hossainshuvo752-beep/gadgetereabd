/**
 * Color-aware product image conversion — extends the original numbered-file
 * pipeline for products whose photos are organized by COLOR.
 *
 * Input folders (under SRC ROOT) contain files named "<Color> <N>.jfif" or
 * "<Color>.jfif". Each color becomes its own WebP set:
 *   <outSlug>/<color-slug>/1.webp, 2.webp, ...   (order = trailing number, else name)
 * Color sets are also emitted as numbered fallback files (1.webp, 2.webp, …)
 * so any consumer that ignores colors still sees a sensible gallery
 * (fallbAcks SKIP images already emitted for an earlier color — no duplicates).
 *
 * Output: public/images/products/<slug>/... plus a manifest at
 * scripts/color-images-manifest.json mapping each product to its color sets.
 *
 * Usage: node scripts/convert-color-images.cjs "D:/bd web blog image" [onlyFolderName]
 */
const fs = require('fs');
const path = require('path');
const sharp = require(path.join(process.cwd(), 'node_modules', 'sharp'));

const SRC_ROOT = process.argv[2];
const ONLY = process.argv[3]; // optional: process a single source folder

if (!SRC_ROOT) {
  console.error('Usage: node scripts/convert-color-images.cjs <srcRoot> [onlyFolderName]');
  process.exit(1);
}

const OUT_ROOT = path.join(process.cwd(), 'public', 'images', 'products');
const MAX_EDGE = 1600; // detail-page hero cap; never upscale
const TARGET_BYTES = 200 * 1024; // per-image budget (matches the original pass)

const slugify = (s) =>
  s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// "Emerald Lake Green 2" -> { color: "Emerald Lake Green", n: 2 }
// "Sandy Titanium"      -> { color: "Sandy Titanium", n: 0 }  (n=0 = unnumbered)
function parseName(filename) {
  const base = filename.replace(/\.(jpe?g|jfif|png|webp)$/i, '');
  const m = base.match(/^(.*?)[\s.]?(\d+)$/); // trailing number (allow "Terra Cotta2")
  if (m && m[1].trim()) return { color: m[1].trim(), n: parseInt(m[2], 10) };
  return { color: base.trim(), n: 0 };
}

async function convert(srcPath, outPath) {
  for (let q = 82; q >= 70; q -= 6) {
    const buf = await sharp(srcPath)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: q, effort: 6 })
      .toBuffer();
    if (buf.length <= TARGET_BYTES || q === 70) {
      fs.writeFileSync(outPath, buf);
      return { bytes: buf.length, q };
    }
  }
}

(async () => {
  const manifest = {};
  const folders = fs
    .readdirSync(SRC_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'New folder')
    .map((d) => d.name)
    .filter((name) => (ONLY ? name === ONLY : true))
    .sort();

  let totalBytes = 0;
  let totalFiles = 0;

  for (const folder of folders) {
    const files = fs
      .readdirSync(path.join(SRC_ROOT, folder))
      .filter((f) => /\.(jpe?g|jfif|png)$/i.test(f));
    if (files.length === 0) continue;

    // Detect color organization: a color token must appear on >=2 files,
    // or the folder has >1 file whose names aren't generic img/image.
    const parsed = files.map((f) => ({ file: f, ...parseName(f) }));
    const byColor = new Map();
    for (const p of parsed) {
      const key = p.color.toLowerCase();
      if (!byColor.has(key)) byColor.set(key, []);
      byColor.get(key).push(p);
    }
    // Detect color organization: >=2 DISTINCT non-generic color tokens
    // ("img 1"/"image 2" are generic; "Emerald Lake Green" is not). Catches
    // both "Color 1/Color 2" multi-angle sets and one-file-per-color folders.
    const genericRe = /^(img|image|hero)[\s.-]*\d*$/i;
    const distinctNonGeneric = new Set(
      parsed.filter((p) => !genericRe.test(p.color)).map((p) => p.color.toLowerCase())
    );
    const isColorOrganized = distinctNonGeneric.size >= 2;

    if (!isColorOrganized) continue; // generic set — original pipeline already handled it

    const slug = slugify(folder);
    const outDir = path.join(OUT_ROOT, slug);
    fs.mkdirSync(outDir, { recursive: true });

    // Order colors alphabetically; within a color: numbered files ascending,
    // unnumbered (single) file first.
    const colorKeys = [...byColor.keys()].sort();
    const colorSets = [];
    const fallbackUsed = new Set(); // source files already emitted as a fallback number
    let fallbackIdx = 0;

    for (const key of colorKeys) {
      const group = byColor.get(key).sort((a, b) => (a.n || 99) - (b.n || 99));
      const colorName = group[0].color; // original casing from the filename
      const colorSlug = slugify(colorName);
      const colorDir = path.join(outDir, colorSlug);
      fs.mkdirSync(colorDir, { recursive: true });

      const images = [];
      for (let i = 0; i < group.length; i++) {
        const src = path.join(SRC_ROOT, folder, group[i].file);
        const out = path.join(colorDir, `${i + 1}.webp`);
        const { bytes } = await convert(src, out);
        totalBytes += bytes;
        totalFiles++;
        images.push(`/images/products/${slug}/${colorSlug}/${i + 1}.webp`);
      }
      colorSets.push({ color: colorName, images });

      // Numbered fallbacks (hero of each color first, then extra angles)
      for (const g of group) {
        fallbackIdx++;
        const src = path.join(SRC_ROOT, folder, g.file);
        const out = path.join(outDir, `${fallbackIdx}.webp`);
        await convert(src, out);
        fallbackUsed.add(g.file);
      }
    }

    manifest[folder] = { slug, colorSets };
    console.log(
      `${folder}: ${colorSets.length} colors -> ${colorSets
        .map((c) => `${c.color}(${c.images.length})`)
        .join(', ')}`
    );
  }

  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'color-images-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(
    `\nDone: ${totalFiles} images, ${(totalBytes / 1024 / 1024).toFixed(2)}MB total. Manifest written.`
  );
})();
