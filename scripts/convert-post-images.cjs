/**
 * One-off: convert blog post source images (D:\bd web blog image\...) to
 * WebP for the two new posts, using the SAME pipeline settings as the
 * product-image pass (sharp, quality 82 stepping down only if a file
 * exceeds ~200KB, floor 64; resize max 1600px on the long side, no upscale).
 *
 * Output naming follows the owner's per-post image mapping:
 *   posts/windows-vs-mac-which-laptop-os-to-choose/
 *     hero.webp, windows-use-case.webp, mac-use-case.webp
 *   posts/best-laptop-under-50000-in-bangladesh/
 *     hero.webp, hp-250-g9.webp, lenovo-ideapad-slim-3.webp,
 *     dell-vostro-15-3510.webp, asus-vivobook-15.webp, acer-aspire-3.webp
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC_ROOT = 'D:/bd web blog image';
const OUT_ROOT = path.join(process.cwd(), 'public', 'images', 'posts');

const JOBS = [
  {
    folder: 'Windows vs Mac Which Laptop OS to Choose',
    outDir: 'windows-vs-mac-which-laptop-os-to-choose',
    files: {
      'hero image.jfif': 'hero.webp',
      'Supporting image 1 (Windows use-case).jfif': 'windows-use-case.webp',
      'Supporting image 2 (Mac use-case).jfif': 'mac-use-case.webp',
    },
  },
  {
    folder: 'Best Laptop Under ৳50,000',
    outDir: 'best-laptop-under-50000-in-bangladesh',
    files: {
      'hero image.jfif': 'hero.webp',
      'HP 250 G9.jfif': 'hp-250-g9.webp',
      'Lenovo IdeaPad Slim 3.jfif': 'lenovo-ideapad-slim-3.webp',
      'Dell Vostro 15 3510.jfif': 'dell-vostro-15-3510.webp',
      'ASUS VivoBook 15.jfif': 'asus-vivobook-15.webp',
      'Acer Aspire 3.jfif': 'acer-aspire-3.webp',
    },
  },
];

const IMG_RE = /\.(jpe?g|jfif|png|webp|avif|gif)$/i;

async function convert(src, out) {
  let q = 82;
  let chosen = null;
  for (;;) {
    const { data, info } = await sharp(src)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
    chosen = { data, q, w: info.width, h: info.height };
    const kb = data.length / 1024;
    if (kb <= 200 || q <= 64) break;
    q -= 6;
  }
  fs.writeFileSync(out, chosen.data);
  return chosen;
}

(async () => {
  let totalIn = 0;
  let totalOut = 0;
  for (const job of JOBS) {
    const srcDir = path.join(SRC_ROOT, job.folder);
    const outDir = path.join(OUT_ROOT, job.outDir);
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`\n=== ${job.folder} -> public/images/posts/${job.outDir}/ ===`);
    for (const [srcName, outName] of Object.entries(job.files)) {
      const src = path.join(srcDir, srcName);
      if (!fs.existsSync(src)) {
        console.log(`  MISSING SOURCE: ${srcName}`);
        continue;
      }
      const out = path.join(outDir, outName);
      const inKB = fs.statSync(src).size / 1024;
      const r = await convert(src, out);
      const outKB = fs.statSync(out).size / 1024;
      totalIn += inKB;
      totalOut += outKB;
      console.log(
        `  ${srcName} -> ${outName}  ${Math.round(inKB)}KB -> ${Math.round(outKB)}KB  (q${r.q}, ${r.w}x${r.h})`
      );
    }
    // Report any unconverted files in the folder so nothing is silently skipped.
    for (const f of fs.readdirSync(srcDir)) {
      if (IMG_RE.test(f) && !Object.keys(job.files).includes(f)) {
        console.log(`  NOT MAPPED (left unconverted): ${f}`);
      }
    }
  }
  console.log(
    `\nTOTAL: ${Math.round(totalIn)}KB -> ${Math.round(totalOut)}KB across both posts`
  );
})();
