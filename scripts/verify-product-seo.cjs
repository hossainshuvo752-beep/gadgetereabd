/* Live verification probe for slug URLs + metadata + JSON-LD. */
const fs = require('fs');
const BASE = 'http://localhost:3472';

function envVal(name) {
  const line = fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : '';
}

(async () => {
  const pages = [
    '/shop/samsung-galaxy-s26-ultra',
    '/shop/honor-robot-phone',
    '/quick-look/apple-iphone-17-pro-max',
    '/quick-look/honor-robot-phone',
  ];
  for (const path of pages) {
    const res = await fetch(BASE + path);
    const html = await res.text();
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '(none)';
    const desc =
      html.match(/<meta name="description" content="([^"]*)"/)?.[1] ??
      html.match(/<meta name="description" class="next-head" content="([^"]*)"/)?.[1] ??
      '(none)';
    const ogImage = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1] ?? '(none)';
    const ld = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    )?.[1];
    let productLd = null;
    if (ld) {
      try {
        const parsed = JSON.parse(ld);
        productLd = parsed['@type'] === 'Product' ? parsed : null;
      } catch {
        productLd = { error: 'INVALID JSON-LD' };
      }
    }
    console.log('='.repeat(70));
    console.log(path, '->', res.status);
    console.log('TITLE: ' + title);
    console.log('DESC:  ' + desc);
    console.log('OGIMG: ' + ogImage);
    if (productLd) {
      console.log(
        'LD: ' +
          JSON.stringify({
            type: productLd['@type'],
            name: productLd.name,
            image: productLd.image,
            url: productLd.url,
            hasOffers: !!productLd.offers,
            offerPrice: productLd.offers?.price,
          }),
      );
    } else {
      console.log('LD: (no Product JSON-LD found)');
    }
  }

  // Old numeric URL must 404 gracefully.
  const old404 = await fetch(BASE + '/shop/3');
  console.log('='.repeat(70));
  console.log('/shop/3 ->', old404.status, old404.status === 404 ? '(graceful 404 OK)' : '(UNEXPECTED)');

  // Sitemap must list slug URLs.
  const sm = await (await fetch(BASE + '/sitemap.xml')).text();
  const numericShop = sm.match(/\/shop\/\d+</g);
  const slugShop = (sm.match(/\/shop\/[a-z0-9-]+</g) || []).length;
  console.log('sitemap: slug /shop/ URLs =', slugShop, '| numeric =', numericShop ? numericShop.length : 0);
})();
