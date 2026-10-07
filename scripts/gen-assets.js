/**
 * Brand asset generator — the header wordmark.
 * Source art: D:/website bd/elements/logo.png (4000x4000 opaque)
 * Output:     public/logo/logo.png (wordmark on its plate, 128px tall)
 *
 * The source is a fully OPAQUE near-black plate with light lettering; the
 * old pipeline's .trim() could only strip outer TRANSPARENT margins, so it
 * cut unequal plate bands (text ended up glued to the bottom edge). The
 * header sits on --color-bg-dark (#0a0f1e), which makes the plate invisible
 * there — so the visible text rendered ~9px below the nav/search/icons
 * even though the <Image> box was perfectly centered.
 *
 * The text is re-anchored to the plate's VERTICAL CENTER: the canvas stays
 * 232x128 and the text keeps its size — only the plate bands above/below
 * the text are rebalanced.
 *
 * NOTE: the favicon/apple-icon set has its own generator,
 * scripts/gen-favicons.js, because the falcon source needs its opaque
 * near-black plate keyed out before cropping (plain .trim() cannot).
 * Run: node scripts/gen-assets.js && node scripts/gen-favicons.js
 */
const sharp = require('sharp');
const fs = require('fs');

const LOGO_SRC = 'D:/website bd/elements/logo.png';
const FALCON_SRC = 'D:/website bd/elements/falcon icon.png';

// Trim transparent margins, then letterbox to an EXACT size x size canvas.
// fit:'contain' is a single operation — sharp runs extend AFTER resize in
// its fixed pipeline, so a separate .extend() pads the ALREADY-resized
// image and yields oversized output (that bug once put a 148x48 PNG inside
// a 48x48 ICO entry and broke the Turbopack build).
// (Kept for reference; icon generation now lives in scripts/gen-favicons.js,
// which additionally keys out the falcon source's opaque plate.)
async function trimmedSquare(src, size) {
  const t = await sharp(src).trim().toBuffer();
  return sharp(t)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function buildIco(falconSrc, out) {
  const sizes = [16, 32, 48];
  const pngs = [];
  for (const s of sizes) pngs.push({ s, buf: await trimmedSquare(falconSrc, s) });
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  const blobs = [];
  let offset = 6 + 16 * pngs.length;
  for (const { s, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(s, 0);             // width
    e.writeUInt8(s, 1);             // height
    e.writeUInt8(0, 2);             // palette
    e.writeUInt8(0, 3);             // reserved
    e.writeUInt16LE(1, 4);          // planes
    e.writeUInt16LE(32, 6);         // bpp
    e.writeUInt32LE(buf.length, 8); // data size
    e.writeUInt32LE(offset, 12);    // data offset
    entries.push(e);
    blobs.push(buf);
    offset += buf.length;
  }
  fs.writeFileSync(out, Buffer.concat([header, ...entries, ...blobs]));
}

(async () => {
  // 1) Key out the opaque near-black plate via border flood-fill (same
  // technique as gen-favicons.js) so the TEXT becomes a true cutout.
  //    2) Resize the text to 128px tall (the old pipeline's wordmark
  // height — text size and therefore header rendering are unchanged).
  //    3) Letterbox back onto a 232x128 plate-colored canvas: the text is
  // re-anchored to the vertical center (equal plate bands above/below),
  // so the visible letters line up with the nav/search/icons that the
  // header row already centers geometrically.
  const PLATE = { r: 8, g: 9, b: 9 }; // sampled plate color of the source
  const PLATE_TOLERANCE = 28; // RGB distance treated as "still the plate"
  const CANVAS = { w: 232, h: 128 };
  const srcBuf = await sharp(LOGO_SRC)
    .resize(2048, 2048, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = srcBuf;
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
    if (!bg[p] && dist(idx(x, y)) <= PLATE_TOLERANCE) {
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
  const keyed = Buffer.alloc(w * h * 4);
  let minX = w, maxX = -1, minY = h, maxY = -1;
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

  // Crop the keyed layer to the text's true bounding box (the keyed layer
  // is still the full square source canvas), then resize it to fit the
  // 232x128 canvas by WIDTH (the old wordmark's text spanned the full
  // canvas width: 232px wide, ~74px tall at 128px canvas height — this
  // keeps the rendered text size identical), then re-letterbox onto the
  // plate.
  const text = await sharp(keyed, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
    .resize(CANVAS.w, CANVAS.h, { fit: 'inside' })
    .png()
    .toBuffer();
  const tm = await sharp(text).metadata();
  await sharp({
    create: {
      width: CANVAS.w,
      height: CANVAS.h,
      channels: 4,
      background: { r: PLATE.r, g: PLATE.g, b: PLATE.b, alpha: 1 },
    },
  })
    .composite([{ input: text, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile('public/logo/logo.png');
  console.log(
    `public/logo/logo.png ${CANVAS.w}x${CANVAS.h} (text ${tm.width}x${tm.height} centered) ${(fs.statSync('public/logo/logo.png').size / 1024).toFixed(1)}KB`
  );
  console.log('favicons: run node scripts/gen-favicons.js');
})().catch((e) => { console.error(e); process.exit(1); });
