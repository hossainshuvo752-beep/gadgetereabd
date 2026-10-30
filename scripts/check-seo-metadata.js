/**
 * SEO metadata guard — run automatically during `next build` (see
 * package.json "build"), AFTER next build has produced static HTML, so it
 * checks what crawlers actually receive rather than what the data intends.
 *
 * Fails the build when any Quick Look page (/quick-look/[slug]), the Quick
 * Look listing (/quick-look), the blog index (/blog) or a blog post
 * (/posts/[slug]) breaks one of the standing metadata rules:
 *
 *   1. <title> longer than 60 characters, or carrying the " | Jupiter BD"
 *      brand suffix (every one of these titles is an absolute title that
 *      already contains what the searcher typed) — except the documented
 *      per-route exceptions below, where the owner supplied the exact
 *      string including the brand;
 *   2. meta description longer than 155 characters;
 *   3. no "Bangladesh" in the title — except the explicit, documented
 *      exceptions below, whose posts have no visible Bangladesh section and
 *      must not claim one;
 *   4. twitter:title / twitter:description missing or different from
 *      og:title / og:description (the layout's inherited listing copy was
 *      exactly this bug);
 *   5. placeholder text ("N/A", "None", "null", "undefined") in a
 *      description.
 *
 * Pages outside the scope above (homepage, shop, static pages, blog
 * CATEGORY listings) are deliberately skipped: they are not product or
 * article pages and carry their own nav wording.
 */
const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(process.cwd(), '.next', 'server', 'app');

/**
 * Posts that are ALLOWED to omit "Bangladesh" from the title because their
 * visible body has no Bangladesh section (no local price, availability or
 * warranty content). Adding the word would be an unbacked claim, so these
 * two are exempt until the owner supplies a verified Bangladesh section.
 */
const TITLE_BANGLADESH_EXCEPTIONS = {
  'posts/ios-27-features-release-date':
    'no Bangladesh section in the body — only a link label mentions it',
  'posts/best-laptop-for-programming-students':
    'only an FAQ question mentions Bangladesh; no local price, warranty or availability',
};

/**
 * Pages whose <title> is ALLOWED to end in " | Jupiter BD" because the owner
 * supplied that exact string. The suffix is normally banned only because the
 * root layout would otherwise append it a second time; these entries are
 * explicit, short enough for the 60-char budget, and documented here on
 * purpose. Adding a route needs the reason, not just the key.
 */
const TITLE_SUFFIX_EXCEPTIONS = {
  'quick-look/realme-c85-pro':
    'owner-supplied exact title ("Realme C85 Pro Price in Bangladesh | Jupiter BD", 47 chars)',
};

const MAX_TITLE = 60;
const MAX_DESCRIPTION = 155;
const PLACEHOLDERS = /\b(N\/A|None|null|undefined)\b/;

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

/** Decode the entities Next escapes into attributes/titles before measuring. */
function decode(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/** All <meta …> tags of a page, keyed by name/property. */
function readMeta(html) {
  const meta = new Map();
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = {};
    for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*"([^"]*)"/g)) {
      attrs[m[1].toLowerCase()] = decode(m[2]);
    }
    const key = attrs.property || attrs.name;
    if (key && attrs.content !== undefined) meta.set(key.toLowerCase(), attrs.content);
  }
  return meta;
}

function inScope(route) {
  return (
    route === 'quick-look' ||
    route.startsWith('quick-look/') ||
    route === 'blog' ||
    route.startsWith('posts/')
  );
}

const problems = [];
const pages = walk(APP_DIR);
let checked = 0;

for (const file of pages) {
  const route = path
    .relative(APP_DIR, file)
    .replace(/\.html$/, '')
    .replace(/\\/g, '/');
  if (!inScope(route)) continue;
  checked += 1;

  const html = fs.readFileSync(file, 'utf8');
  const meta = readMeta(html);

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decode(titleMatch[1].trim()) : '';
  const description = meta.get('description') ?? '';
  const ogTitle = meta.get('og:title') ?? '';
  const ogDescription = meta.get('og:description') ?? '';
  const twitterTitle = meta.get('twitter:title') ?? '';
  const twitterDescription = meta.get('twitter:description') ?? '';
  const ogImage = meta.get('og:image') ?? '';
  const twitterImage = meta.get('twitter:image') ?? '';

  const fail = (message) => problems.push(`  • ${route}: ${message}`);

  if (!title) {
    fail('no <title> tag');
  } else {
    if (title.length > MAX_TITLE) {
      fail(`title is ${title.length} chars (max ${MAX_TITLE}) — "${title}"`);
    }
    if (/\|\s*Jupiter BD\s*$/i.test(title) && !TITLE_SUFFIX_EXCEPTIONS[route]) {
      fail(`title carries the " | Jupiter BD" suffix — render it absolute: "${title}"`);
    }
    if (!/bangladesh/i.test(title) && !TITLE_BANGLADESH_EXCEPTIONS[route]) {
      fail(`title has no "Bangladesh" — "${title}"`);
    }
  }

  if (!description) {
    fail('no meta description');
  } else {
    if (description.length > MAX_DESCRIPTION) {
      fail(`description is ${description.length} chars (max ${MAX_DESCRIPTION})`);
    }
    if (PLACEHOLDERS.test(description)) {
      fail(`description contains placeholder text — "${description}"`);
    }
  }

  if (!twitterTitle) {
    fail('no twitter:title (it must be set per page, not inherited)');
  } else if (twitterTitle !== ogTitle) {
    fail(`twitter:title differs from og:title — "${twitterTitle}" vs "${ogTitle}"`);
  }
  if (!twitterDescription) {
    fail('no twitter:description (it must be set per page, not inherited)');
  } else if (twitterDescription !== ogDescription) {
    fail('twitter:description differs from og:description');
  }
  if (ogImage && !twitterImage) {
    fail('og:image is set but twitter:image is missing');
  }
}

if (problems.length > 0) {
  console.warn(
    [
      '',
      '┌─────────────────────────────────────────────────────────────────┐',
      '│  SEO METADATA GUARD WARNING (scripts/check-seo-metadata.js)     │',
      '└─────────────────────────────────────────────────────────────────┘',
      '',
      ...problems,
      '',
      '→ Titles: max 60 chars, absolute (no brand suffix) and contain',
      '  "Bangladesh" unless the page is a documented exception above.',
      '→ Descriptions: max 155 chars, no placeholder text.',
      '→ twitter:title/description must equal og:title/description.',
      '',
    ].join('\n')
  );
  process.exit(1);
}

console.log(
  `check-seo-metadata: OK — ${checked} Quick Look / blog page(s): titles ≤ ${MAX_TITLE} chars, no brand suffix outside the ${Object.keys(
    TITLE_SUFFIX_EXCEPTIONS
  ).length} documented exception(s), descriptions ≤ ${MAX_DESCRIPTION} chars, Bangladesh in every title outside the ${Object.keys(
    TITLE_BANGLADESH_EXCEPTIONS
  ).length} documented title exception(s), twitter tags mirror og.`
);
