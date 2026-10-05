/**
 * One-shot regenerator for the Jupiter BD favicon set.
 *
 * The falcon source ("D:/website bd/elements/falcon icon.png") is a fully
 * OPAQUE 4000x4000 PNG: the bird sits on a near-black (rgb(8,9,9)) plate,
 * and stray near-opaque specks span the whole canvas, so sharp's .trim()
 * (alpha- or corner-color-keyed) can neither see the plate nor remove it.
 * The old pipeline therefore letterboxed the BIRD+PLATE, and every icon
 * rendered as a small bird inside a black square (bird measured only
 * ~52% of the canvas). Here we:
 *   1. flood-fill the border-connected plate color to transparent,
 *   2. crop to the bird's true bounding box (plus a 2% feather),
 *   3. letterbox onto a size x size canvas at FILL=95% of its width
 *      (~2.5% transparent margin per side, per design spec).
 * Outputs: src/app/icon.png (256), src/app/apple-icon.png (180),
 *          src/app/favicon.ico (16/32/48 PNG-in-ICO).
 * Run: node scripts/gen-favicons.js
 */
const sharp = require('sharp');
const fs = require('fs');

const FALCON_SRC = 'D:/website bd/elements/falcon icon.png';
const PLATE = { r: 8, g: 9, b: 9 }; // sampled uniform corner color of the plate
const PLATE_TOLERANCE = 28; // RGB distance treated as "still the plate"
const FILL = 0.99; // bird's longer side spans 99% of the canvas (~0.5%
// margin/side on the long axis, ~2.5%/side on the short axis after the
// bird's 1992:2098 aspect — measured visible fill lands at ~95/90%).
// Work at 2048px for the mask math (4000px flood fill is needlessly slow).
const WORK = 2048;

async function falconCutout() {
  const { data, info } = await sharp(FALCON_SRC)
    .resize(WORK, WORK, { fit: 'inside' })
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
  // Flood fill from all borders over plate-colored pixels.
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
  // Build RGBA with the plate keyed out; track the bird's bounding box.
  const out = Buffer.alloc(w * h * 4);
  let minX = w, maxX = -1, minY = h, maxY = -1;
  for (let p = 0; p < w * h; p++) {
    const isBg = bg[p];
    out[p * 4] = data[p * c];
    out[p * 4 + 1] = data[p * c + 1];
    out[p * 4 + 2] = data[p * c + 2];
    out[p * 4 + 3] = isBg ? 0 : 255;
    if (!isBg) {
      const x = p % w;
      const y = (p / w) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  // No feather padding here: anti-aliased bird-edge pixels differ from the
  // plate color, so the flood fill already keeps them inside the bbox — any
  // feather would only add dead transparent margins and shrink the fill.
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).extract({
    left: minX,
    top: minY,
    width: bw,
    height: bh,
  });
}

// Letterbox the cutout onto an exact size x size canvas: the bird's LONGER
// side spans FILL of the canvas, centered, transparent margins elsewhere.
// (The bird is slightly taller than wide, so height ~FILL, width ~FILL*0.95.)
async function falconSquare(cutout, size) {
  const m = await cutout.clone().metadata();
  const target = Math.round(size * FILL);
  const resized = await cutout
    .resize(target, target, { fit: 'inside' })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function buildIco(cutout, out) {
  const sizes = [16, 32, 48];
  const pngs = [];
  for (const s of sizes) pngs.push({ s, buf: await falconSquare(cutout, s) });
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  const blobs = [];
  let offset = 6 + 16 * pngs.length;
  for (const { s, buf } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(s, 0); // width
    e.writeUInt8(s, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // planes
    e.writeUInt16LE(32, 6); // bpp
    e.writeUInt32LE(buf.length, 8); // data size
    e.writeUInt32LE(offset, 12); // data offset
    entries.push(e);
    blobs.push(buf);
    offset += buf.length;
  }
  fs.writeFileSync(out, Buffer.concat([header, ...entries, ...blobs]));
}

(async () => {
  const cutout = await falconCutout();
  await fs.promises.writeFile(
    'src/app/icon.png',
    await falconSquare(cutout, 256)
  );
  await fs.promises.writeFile(
    'src/app/apple-icon.png',
    await falconSquare(cutout, 180)
  );
  await buildIco(cutout, 'src/app/favicon.ico');
  for (const f of ['src/app/icon.png', 'src/app/apple-icon.png', 'src/app/favicon.ico']) {
    console.log(`${f} ${(fs.statSync(f).size / 1024).toFixed(1)}KB`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
