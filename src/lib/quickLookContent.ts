import type { Product } from './products';

/**
 * Long-form SEO content for Quick Look product pages (/quick-look/[slug]).
 *
 * Rules (SEO/AEO brief):
 * - Every spec, number and claim comes from src/lib/products.ts for that
 *   product — never invented values. Estimates are stated AS estimates.
 * - One entry per product slug; products without an entry simply render
 *   nothing extra (see getQuickLookContent).
 * - Content is intentionally unique per product (no shared template with
 *   names swapped) so pages avoid doorway-duplicate content.
 * - The FAQ array here is the SINGLE source for both the visible FAQ cards
 *   and the FAQPage JSON-LD (schema always mirrors visible text exactly).
 * - Internal links use real routes only: /shop/[slug], sibling
 *   /quick-look/[slug], and /posts/[slug|id] for blog posts.
 * - Heading hierarchy: the page's product title stays the only H1; this
 *   section starts at H2.
 */

export type QuickLookLink = {
  label: string;
  description: string;
  href: string;
};

export type QuickLookGuide = {
  /** Bare product name, for headings built in the component. */
  productName: string;
  /** H2 — starts with the product name + "Price in Bangladesh" per brief. */
  heading: string;
  /** Direct-answer lead: what it is, its (estimated) BD price, who it's for. */
  lead: string;
  overview: string[];
  priceSection: { heading: string; paragraphs: string[] };
  features: { heading: string; title: string; body: string }[];
  buyers: { heading: string; should: string[]; skip: string[] };
  pros: { heading: string; pros: string[]; cons: string[] };
  /** H2 — buying tips for Bangladesh. */
  buyingTips: { heading: string; paragraphs: string[] };
  faqs: { question: string; answer: string }[];
  /** "Keep exploring" internal-link cards. */
  links: QuickLookLink[];
};

const guides: Record<string, QuickLookGuide> = {
  'honor-robot-phone': {
    productName: 'HONOR Robot Phone',
    heading: 'HONOR Robot Phone Price in Bangladesh: Full Guide',
    lead:
      'The HONOR Robot Phone is a camera-first flagship smartphone with a motorized 4-axis gimbal camera, a 7060mAh battery and 120W charging, estimated at ৳179,999 in Bangladesh — aimed at creators who shoot video seriously and want a phone that also flips into a mini production rig.',
    overview: [
      'The HONOR Robot Phone is HONOR\'s most unusual flagship: a 6.31-inch compact flagship built around a 200MP main camera that sits on a motorized 4-axis gimbal. Announced for August 2026 with the Snapdragon 8 Elite Gen 5 chip, 12GB of RAM and up to 1TB of storage, it is not yet officially launched in Bangladesh — so every price you see locally is an estimate or a grey-market quote, not an official one.',
      'On this page you\'ll find what the phone is expected to cost here, what the specs mean in daily use, who it genuinely suits, and what to check before paying — written from the confirmed spec sheet, with anything unconfirmed labeled as such.',
    ],
    priceSection: {
      heading: 'HONOR Robot Phone price in Bangladesh',
      paragraphs: [
        'There is no official HONOR Bangladesh price for the Robot Phone yet. Our estimated price is ৳179,999 for the 12GB/512GB model, based on its China launch price of ¥9,999 (about $1,480). Because the phone hasn\'t officially launched in Bangladesh, actual grey-market prices may vary — early imports typically carry a markup over direct conversion, and stock arrives first through unofficial channels.',
        'Variant differences matter: the phone is listed with 512GB and 1TB storage options, and launching variants are likely to price differently once official retail begins. Until HONOR Bangladesh announces pricing, treat ৳179,999 as a planning number, not a store quote — and expect the official price to differ once VAT and import duties are applied. Buy Now stays disabled for this phone for exactly that reason; the site never asks you to order against an unconfirmed price.',
      ],
    },
    features: [
      {
        heading: 'Key features explained',
        title: 'A compact display that doesn\'t behave compact',
        body:
          'The 6.31-inch LTPO OLED (1.5K, 2640 x 1216) with a 120Hz refresh rate is the small-screen end of the flagship market, protected by HONOR NanoCrystal Shield. If you found recent Ultra-class phones too wide to use one-handed, this panel is the answer — but check the size in person if you film a lot, since a smaller canvas also means less room for framing tools.',
      },
      {
        heading: 'Key features explained',
        title: 'Snapdragon 8 Elite Gen 5 with 12GB RAM',
        body:
          'Performance comes from the Snapdragon 8 Elite Gen 5 paired with 12GB of LPDDR5X RAM and Android 16 with MagicOS 10. Storage is 512GB or 1TB — and there\'s no expandable storage, so pick the tier matching how much 8K footage you expect to keep. For gaming, editing and AI features like Magic Portal and AI Translation, this is top-tier silicon.',
      },
      {
        heading: 'Key features explained',
        title: 'The gimbal camera system',
        body:
          'The headliner: a 200MP main sensor on a motorized 4-axis gimbal, plus a 200MP periscope telephoto and a 50MP ultra-wide, with a 50MP front camera. The gimbal physically steadies the sensor for video, assisted by OIS and laser autofocus, and the phone records 8K video with AI motion sensing capture. In plain terms: handheld walking shots come out dramatically smoother than a phone whose stabilization is software-only.',
      },
      {
        heading: 'Key features explained',
        title: 'Battery and charging',
        body:
          'A 7060mAh battery is large for a 6.31-inch phone, and 120W wired SuperCharge refills it fast — a full session is roughly a coffee-break task. Wireless charging is supported but only up to 66W, which is one of the phone\'s trade-offs. No charger-included caveats are listed in the spec sheet; treat accessory-region details as something to confirm at purchase.',
      },
    ],
    buyers: {
      heading: 'Who should buy the HONOR Robot Phone — and who should skip it',
      should: [
        'Video-first creators: the motorized gimbal plus 8K recording genuinely replaces part of a handheld rig for social and documentary work.',
        'Photographers who want reach: a 200MP periscope telephoto and 50MP ultra-wide make this one of the most flexible rear systems on paper.',
        'Buyers who prefer compact flagships: at 6.31 inches and 248g with an aluminum frame, it\'s a small-screen flagship with big-screen hardware.',
        'Heavy users: 7060mAh battery and 12GB RAM cover long shoot days without a power bank.',
      ],
      skip: [
        'Anyone who needs an official Bangladesh warranty now: the phone isn\'t officially launched here, so early imports means grey-market risk.',
        'Headphone-jack holdouts and microSD users: no 3.5mm jack and no expandable storage — both are confirmed limitations.',
        'Wireless-charging-first buyers: 66W wireless is capped well below the 120W wired speed, unusual for this class.',
        'Buyers on a strict budget: at an estimated ৳179,999 this competes directly with officially available Ultra-class flagships that carry warranty support.',
      ],
    },
    pros: {
      heading: 'Pros and cons of the HONOR Robot Phone',
      pros: [
        '200MP motorized 4-axis gimbal main camera — hardware stabilization, not software',
        '200MP periscope telephoto + 50MP ultra-wide for a versatile rear trio',
        '7060mAh battery with 120W wired SuperCharge',
        'Compact 6.31-inch 120Hz LTPO OLED (1.5K)',
        'Snapdragon 8 Elite Gen 5, 12GB RAM, up to 1TB storage',
        'Full AI suite: Magic Portal, AI Subtitle, AI Translation, AI Noise Cancellation',
      ],
      cons: [
        'Not officially launched in Bangladesh — early units are grey-market, warranty uncertain',
        'No expandable storage (confirmed limitation)',
        'No 3.5mm headphone jack (confirmed limitation)',
        'Wireless charging capped at 66W against 120W wired',
        'Price is estimated until HONOR Bangladesh announces official retail pricing',
      ],
    },
    buyingTips: {
      heading: 'Buying the HONOR Robot Phone in Bangladesh: what to know',
      paragraphs: [
        'Since the phone is officially "upcoming," your choices today are waiting for the official launch or buying an early grey import. Grey units usually undercut eventual official pricing in availability but arrive without official warranty support — for a phone with a motorized gimbal mechanism, that\'s a meaningful risk: precision moving parts are exactly what you want covered by warranty. If you pre-order through HONOR Bangladesh\'s official launch, price and warranty obligations should be confirmed in writing before paying.',
        'For any import, verify the IMEI before paying: dial *#06# to display the IMEI and check it against the box and the invoice. Check whether the unit is PTA-approved for Bangladesh networks (a non-approved set can be blocked from mobile network use after registered use), confirm the storage variant you\'re paying for matches the box label, and test the gimbal camera, all three rear lenses and the 120W charger on the spot. Buy from sellers who offer a return window; the market for not-yet-officially-launched flagships is exactly where misrepresented units show up.',
      ],
    },
    faqs: [
      {
        question: 'What is the HONOR Robot Phone price in Bangladesh?',
        answer:
          'The estimated price is ৳179,999 for the 12GB/512GB model, based on the China launch price of ¥9,999 (about $1,480). There is no official Bangladesh price yet, and actual grey-market prices may vary.',
      },
      {
        question: 'Is the HONOR Robot Phone officially available in Bangladesh?',
        answer:
          'Not yet. The phone carries an "upcoming" status — it has been announced (release date Aug 2026) but has no official HONOR Bangladesh launch or price, so currently available units are unofficial imports.',
      },
      {
        question: 'How good is the HONOR Robot Phone battery?',
        answer:
          'It packs a 7060mAh battery with 120W wired SuperCharge, which is large capacity for its 6.31-inch size. Wireless charging is supported but limited to 66W.',
      },
      {
        question: 'What cameras does the HONOR Robot Phone have?',
        answer:
          'A 200MP main camera on a motorized 4-axis gimbal, a 200MP periscope telephoto and a 50MP ultra-wide on the back, plus a 50MP front camera — with OIS, laser autofocus and 8K video recording.',
      },
      {
        question: 'Is the HONOR Robot Phone worth buying?',
        answer:
          'For video-first creators who want hardware gimbal stabilization in a compact flagship, it is one of the most interesting phones of 2026 — but in Bangladesh it only makes sense once you accept grey-market risk and an estimated (not official) price. If you want official warranty today, officially available flagships like the Samsung Galaxy S26 Ultra are the safer buy.',
      },
    ],
    links: [
      {
        label: 'Samsung Galaxy S26 Ultra — Quick Look',
        description: 'Officially available 200MP flagship rival with S Pen',
        href: '/quick-look/samsung-galaxy-s26-ultra',
      },
      {
        label: 'Apple iPhone 17 Pro Max — Quick Look',
        description: 'Compact-ish premium rival with official BD pricing',
        href: '/quick-look/apple-iphone-17-pro-max',
      },
      {
        label: 'Vivo X300 Pro — Quick Look',
        description: 'Camera-first flagship officially sold in Bangladesh',
        href: '/quick-look/vivo-x300-pro',
      },
      {
        label: 'iPhone Duo: Apple\'s First Foldable — Price, Specs & Release',
        description: 'Blog: where the ultra-premium market is heading',
        href: '/posts/iphone-duo-foldable-price-specs-release',
      },
      {
        label: 'Windows vs Mac: Which Laptop OS Should You Choose in 2026?',
        description: 'Blog: if the Robot Phone budget is stretching to laptops too',
        href: '/posts/windows-vs-mac-which-laptop-os-to-choose',
      },
    ],
  },
};

/** Long-form guide for a product slug, or undefined when none is written yet. */
export function getQuickLookContent(slug: string): QuickLookGuide | undefined {
  return guides[slug];
}
