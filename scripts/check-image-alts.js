/**
 * Alt-text guard — run automatically during `next build` (see package.json
 * "build"), AFTER next build has produced static HTML.
 *
 * Scans every prerendered HTML page under .next/server/app and flags:
 *   1. <img> tags WITHOUT an alt attribute at all (decorative images must
 *      have an explicit alt=""),
 *   2. duplicate NON-EMPTY alt text among the images of the SAME page
 *      (two visible images described identically is an accessibility
 *      defect; empty alt="" for decorative images is exempt).
 *
 * Exit 1 with a boxed warning when either violation appears, so a new page
 * whose images lack alt fails the build before deploy, not in a later audit.
 */
const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

const problems = [];
const pages = walk(path.join(process.cwd(), '.next', 'server', 'app'));

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];

  const missing = imgTags.filter((tag) => !/\salt\s*=/i.test(tag));

  // Group non-empty alts by value → the FIRST value seen more than twice
  // (i.e. by a second image on the same page) is a duplicate.
  const counts = new Map();
  for (const tag of imgTags) {
    const m = tag.match(/\salt="([^"]*)"/i);
    if (!m) continue;
    const alt = m[1];
    if (!alt) continue; // empty decorative alt exempt
    counts.set(alt, (counts.get(alt) ?? 0) + 1);
  }
  const duplicates = [...counts.entries()].filter(([, n]) => n > 1);

  const pageRoute = path
    .relative(path.join(process.cwd(), '.next', 'server', 'app'), file)
    .replace(/\.html$/, '')
    .replace(/\\/g, '/');

  if (missing.length > 0) {
    problems.push(
      `  • ${pageRoute}: ${missing.length} image(s) WITHOUT alt attribute — add alt or alt="" for decorative`
    );
  }
  if (duplicates.length > 0) {
    problems.push(
      `  • ${pageRoute}: ${duplicates.length} duplicate alt text(s), e.g. ${duplicates
        .slice(0, 2)
        .map(([a]) => `"${a.slice(0, 60)}"`)
        .join(', ')}`
    );
  }
}

if (problems.length > 0) {
  console.warn(
    [
      '',
      '┌─────────────────────────────────────────────────────────────────┐',
      '│  ALT-TEXT GUARD WARNING (scripts/check-image-alts.js)           │',
      '└─────────────────────────────────────────────────────────────────┘',
      '',
      ...problems,
      '',
      '→ Every <img> needs an alt; use the shared src/lib/imageAlt.ts helper.',
      '→ Decorative images get alt="" deliberately, never a missing attribute.',
      '→ Two images on one page must not share identical alt text.',
      '',
    ].join('\n')
  );
  process.exit(1);
}

console.log(
  `check-image-alts: OK — ${pages.length} prerendered page(s), every image has alt and no per-page duplicate alts.`
);
