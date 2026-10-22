/**
 * Content-hygiene guard — runs in the `build` chain (see package.json),
 * before next build, because it reads the SOURCE data rather than built HTML.
 *
 * 1) FAIL on CJK characters (Chinese / Japanese / Korean) in any Quick Look or
 *    blog content, or in a product spec sheet. The Camon 40 Pro guide shipped
 *    the fragment "更强的" in an English sentence ("some shops advertise the
 *    更强的 config"), which is invisible in review and embarrassing on a
 *    Bangladesh storefront. These ranges are deliberately narrow so Bengali
 *    (U+0980–U+09FF), the taka sign (U+09F3) and normal punctuation never
 *    match.
 *
 * 2) REPORT (never change) every "TBD" placeholder that would be shown in a
 *    spec table. A "TBD" is a missing fact, not a value: the row should be
 *    omitted (empty string in the data is omitted by KeyValue) until the
 *    figure is verified. Reported as warnings so the build still passes while
 *    the list is worked down.
 */
const fs = require('fs');
const path = require('path');

/** Files whose text ends up in front of a reader. */
const CONTENT_FILES = [
  'src/lib/quickLookContent.ts',
  'src/lib/posts.ts',
  'src/lib/products.ts',
  'src/lib/productSeo.ts',
];

/** CJK blocks: punctuation, kana, ideographs, Hangul, fullwidth forms. */
const CJK =
  /[\u1100-\u11FF\u2E80-\u2EFF\u3000-\u303F\u3040-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/;

const problems = [];
const tbd = [];
let scanned = 0;

for (const rel of CONTENT_FILES) {
  const file = path.join(process.cwd(), rel);
  if (!fs.existsSync(file)) {
    problems.push(`  • ${rel}: file not found (update CONTENT_FILES in this guard)`);
    continue;
  }
  scanned += 1;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const lineNo = i + 1;
    const hit = line.match(CJK);
    if (hit) {
      problems.push(
        `  • ${rel}:${lineNo}: CJK character "${hit[0]}" (U+${hit[0]
          .codePointAt(0)
          .toString(16)
          .toUpperCase()
          .padStart(4, '0')}) — write the sentence in English`
      );
    }
    if (/\bTBD\b/.test(line)) {
      tbd.push(`  - ${rel}:${lineNo}: ${line.trim().slice(0, 110)}`);
    }
  });
}

if (problems.length > 0) {
  console.error(
    [
      '',
      '┌─────────────────────────────────────────────────────────────────┐',
      '│  CJK CONTENT GUARD FAILED (scripts/check-cjk-placeholders.js)   │',
      '└─────────────────────────────────────────────────────────────────┘',
      '',
      ...problems,
      '',
      '→ Quick Look and blog copy must be in English (plus the Bengali',
      '  summary/FAQ fields, which are Bengali script, not CJK).',
      '',
    ].join('\n')
  );
  process.exit(1);
}

console.log(
  `check-cjk-placeholders: OK — no CJK characters in ${scanned} content file(s).`
);

if (tbd.length > 0) {
  console.warn(
    [
      '',
      `check-cjk-placeholders: WARNING — ${tbd.length} "TBD" placeholder(s) still in product data.`,
      'Each one prints "TBD" in a spec table; omit the row (empty string) until it is verified:',
      ...tbd,
      '',
    ].join('\n')
  );
}
