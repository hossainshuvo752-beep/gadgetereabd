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
  {
    folder: 'Best Laptop for Programming Students',
    outDir: 'best-laptop-for-programming-students',
    files: {
      'hero image.jfif': 'hero.webp',
      'Lenovo ThinkPad E14.jfif': 'lenovo-thinkpad-e14.webp',
      'ASUS Vivobook Go 15.jfif': 'asus-vivobook-go-15.webp',
      'HP Pavilion 15.jfif': 'hp-pavilion-15.webp',
      'Acer Aspire Go 15.jfif': 'acer-aspire-go-15.webp',
      'Apple MacBook Air.jfif': 'apple-macbook-air.webp',
    },
  },
  {
    // Filenames ARE the model mapping (owner named each file by fan model).
    folder: 'Best Bladeless Tower Fan 2026 Dreame vs Dyson vs Dreo Compared',
    outDir: 'best-bladeless-tower-fan-2026',
    files: {
      'hero image.jpg': 'hero.webp',
      'Dreo Pilot Max S.jpg': 'dreo-pilot-max-s.webp',
      'Dreame MF10.jpg': 'dreame-mf10.webp',
      'Dyson AM07.jpg': 'dyson-am07.webp',
    },
  },
  {
    // img 2-5 are Hibbent product/use-case shots (no model names in filenames).
    folder: 'Best Faucet Extender for Kitchen Sink 2026 Hibbent 1080° Review',
    outDir: 'best-faucet-extender-hibbent-1080',
    files: {
      'hero.jpg': 'hero.webp',
      'img 2.jpg': 'use-case-1.webp',
      'img 3.jpg': 'use-case-2.webp',
      'img 4.jpg': 'use-case-3.webp',
      'img 5.jpg': 'use-case-4.webp',
    },
  },
  {
    folder: 'Dyson CameraJet $500 Toothbrush With a Camera — Worth It',
    outDir: 'dyson-camerajet-toothbrush-worth-it',
    files: {
      'hero image.jpg': 'hero.webp',
    },
  },
  {
    folder: 'ios 27',
    outDir: 'ios-27-features-release-date',
    files: {
      'hero image.jpg': 'hero.webp',
      'image 2.webp': 'ios27-2.webp',
      'image 3.webp': 'ios27-3.webp',
      'image 4.jpg': 'ios27-4.webp',
    },
  },
  {
    folder: "iPhone Duo Apple's First Foldable — Price, Specs & Release",
    outDir: 'iphone-duo-foldable-price-specs-release',
    files: {
      'hero image.jpg': 'hero.webp',
      'img 2.jpg': 'iphone-duo-2.webp',
      'img 3.jpg': 'iphone-duo-3.webp',
      'img 4.jpg': 'iphone-duo-4.webp',
      'img 5.jpg': 'iphone-duo-5.webp',
    },
  },
  {
    // No dedicated hero file — img1 doubles as the hero.
    folder: "Overhead Camera Mount Review — JINRAIKO's 360° Arm for Content Creators",
    outDir: 'overhead-camera-mount-jinraiko-review',
    files: {
      "img1 Overhead Camera Mount Review — JINRAIKO's 360° Arm for Content Creators.jpg": 'hero.webp',
      "img2 Overhead Camera Mount Review — JINRAIKO's 360° Arm for Content Creators.jpg": 'jinraiko-2.webp',
      "img3 Overhead Camera Mount Review — JINRAIKO's 360° Arm for Content Creators.jpg": 'jinraiko-3.webp',
      "img4 Overhead Camera Mount Review — JINRAIKO's 360° Arm for Content Creators.jpg": 'jinraiko-4.webp',
    },
  },
];

// Optional CLI filter — convert only jobs whose outDir contains the arg
// (e.g. `node scripts/convert-post-images.cjs programming`), so adding a
// post doesn't re-convert every previous folder.
const filter = process.argv[2] || '';
const JOBS_TO_RUN = JOBS.filter((j) => j.outDir.includes(filter));

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
  for (const job of JOBS_TO_RUN) {
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
    `\nTOTAL: ${Math.round(totalIn)}KB -> ${Math.round(totalOut)}KB`
  );
})();
