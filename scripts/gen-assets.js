/**
 * Brand asset generator — the header wordmark.
 * Source art: D:/website bd/elements/logo.png (4000x4000 RGBA)
 * Output:     public/logo/logo.png (trimmed wordmark, 128px tall)
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
  // Wordmark: trim transparent margins, keep aspect ratio, 128px tall.
  const lt = await sharp(LOGO_SRC).trim().toBuffer();
  const lm = await sharp(lt).metadata();
  await sharp(lt)
    .resize({ height: 128 })
    .png({ compressionLevel: 9 })
    .toFile('public/logo/logo.png');
  console.log(`public/logo/logo.png ${Math.round((128 * lm.width) / lm.height)}x128 ${(fs.statSync('public/logo/logo.png').size / 1024).toFixed(1)}KB`);
  console.log('favicons: run node scripts/gen-favicons.js');
})().catch((e) => { console.error(e); process.exit(1); });
