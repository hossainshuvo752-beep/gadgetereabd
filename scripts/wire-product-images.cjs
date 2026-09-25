/**
 * One-off wiring script: inserts heroImage + gallery fields from
 * scripts/product-images-manifest.json into the matching product blocks
 * in src/lib/products.ts (inserted right after each product's imageAlt).
 * Matching is by normalized title (lowercase, alphanumeric only), so
 * differences like a literal ″ vs an escaped \\u2033 don't matter.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(process.cwd(), 'src', 'lib', 'products.ts');
const MANIFEST = path.join(process.cwd(), 'scripts', 'product-images-manifest.json');

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const byNorm = new Map(manifest.products.map((p) => [normalize(p.folder), p]));

const src = fs.readFileSync(FILE, 'utf8');
const lines = src.split('\n');

// Locate product block boundaries: every "    title: '...'," starts a block.
const titleIdx = [];
lines.forEach((l, i) => {
  const m = l.match(/^\s{4}title: '(.+)',$/);
  if (m) titleIdx.push({ line: i, title: m[1] });
});

let matched = 0;
const unmatchedFolders = new Set(byNorm.keys());
const matchedNames = [];

for (let t = 0; t < titleIdx.length; t++) {
  const { line, title } = titleIdx[t];
  const key = normalize(title);
  const entry = byNorm.get(key);
  if (!entry) continue;

  unmatchedFolders.delete(key);
  matched++;
  matchedNames.push(`${title} -> ${entry.slug} (${entry.gallery.length} imgs)`);

  // Skip if already wired (idempotent re-runs).
  const blockEnd = t + 1 < titleIdx.length ? titleIdx[t + 1].line : lines.length;
  if (lines.slice(line, blockEnd).some((l) => l.includes('heroImage:'))) {
    console.log(`skip (already wired): ${title}`);
    continue;
  }

  // Insert after the imageAlt line inside this product block.
  let altLine = -1;
  for (let i = line; i < blockEnd; i++) {
    if (/^\s{4}imageAlt:/.test(lines[i])) {
      altLine = i;
      break;
    }
  }
  if (altLine === -1) {
    console.error(`ERROR: no imageAlt found in block for ${title}`);
    process.exit(1);
  }

  const galleryJson = JSON.stringify(entry.gallery, null, 8).replace(/\n/g, '\n    ');
  const insertion = [
    `    /** Real product photos (hero = 1.webp; rest are gallery angles).`,
    `     *  Served from public/images/products/${entry.slug}/ — the single`,
    `     *  shared copy used by Shop, Quick Look, and every other surface. */`,
    `    heroImage: '${entry.gallery[0]}',`,
    `    gallery: ${galleryJson},`,
  ];

  lines.splice(altLine + 1, 0, ...insertion);
  // Insertion shifts all later recorded line indices.
  for (let j = t + 1; j < titleIdx.length; j++) titleIdx[j].line += insertion.length;
}

fs.writeFileSync(FILE, lines.join('\n'));

console.log(`Matched and wired ${matched} products:`);
matchedNames.forEach((m) => console.log('  ' + m));
if (unmatchedFolders.size) {
  console.log(`UNMATCHED image folders (${unmatchedFolders.size}):`);
  unmatchedFolders.forEach((k) => console.log('  ' + k));
} else {
  console.log('All image folders matched.');
}
