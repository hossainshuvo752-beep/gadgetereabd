/**
 * Default social-share (OG/Twitter) card generator.
 * Source: public/logo/logo.png (wordmark on its opaque near-black plate)
 * Output: public/og/jupiterbd-default-20261010.png (1200x630)
 *
 * Why the plate is keyed out first: the header wordmark ships on a #080909
 * plate so it reads correctly on the header's dark background. The card's
 * background is --color-bg-dark (#0a0f1e), a different dark — compositing
 * the plate directly would leave a visible rectangle behind the text. So
 * the plate is keyed to transparency with the same border flood-fill used
 * by gen-assets.js / gen-favicons.js, the keyed layer is cropped to the
 * text's true bounding box, then composited centered on the brand canvas.
 *
 * The output filename carries a date because og:image is cached hard by
 * social platforms — regenerated artwork must land on a NEW URL. If the
 * artwork changes, bump the filename and DEFAULT_OG_IMAGE in
 * src/lib/siteOgImage.ts together.
 *
 * Run: node scripts/gen-og-image.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = 'public/logo/logo.png';
const OUT = 'public/og/jupiterbd-default-20261010.png';

// Brand background — mirrors --color-bg-dark in src/app/globals.css.
const BG = { r: 0x0a, g: 0x0f, b: 0x1e };
// Wordmark plate color (sampled) + tolerance, same values as gen-assets.js.
const PLATE = { r: 8, g: 9, b: 9 };
const TOLERANCE = 28;
const CARD = { w: 1200, h: 630 };
// Wordmark width on the card; height follows the source aspect ratio.
const LOGO_WIDTH = 620;

(async () => {
  // 1) Load the wordmark raw and flood-fill the plate from the borders.
  const { data, info } = await sharp(SRC)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const idx = (x, y) => (y * w + x) * c;
  const dist = (i) =>
    Math.max(
      Math.abs(data[i] - PLATE.r),
      Math.abs(data[i + 1] - PLATE.g),
      Math.abs(data[i + 2] - PLATE.b)
    );

  const bg = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let sp = 0;
  const push = (x, y) => {
    const p = y * w + x;
    if (!bg[p] && dist(idx(x, y)) <= TOLERANCE) {
      bg[p] = 1;
      stack[sp++] = p;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (sp > 0) {
    const p = stack[--sp];
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }

  // 2) Build the keyed layer and track the text bounding box in one pass.
  const keyed = Buffer.alloc(w * h * 4);
  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;
  for (let p = 0; p < w * h; p++) {
    keyed[p * 4] = data[p * c];
    keyed[p * 4 + 1] = data[p * c + 1];
    keyed[p * 4 + 2] = data[p * c + 2];
    keyed[p * 4 + 3] = bg[p] ? 0 : 255;
    if (!bg[p]) {
      const x = p % w;
      const y = (p / w) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) throw new Error('Wordmark plate keying removed the entire image');

  // 3) Crop to the text, scale by WIDTH (height follows the aspect ratio so
  //    the wordmark never distorts), then center it on the brand canvas.
  const text = await sharp(keyed, { raw: { width: w, height: h, channels: 4 } })
    .extract({
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    })
    .resize({ width: LOGO_WIDTH, fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer();
  const meta = await sharp(text).metadata();

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await sharp({
    create: {
      width: CARD.w,
      height: CARD.h,
      channels: 3,
      background: BG,
    },
  })
    .composite([{ input: text, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  console.log(
    `${OUT} ${CARD.w}x${CARD.h} (wordmark ${meta.width}x${meta.height} centered) ${(fs.statSync(OUT).size / 1024).toFixed(1)}KB`
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
