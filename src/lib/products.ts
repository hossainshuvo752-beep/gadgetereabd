export interface Product {
  id: number;
  title: string;
  /** OPTIONAL short product name people actually search ("PS5 Slim Disc",
   *  "Soundcore R50i", "Lenovo IdeaCentre AIO 27"). Used ONLY in the
   *  Quick Look meta title/description and the search-facing FAQ entries —
   *  never in the visible H1 or product name, which stay `title`. Absent =
   *  the SEO builders fall back to `title`. */
  seoName?: string;
  category: string;
  /** Top-level Shop filter category — must match a node in the tree in
   *  src/lib/categories.ts (Mobile, Tablet, PC, ...). */
  topCategory: string;
  /** Sub-category within topCategory — normally the product's brand
   *  matching a sub in src/lib/categories.ts ('Other' catch-all exists
   *  under Gadget Accessories for products no named sub fits; a product
   *  whose brand isn't exposed as a sub-filter stays reachable via its
   *  top-level category). */
  subCategory: string;
  imageAlt: string;
  /** OPTIONAL hand-written alt that wins over the generated "name + type"
   *  alt for this product's MAIN/hero image. Leave unset on most products —
   *  the shared helper (imageAlt.ts) generates "<title> <category>"; set
   *  only when a specific product needs different wording. Gallery and
   *  color images always use the generated alt (variant/position based). */
  altOverride?: string;
  /** Real product photo — hero/main image (WebP, optimized). When present,
   *  all surfaces render it instead of the imageAlt placeholder box; the
   *  alt text remains the accessibility label. One shared copy per image,
   *  served from public/images/products/<slug>/ and used by Shop, Quick
   *  Look, and every other surface. */
  heroImage?: string;
  /** Gallery angles for detail pages (hero first). Products without real
   *  photos keep the placeholder gallery. */
  gallery?: string[];
  /** Per-storage-variant pricing. Each `label` must match a storage option
   *  derived from specSheet.performance.storage (the '/'-split segments) —
   *  or, for single-storage products whose purchasable options are another
   *  dimension (e.g. DJI Standard vs Adventure Combo), that dimension's
   *  label. Selecting a variant on the detail page shows THAT variant's
   *  price everywhere (price box, cart, checkout) via variantPrice().
   *  Absent = the product's flat price applies to every option. */
  variants?: {
    label: string;
    price: number;
    oldPrice?: number;
    priceEstimated?: boolean;
  }[];
  /** Non-color purchasable option dimension (e.g. DJI "Standard" vs
   *  "Adventure Combo" bundles) rendered as variant buttons on the detail
   *  page. Use this instead of stuffing bundle names into buildDesign.colors
   *  (which is a visual spec, not a purchasable choice). variantPrice()
   *  resolves these labels the same way as storage labels. */
  purchaseOptions?: string[];
  /** Per-image hand-written alt text for GALLERY images, keyed by image src
   *  (path). The shared helper (imageAlt.ts) uses the override for exactly
   *  that image and generates the standard text for every other image — set
   *  only when a gallery needs description beyond "photo N of M" (e.g. the
   *  HomeView renders). Never hardcode alt text in a component. */
  galleryAlts?: { src: string; alt: string }[];
  /** One short visible line rendered directly under a product's gallery —
   *  used by the HomeView renders to say so on the page. Absent = nothing
   *  rendered (default for every other product). */
  galleryNote?: string;
  /** Replaces the price box's standard subtitle on the detail page (the
   *  "(Official Price in Bangladesh)" / "Estimated market reference…"
   *  line). Set only for products with no Bangladesh price at all, where the
   *  standard wording would mislead; the price NUMBER still comes from
   *  PriceTag. Absent = the existing wording (unchanged for every product). */
  priceDisplayNote?: string;
  /** How the price number may be DESCRIBED in metadata (Quick Look
   *  description). Declared per product because "official" must never be
   *  assumed: the price note decides. 'official' = the brand's own Bangladesh
   *  price or an official reseller/distributor listing, 'unofficial' = grey
   *  channel with no brand warranty, 'retail' = a normal shop price with no
   *  official-channel claim, 'on-sale' = a genuine discount below the regular
   *  price, 'estimated' = our own figure, 'not-launched' = no Bangladesh
   *  price exists. Absent = the description prints the number with no status
   *  word at all. */
  priceStatus?:
    | 'official'
    | 'unofficial'
    | 'retail'
    | 'estimated'
    | 'on-sale'
    | 'not-launched';
  /** Emit NO Product JSON-LD for this product. Product pages still emit the
   *  other schema they carry (FAQPage). Set only when the product has no
   *  offers, rating or review to mark up, so the Product node cannot trigger
   *  a Search Console error. Absent = Product schema exactly as today. */
  noProductSchema?: boolean;
  /** Omit the Offer's `availability` value while keeping the offer itself.
   *  For products sold only through unofficial channels, where no source
   *  confirms stock. Absent = availability InStock, exactly as today. */
  omitSchemaAvailability?: boolean;
  /** Social-share (OG/Twitter) image URL for this product's pages when the
   *  square hero is the wrong card shape. Absent = heroImage, as today. */
  ogImage?: string;
  /** Color→image mapping for products whose photos are organized by color.
   *  Each `color` must match a buildDesign.colors entry exactly; while that
   *  color is selected on the detail page, `images` REPLACES the flat
   *  gallery (swatch switching). Absent = no color-specific photos exist →
   *  the detail page renders NO color selector at all (nothing meaningful
   *  to switch), and the flat gallery/heroImage is used for every color. */
  colorImages?: { color: string; images: string[] }[];
  /** VERSIONS of the SAME model (Global / China) — a THIRD variant
   *  dimension that sits ABOVE color and storage. One product page still
   *  covers exactly one model; the versions live inside it. Selecting a
   *  version swaps its gallery, its colors, its priced storage options and
   *  the spec values that differ (through specOverrides). Products without
   *  this field render no Version row and behave exactly as before.
   *  The BASE fields (gallery, colorImages, specSheet, price) always describe
   *  the DEFAULT version, so every non-version-aware consumer (cards, Shop,
   *  JSON-LD, search) keeps showing the default version unchanged. */
  versions?: {
    /** Stable id used in the data and by spec overrides, e.g. 'global'. */
    id: string;
    /** Button label, e.g. "Global Version". */
    label: string;
    /** Short label used in variant/cart strings, e.g. "Global". */
    shortLabel: string;
    /** Color→images for THIS version (same rules as colorImages). */
    colorImages: { color: string; images: string[] }[];
    /** Priced RAM/storage options for THIS version — a label here is the
     *  only way that option can be selected, so an unpriced combination is
     *  never shown. */
    variants: {
      label: string;
      price: number;
      oldPrice?: number;
      priceEstimated?: boolean;
    }[];
    /** Replaces the price box's status line while THIS version is selected —
     *  for a page whose versions are sold on DIFFERENT channels (an official
     *  Bangladesh unit and a grey import). Absent = the product-level
     *  priceDisplayNote, then the standard wording, exactly as before. */
    priceDisplayNote?: string;
    /** Spec fields that DIFFER for this version, merged over specSheet by
     *  specSheetOf(). Omitted fields keep the base (default-version) value. */
    specOverrides?: {
      basicInfo?: Partial<Product['specSheet']['basicInfo']>;
      display?: Partial<Product['specSheet']['display']>;
      performance?: Partial<Product['specSheet']['performance']>;
      cameraSystem?: Partial<Product['specSheet']['cameraSystem']>;
      batteryCharging?: Partial<Product['specSheet']['batteryCharging']>;
      buildDesign?: Partial<Product['specSheet']['buildDesign']>;
      connectivity?: Partial<Product['specSheet']['connectivity']>;
      sensors?: string[];
      notableLimitations?: string[];
    };
  }[];
  /** id of the version that renders by default (server-rendered state, the
   *  price above, JSON-LD and metadata all describe it). */
  defaultVersion?: string;
  /** SIMULATED popularity metric — dummy values, NOT real analytics.
   *  Replace with real view-tracking data when a backend exists. Drives
   *  the default most-viewed-first sort on the Homepage grid and the
   *  Shop listing (sorted within the active category filter). */
  views: number;
  /** Catalog entry date (ISO YYYY-MM-DD). Seeded products mirror their
   *  release date; when adding a new product, use the day it's added —
   *  the New Arrivals page sorts on this automatically (newest first).
   *  No manual "add to new arrivals" step exists or should exist. */
  dateAdded: string;
  /** True only for products with a genuine current discount
   *  (price < oldPrice). The Deals page reads this flag from the shared
   *  data — it keeps no product list of its own. Optional; omitted means
   *  not on deal. */
  isDeal?: boolean;
  price: number | null;
  /** Pre-discount price; when set together with `price`, the product is on deal. */
  oldPrice: number | null;
  /** True when `price` is an estimate (no confirmed Bangladesh price found). */
  priceEstimated: boolean;
  /** How this product is sold. 'buy' = normal cart/checkout flow (Buy Now +
   *  Add to Cart; Pre-Order while upcoming). 'free-order' = an order REQUEST
   *  with no payment and no cart (a single Free Order button) — used for
   *  products whose price is only an estimate, because nobody should be
   *  charged a guess. Optional: purchaseModeOf() derives it from
   *  priceEstimated when unset, so estimated-price products are free-order
   *  automatically. Set it explicitly only to override that default. */
  purchaseMode?: PurchaseMode;
  /** 'available' = officially released/available in Bangladesh; 'upcoming' =
   *  announced but not yet officially available (pre-order stage). */
  status: 'available' | 'upcoming';
  /** Price source/context — tooltip everywhere, visible text on detail pages. */
  priceNote?: string;
  /** ISO date (YYYY-MM-DD) on which this product's price was last checked
   *  against its sources. When set, the Quick Look page renders one visible
   *  "Prices checked: <date>" line beside the price; products without the
   *  field render nothing (no placeholder, no invented date). */
  priceCheckedAt?: string;
  specSheet: {
    basicInfo: {
      model: string;
      brand: string;
      releaseDate: string;
    };
    display: {
      type: string;
      size: string;
      resolution: string;
      refreshRate: string;
      protection: string;
    };
    performance: {
      processor: string;
      ram: string;
      storage: string;
      os: string;
    };
    cameraSystem: {
      rear: string;
      front: string;
      features: string[];
    };
    batteryCharging: {
      capacity: string;
      charging: string;
    };
    buildDesign: {
      dimensions: string;
      weight: string;
      materials: string;
      colors: string[];
    };
    connectivity: {
      network: string;
      bluetooth: string;
      ports: string[];
    };
    sensors: string[];
    aiFeatures: string[];
    notableLimitations: string[];
  };
}

/**
 * THE single source of truth for products. Everything reads from this one
 * array by id (Shop grid, ShopTeaser, New Arrivals, Deals, Quick Look listing
 * + /quick-look/[slug] detail via slugify(title), /shop/[id], search, cart,
 * checkout) — adding a product here automatically makes it appear everywhere.
 * No page or component may keep its own product list.
 *
 * Prices researched Sep 2026 from official BD channels + major retailers
 * (samsung.com/bd, vivo.com/bd, Tecno BD, Infinix BD, Star Tech, Sumash Tech,
 * Global Brand, Gadget & Gear, MobileDokan). priceEstimated=true marks the one
 * product with no confirmed BD price (HONOR — China-only launch). Buy Now is
 * only offered when the price is confirmed; estimated-price products keep
 * Coming Soon / Notify Me so users never "order" a guess. Products with
 * status 'upcoming' (announced but not officially available in Bangladesh)
 * show Pre-Order instead of Buy Now on every surface.
 */
export const products: Product[] = [
  {
    id: 1,
    title: 'HONOR Robot Phone',
    seoName: 'HONOR Robot Phone',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'HONOR',
    imageAlt: 'HONOR Robot Phone',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/honor-robot-phone/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/honor-robot-phone/1.webp',
    gallery: [
            "/images/products/honor-robot-phone/1.webp",
            "/images/products/honor-robot-phone/2.webp",
            "/images/products/honor-robot-phone/3.webp",
            "/images/products/honor-robot-phone/4.webp",
            "/images/products/honor-robot-phone/5.webp"
    ],
    views: 5200,
    dateAdded: '2026-08-15',
    price: 179999,
    priceStatus: 'estimated',
    oldPrice: null,
    priceEstimated: true,
    status: 'upcoming',
    priceNote:
      'Estimated based on the China launch price of ¥9,999 (~$1,480) for the 12GB/512GB model. Not yet officially launched in Bangladesh — actual grey-market price may vary.',
    specSheet: {
      basicInfo: {
        model: 'HONOR Robot Phone',
        brand: 'HONOR',
        releaseDate: 'Aug 2026',
      },
      display: {
        type: 'LTPO OLED (1.5K)',
        size: '6.31 inches',
        resolution: '2640 x 1216 pixels',
        refreshRate: '120Hz',
        protection: 'HONOR NanoCrystal Shield',
      },
      performance: {
        processor: 'Snapdragon 8 Elite Gen 5',
        ram: '12GB LPDDR5X',
        storage: '512GB/1TB',
        os: 'Android 16, MagicOS 10',
      },
      cameraSystem: {
        rear: '200MP gimbal main (motorized 4-axis) + 200MP periscope telephoto + 50MP ultra-wide',
        front: '50MP',
        features: [
          'Motorized 4-axis gimbal camera',
          'OIS',
          'Laser autofocus',
          '8K video recording',
          'AI motion sensing capture',
        ],
      },
      batteryCharging: {
        capacity: '7060mAh',
        charging: '120W wired SuperCharge',
      },
      buildDesign: {
        dimensions: 'Approx. 9.6 mm thick (full dimensions TBD)',
        weight: '248g',
        materials: 'Aluminum frame, glass back',
        colors: ['Black', 'Silver', 'Green'],
      },
      connectivity: {
        network: '5G, 4G LTE',
        bluetooth: '5.3',
        ports: ['USB-C 3.2', 'No headphone jack'],
      },
      sensors: [
        'Fingerprint (under display, optical)',
        'Accelerometer',
        'Gyroscope',
        'Proximity',
        'Compass',
        'Color spectrum',
      ],
      aiFeatures: [
        'Magic Portal',
        'AI Subtitle',
        'AI Translation',
        'AI Noise Cancellation',
        'AI Photo Expansion',
        'AI Portrait',
      ],
      notableLimitations: [
        'No expandable storage',
        'No 3.5mm headphone jack',
        'Wireless charging only up to 66W',
      ],
    },
  },
  {
    id: 2,
    title: 'Samsung Galaxy S26 Ultra',
    seoName: 'Samsung Galaxy S26 Ultra',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Samsung',
    imageAlt: 'Samsung Galaxy S26 Ultra',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/samsung-galaxy-s26-ultra/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/samsung-galaxy-s26-ultra/1.webp',
    gallery: [
            "/images/products/samsung-galaxy-s26-ultra/1.webp",
            "/images/products/samsung-galaxy-s26-ultra/2.webp",
            "/images/products/samsung-galaxy-s26-ultra/3.webp",
            "/images/products/samsung-galaxy-s26-ultra/4.webp",
            "/images/products/samsung-galaxy-s26-ultra/5.webp",
            "/images/products/samsung-galaxy-s26-ultra/6.webp"
    ],
    views: 4800,
    dateAdded: '2026-02-20',
    price: 199999,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Official Samsung Bangladesh price for 12GB/256GB (the 12GB/512GB variant is ৳228,999).',
    specSheet: {
      basicInfo: {
        model: 'Galaxy S26 Ultra',
        brand: 'Samsung',
        releaseDate: 'Feb 2026',
      },
      display: {
        type: 'Dynamic AMOLED 2X',
        size: '6.9 inches',
        resolution: 'QHD+ (3120 x 1440 pixels)',
        refreshRate: '120Hz',
        protection: 'Gorilla Armor 2',
      },
      performance: {
        processor: 'Snapdragon 8 Elite / Exynos 2600',
        ram: '12GB LPDDR5X',
        storage: '256GB/512GB/1TB',
        os: 'Android 16, One UI (7 years of updates)',
      },
      cameraSystem: {
        rear: '200MP (main) + periscope telephoto (10x optical zoom)',
        front: '12MP',
        features: [
          'OIS',
          'Laser autofocus',
          '8K video recording',
          '10x optical zoom',
          'AI photo editing',
        ],
      },
      batteryCharging: {
        capacity: '5000mAh',
        charging: '45W wired, wireless charging supported',
      },
      buildDesign: {
        dimensions: 'TBD (not yet officially confirmed)',
        weight: 'TBD',
        materials: 'Armor Aluminum frame, Gorilla Armor 2 glass, IP68',
        colors: ['Titanium Black', 'Titanium Gray', 'Titanium Silver'],
      },
      connectivity: {
        network: '5G, 4G LTE',
        bluetooth: '5.4',
        ports: ['USB-C 3.2', 'No headphone jack'],
      },
      sensors: [
        'Fingerprint (under display, ultrasonic)',
        'Accelerometer',
        'Gyroscope',
        'Proximity',
        'Compass',
        'Barometer',
      ],
      aiFeatures: [
        'Galaxy AI',
        'Live Translate',
        'Circle to Search',
        'Note Assist',
        'Photo Assist',
      ],
      notableLimitations: [
        'No expandable storage',
        'No 3.5mm headphone jack',
        'Exynos 2600 variant in some regions (Snapdragon 8 Elite in others)',
      ],
    },
  },
  {
    id: 3,
    title: 'Apple iPhone 17 Pro Max',
    seoName: 'iPhone 17 Pro Max',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Apple',
    imageAlt: 'Apple iPhone 17 Pro Max',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/apple-iphone-17-pro-max/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/apple-iphone-17-pro-max/1.webp',
    gallery: [
            "/images/products/apple-iphone-17-pro-max/1.webp",
            "/images/products/apple-iphone-17-pro-max/2.webp",
            "/images/products/apple-iphone-17-pro-max/3.webp",
            "/images/products/apple-iphone-17-pro-max/4.webp",
            "/images/products/apple-iphone-17-pro-max/5.webp",
            "/images/products/apple-iphone-17-pro-max/6.webp",
            "/images/products/apple-iphone-17-pro-max/7.webp",
            "/images/products/apple-iphone-17-pro-max/8.webp"
    ],
    views: 6100,
    dateAdded: '2025-09-19',
    price: 209900,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote: 'Official Apple price at Star Tech Bangladesh for the 256GB model.',
    specSheet: {
      basicInfo: {
        model: 'iPhone 17 Pro Max',
        brand: 'Apple',
        releaseDate: 'Sep 2025',
      },
      display: {
        type: 'Super Retina XDR OLED (LTPO ProMotion)',
        size: '6.9 inches',
        resolution: '2868 x 1320 pixels',
        refreshRate: '120Hz (ProMotion)',
        protection: 'Ceramic Shield 2',
      },
      performance: {
        processor: 'Apple A19 Pro (6-core CPU, 6-core GPU)',
        ram: '12GB',
        storage: '256GB/512GB/1TB/2TB',
        os: 'iOS 26',
      },
      cameraSystem: {
        rear: '48MP (main) + 48MP (ultra-wide) + 48MP (4x telephoto)',
        front: '18MP Center Stage',
        features: [
          'Sensor-shift OIS',
          '4K 120fps Dolby Vision video',
          'ProRes recording',
          'Photographic Styles',
        ],
      },
      batteryCharging: {
        capacity: '4823mAh',
        charging: '40W wired, 25W MagSafe wireless',
      },
      buildDesign: {
        dimensions: '163.4 x 78.0 x 8.75 mm',
        weight: '233g',
        materials: 'Aluminum unibody, Ceramic Shield 2, IP68',
        colors: ['Cosmic Orange', 'Deep Blue', 'Silver'],
      },
      connectivity: {
        network: '5G, 4G LTE',
        bluetooth: '6.0',
        ports: ['USB-C (USB 3)', 'No headphone jack'],
      },
      sensors: [
        'Face ID',
        'Accelerometer',
        'Gyroscope',
        'Proximity',
        'Compass',
        'Barometer',
      ],
      aiFeatures: [
        'Apple Intelligence',
        'Writing Tools',
        'Clean Up (Photos)',
        'Visual Intelligence',
        'Live Translation',
      ],
      notableLimitations: [
        'No expandable storage',
        'No 3.5mm headphone jack',
        'Slower wired charging than Android flagships',
      ],
    },
  },
  {
    id: 4,
    title: 'Vivo X300 Pro',
    seoName: 'Vivo X300 Pro',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Vivo',
    imageAlt: 'Vivo X300 Pro',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/vivo-x300-pro/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/vivo-x300-pro/1.webp',
    gallery: [
            "/images/products/vivo-x300-pro/1.webp",
            "/images/products/vivo-x300-pro/2.webp",
            "/images/products/vivo-x300-pro/3.webp",
            "/images/products/vivo-x300-pro/4.webp",
            "/images/products/vivo-x300-pro/5.webp"
    ],
    views: 2200,
    dateAdded: '2025-10-30',
    price: 149999,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Official vivo Bangladesh price for 16GB/512GB (+VAT). Unofficial 12GB/256GB units run around ৳110,000.',
    specSheet: {
      basicInfo: {
        model: 'X300 Pro',
        brand: 'Vivo',
        releaseDate: 'Oct 2025',
      },
      display: {
        type: 'LTPO AMOLED (up to 4500 nits peak)',
        size: '6.78 inches',
        resolution: '1260 x 2800 pixels',
        refreshRate: '120Hz',
        protection: 'Armor glass',
      },
      performance: {
        processor: 'MediaTek Dimensity 9500 (3nm)',
        ram: '12GB/16GB LPDDR5X',
        storage: '256GB/512GB/1TB UFS 4.1',
        os: 'Android 16, OriginOS 6 (China) / Funtouch OS 15 (global)',
      },
      cameraSystem: {
        rear: '50MP Sony LYT-828 (main) + 50MP (ultra-wide) + 200MP Zeiss APO periscope telephoto',
        front: '50MP',
        features: [
          'Zeiss optics',
          'OIS',
          'Laser autofocus',
          '8K video recording',
          'Dolby Vision HDR',
        ],
      },
      batteryCharging: {
        capacity: '6510mAh silicon-carbon',
        charging: '90W wired, 40W wireless',
      },
      buildDesign: {
        dimensions: 'TBD',
        weight: 'TBD',
        materials: 'Aluminum frame, glass back, IP68/IP69',
        colors: ['Phantom Black', 'Mist Blue', 'Dune Brown', 'Cloud White'],
      },
      connectivity: {
        network: '5G, 4G LTE',
        bluetooth: '5.4',
        ports: ['USB-C 3.2', 'No headphone jack'],
      },
      sensors: [
        'Fingerprint (under display)',
        'Accelerometer',
        'Gyroscope',
        'Proximity',
        'Compass',
      ],
      aiFeatures: [
        'AI Erase',
        'AI Image Enhancement',
        'Live Translation',
        'Circle to Search support',
      ],
      notableLimitations: [
        'No expandable storage',
        'No 3.5mm headphone jack',
        'China (OriginOS) and global (Funtouch) software differ',
      ],
    },
  },
  {
    id: 5,
    title: 'Tecno Camon 40 Pro',
    seoName: 'Tecno Camon 40 Pro',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Tecno',
    imageAlt: 'Tecno Camon 40 Pro',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/tecno-camon-40-pro/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/tecno-camon-40-pro/1.webp',
    gallery: [
            "/images/products/tecno-camon-40-pro/1.webp",
            "/images/products/tecno-camon-40-pro/2.webp",
            "/images/products/tecno-camon-40-pro/3.webp"
    ],
    colorImages: [
      { color: 'Emerald Lake Green', images: ['/images/products/tecno-camon-40-pro/emerald-lake-green/1.webp'] },
      { color: 'Galaxy Black', images: ['/images/products/tecno-camon-40-pro/galaxy-black/1.webp'] },
      { color: 'Sandy Titanium', images: ['/images/products/tecno-camon-40-pro/sandy-titanium/1.webp'] },
    ],
    views: 1500,
    dateAdded: '2025-05-28',
    price: 27999,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    /** TWO sources minimum, one an official channel; verified 22 Oct 2026.
     *  TECNO's own Bangladesh product page returned no readable price, but
     *  Sumash Tech lists this exact model as "Official" at ৳27,999 with a
     *  1-year warranty, and Gadget & Gear and MRP both list ৳27,999 too.
     *  The ৳27,999 is the 4G model's price — the 5G model is ৳34,999. */
    priceNote:
      'Official TECNO Bangladesh price for the 8GB/256GB 4G model: ৳27,999 (Sumash Tech "Official", Gadget & Gear, MRP — checked 22 Oct 2026). Tecno\'s listed price; confirm VAT with the seller.',
    priceCheckedAt: '2026-10-22',
    /** 4G model only. Every value below was read on TECNO's own spec sheet
     *  (camon-40-pro) on 22 Oct 2026, except the weight, which TECNO does not
     *  publish and three Bangladesh retailers list as 178g. The 5G model is a
     *  DIFFERENT phone (Dimensity 7300 Ultimate, 144Hz) and gets its own page
     *  — none of its values belong here. TECNO's spec sheet lists no glass
     *  protection or Bluetooth version for the 4G model, so those rows are
     *  left empty (rendered omitted) rather than filled from the 5G sheet. */
    specSheet: {
      basicInfo: {
        model: 'Camon 40 Pro (4G)',
        brand: 'Tecno',
        releaseDate: 'May 2025',
      },
      display: {
        type: 'AMOLED, curved',
        size: '6.78 inches',
        resolution: '1080 x 2436 pixels',
        refreshRate: '120Hz',
        protection: '',
      },
      performance: {
        processor: 'MediaTek Helio G100 Ultimate',
        ram: '8GB + 8GB extended',
        storage: '256GB',
        os: 'Android 15',
      },
      cameraSystem: {
        rear: '50MP Sony LYT-700C (main, OIS) + 8MP ultra-wide',
        front: '50MP autofocus',
        features: [
          'OIS on the main camera',
          'Dual flash and flicker sensor',
          'One-Tap FlashSnap',
          'AutoSnap',
          'AI Eraser 2.0',
        ],
      },
      batteryCharging: {
        capacity: '5200mAh',
        charging: '45W Super Charge',
      },
      buildDesign: {
        dimensions: '164.44 x 74.32 x 7.31 mm',
        weight: '178g (Bangladesh retailer listings)',
        materials: 'IP68/IP69 dust and water resistance',
        colors: ['Emerald Lake Green', 'Galaxy Black', 'Sandy Titanium'],
      },
      connectivity: {
        network: '4G LTE (2G/3G/4G — no 5G)',
        bluetooth: '',
        ports: ['USB-C', 'OTG'],
      },
      sensors: [
        'Geomagnetic sensor',
        'Accelerometer and gyroscope (A+G)',
        'Ambient light and distance sensor',
        'Infrared remote control',
        'Electronic compass',
      ],
      aiFeatures: [
        'Ask Ella assistant',
        'AI Eraser 2.0',
        'AI Image Extender',
        'AI Perfect Face',
        'AI Call Translation and Summary',
      ],
      notableLimitations: [
        '4G only — the 5G model has a faster Dimensity 7300 chip',
        'No telephoto camera — the second lens is an 8MP ultra-wide',
        'Single memory option: 8GB (+8GB extended) with 256GB',
      ],
    },
  },
  {
    id: 6,
    title: 'Infinix Note 60 Pro',
    seoName: 'Infinix Note 60 Pro',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Infinix',
    imageAlt: 'Infinix Note 60 Pro',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/infinix-note-60-pro/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/infinix-note-60-pro/1.webp',
    gallery: [
            "/images/products/infinix-note-60-pro/1.webp",
            "/images/products/infinix-note-60-pro/2.webp",
            "/images/products/infinix-note-60-pro/3.webp",
            "/images/products/infinix-note-60-pro/4.webp",
            "/images/products/infinix-note-60-pro/5.webp",
            "/images/products/infinix-note-60-pro/6.webp"
    ],
    colorImages: [
      { color: 'Mist Titanium', images: ['/images/products/infinix-note-60-pro/mist-titanium/1.webp'] },
      { color: 'Frost Silver', images: ['/images/products/infinix-note-60-pro/frost-silver/1.webp'] },
      { color: 'Torino Black', images: ['/images/products/infinix-note-60-pro/torino-black/1.webp'] },
      { color: 'Solar Orange', images: ['/images/products/infinix-note-60-pro/solar-orange/1.webp'] },
    ],
    views: 1900,
    dateAdded: '2026-02-10',
    isDeal: true,
    price: 45499,
    priceStatus: 'on-sale',
    oldPrice: 49999,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Current Pickaboo promo price of ৳45,499 (official Infinix Bangladesh price ৳49,999) for 8GB(+8 extended)/256GB — on deal.',
    specSheet: {
      basicInfo: {
        model: 'Note 60 Pro',
        brand: 'Infinix',
        releaseDate: 'Feb 2026',
      },
      display: {
        type: 'AMOLED (up to 4500 nits peak)',
        size: '6.78 inches',
        resolution: '1208 x 2644 pixels',
        refreshRate: '144Hz',
        protection: 'Gorilla Glass 7i',
      },
      performance: {
        processor: 'Snapdragon 7s Gen 4 (4nm)',
        ram: '8GB/12GB',
        storage: '256GB',
        os: 'Android 16, XOS 16',
      },
      cameraSystem: {
        rear: '50MP (main, OIS) + 8MP (ultra-wide)',
        front: '32MP',
        features: [
          'OIS',
          '4K video recording',
          'AI camera modes',
        ],
      },
      batteryCharging: {
        capacity: '6500mAh',
        charging: '90W wired, 30W wireless',
      },
      buildDesign: {
        dimensions: 'TBD',
        weight: 'TBD',
        materials: 'Gorilla Glass 7i front, aluminum frame, IP64',
        colors: ['Mist Titanium', 'Frost Silver', 'Torino Black', 'Solar Orange'],
      },
      connectivity: {
        network: '5G, 4G LTE',
        bluetooth: '5.4',
        ports: ['USB-C'],
      },
      sensors: [
        'Fingerprint (under display)',
        'Accelerometer',
        'Gyroscope',
        'Proximity',
        'Compass',
      ],
      aiFeatures: [
        'Folax AI assistant',
        'AI Eraser',
        'AI Writing Assistant',
      ],
      notableLimitations: [
        'Only IP64 water resistance',
        'Limited availability outside select markets',
      ],
    },
  },
  {
    id: 7,
    title: 'Samsung Galaxy Z Fold7 256GB',
    seoName: 'Samsung Galaxy Z Fold7',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Samsung',
    imageAlt: 'Samsung Galaxy Z Fold7',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/samsung-galaxy-z-fold7-256gb/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/samsung-galaxy-z-fold7-256gb/1.webp',
    gallery: [
            "/images/products/samsung-galaxy-z-fold7-256gb/1.webp",
            "/images/products/samsung-galaxy-z-fold7-256gb/2.webp",
            "/images/products/samsung-galaxy-z-fold7-256gb/3.webp",
            "/images/products/samsung-galaxy-z-fold7-256gb/4.webp",
            "/images/products/samsung-galaxy-z-fold7-256gb/5.webp"
    ],
    views: 2600,
    dateAdded: '2025-07-25',
    price: 154999,
    priceStatus: 'unofficial',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Current market price at Sumash Tech for 12GB/256GB — sold via unofficial channels (no official Samsung BD launch), so no brand warranty.',
    specSheet: {
      basicInfo: {
        model: 'Galaxy Z Fold7 (256GB)',
        brand: 'Samsung',
        releaseDate: 'Jul 2025',
      },
      display: {
        type: 'Foldable Dynamic AMOLED 2X',
        size: '8.0 inches main (unfolded), 6.5 inches cover',
        resolution: '2184 x 1968 (main, QXGA+), FHD+ cover',
        refreshRate: '120Hz (both screens)',
        protection: 'Gorilla Glass Ceramic 2 (cover)',
      },
      performance: {
        processor: 'Snapdragon 8 Elite for Galaxy',
        ram: '12GB LPDDR5X',
        storage: '256GB UFS 4.0',
        os: 'Android 16, One UI 8',
      },
      cameraSystem: {
        rear: '200MP (main) + 12MP (ultra-wide) + 10MP (3x telephoto)',
        front: '10MP (cover), under-display (main screen)',
        features: [
          'OIS',
          'Galaxy AI photo editing',
          '8K video recording',
          'Dual Capture',
        ],
      },
      batteryCharging: {
        capacity: '4400mAh',
        charging: '25W wired, wireless charging supported',
      },
      buildDesign: {
        dimensions: 'Approx. 8.9mm folded / 4.2mm unfolded',
        weight: '215g',
        materials: 'Aluminum frame, Gorilla Glass Ceramic 2, IP48',
        colors: ['Blue Shadow', 'Silver Shadow', 'Jetblack'],
      },
      connectivity: {
        network: '5G, 4G LTE',
        bluetooth: '5.4',
        ports: ['USB-C', 'No headphone jack'],
      },
      sensors: [
        'Fingerprint (side-mounted)',
        'Accelerometer',
        'Gyroscope',
        'Proximity',
        'Compass',
      ],
      aiFeatures: [
        'Galaxy AI',
        'Circle to Search',
        'Live Translate',
        'Note Assist',
        'Generative photo edit',
      ],
      notableLimitations: [
        'IP48 — splash resistant only, not full submersion',
        'No S Pen support',
        '25W charging is slow for the class',
      ],
    },
  },
  {
    id: 8,
    title: 'Sony WH-1000XM5 Wireless Headphones',
    seoName: 'Sony WH-1000XM5',
    category: 'Accessories',
    topCategory: 'Gadget Accessories',
    subCategory: 'Sound',
    imageAlt: 'Sony WH-1000XM5 headphones',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/sony-wh-1000xm5-wireless-headphones/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/sony-wh-1000xm5-wireless-headphones/1.webp',
    gallery: [
            "/images/products/sony-wh-1000xm5-wireless-headphones/1.webp",
            "/images/products/sony-wh-1000xm5-wireless-headphones/2.webp",
            "/images/products/sony-wh-1000xm5-wireless-headphones/3.webp",
            "/images/products/sony-wh-1000xm5-wireless-headphones/4.webp",
            "/images/products/sony-wh-1000xm5-wireless-headphones/5.webp"
    ],
    views: 3100,
    dateAdded: '2022-05-20',
    isDeal: true,
    price: 29990,
    priceStatus: 'on-sale',
    oldPrice: 32990,
    priceEstimated: false,
    status: 'available',
    priceNote: 'Star Tech offer price (regular ৳33,090). Gadget & Gear lists it at ৳27,999.',
    specSheet: {
      basicInfo: {
        model: 'WH-1000XM5',
        brand: 'Sony',
        releaseDate: 'May 2022',
      },
      display: {
        type: 'None',
        size: 'N/A',
        resolution: 'N/A',
        refreshRate: 'N/A',
        protection: 'N/A',
      },
      performance: {
        processor: 'Integrated Processor V1 + QN1 (dual noise-cancelling DSP)',
        ram: 'N/A',
        storage: 'N/A',
        os: 'N/A (Headphones Connect app optional)',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: 'Up to 30 hours (ANC on)',
        charging: 'USB-C; 3-min quick charge for about 3 hours playback',
      },
      buildDesign: {
        dimensions: 'Over-ear, lays flat (does not fold)',
        weight: '250g',
        materials: 'Plastic frame, synthetic leather earpads',
        colors: ['Black', 'Platinum Silver', 'Midnight Blue', 'Smoky Pink'],
      },
      connectivity: {
        network: 'N/A (wireless only, no Wi-Fi)',
        bluetooth: '5.2 — multipoint (2 devices), LDAC support',
        ports: ['USB-C (charging)', '3.5mm (wired listening)'],
      },
      sensors: ['Wear detection'],
      aiFeatures: [
        'Adaptive Sound Control',
        'Speak-to-Chat',
        'DSEE Extreme AI upscaling',
        'AI noise reduction for calls',
      ],
      notableLimitations: [
        'Does not fold (flat only) — bulkier to carry',
        'Multipoint is unavailable while using LDAC',
        'Soft carrying case only',
      ],
    },
  },
  {
    id: 9,
    title: 'PlayStation 5 Slim Disc Console',
    seoName: 'PS5 Slim Disc',
    category: 'Gaming',
    topCategory: 'Gadget Accessories',
    subCategory: 'Other',
    imageAlt: 'PlayStation 5 Slim disc console',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/playstation-5-slim-disc-console/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/playstation-5-slim-disc-console/1.webp',
    gallery: [
            "/images/products/playstation-5-slim-disc-console/1.webp",
            "/images/products/playstation-5-slim-disc-console/2.webp",
            "/images/products/playstation-5-slim-disc-console/3.webp",
            "/images/products/playstation-5-slim-disc-console/4.webp",
            "/images/products/playstation-5-slim-disc-console/5.webp",
            "/images/products/playstation-5-slim-disc-console/6.webp",
            "/images/products/playstation-5-slim-disc-console/7.webp",
            "/images/products/playstation-5-slim-disc-console/8.webp"
    ],
    views: 5400,
    dateAdded: '2023-11-10',
    isDeal: true,
    price: 100000,
    priceStatus: 'on-sale',
    oldPrice: 105000,
    priceEstimated: false,
    status: 'available',
    priceNote: 'Star Tech price for the 1TB disc edition (regular ৳105,000).',
    specSheet: {
      basicInfo: {
        model: 'PS5 Slim (Disc Edition, 1TB)',
        brand: 'Sony',
        releaseDate: 'Nov 2023',
      },
      display: {
        type: 'None (outputs to external TV/monitor)',
        size: 'N/A',
        resolution: 'Up to 4K 120Hz output (8K nominal support)',
        refreshRate: 'Up to 120Hz output',
        protection: 'N/A',
      },
      performance: {
        processor: 'AMD Zen 2 8-core CPU + RDNA 2 GPU (10.28 TFLOPs)',
        ram: '16GB GDDR6',
        storage: '1TB custom NVMe SSD (expandable via M.2 slot)',
        os: 'PlayStation 5 system software',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: 'N/A (mains powered)',
        charging: 'DualSense controller charges via USB-C',
      },
      buildDesign: {
        dimensions: 'Approx. 358 x 96 x 216 mm (vertical, with disc drive)',
        weight: 'Approx. 3.2 kg',
        materials: 'Two-tone white shell, matte black center',
        colors: ['White'],
      },
      connectivity: {
        network: 'Wi-Fi 6, Gigabit Ethernet',
        bluetooth: '5.1',
        ports: [
          'USB-C (front)',
          'USB-A x2',
          'HDMI 2.1',
          'Gigabit Ethernet',
          'Detachable UHD Blu-ray disc drive',
        ],
      },
      sensors: [],
      aiFeatures: [],
      notableLimitations: [
        'Large and heavy for TV-stand placement',
        '1TB storage fills fast — M.2 expansion recommended',
        'Requires HDMI 2.1 display for 4K 120Hz output',
      ],
    },
  },
  {
    id: 10,
    title: 'UGREEN USB-C Hub 5-in-1',
    seoName: 'UGREEN USB-C Hub 5-in-1',
    category: 'Accessories',
    topCategory: 'Gadget Accessories',
    subCategory: 'Cables & Adapters',
    imageAlt: 'UGREEN USB-C 5-in-1 hub',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/ugreen-usb-c-hub-5-in-1/ — the
     *  single shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/ugreen-usb-c-hub-5-in-1/1.webp',
    gallery: [
      '/images/products/ugreen-usb-c-hub-5-in-1/1.webp',
      '/images/products/ugreen-usb-c-hub-5-in-1/2.webp',
      '/images/products/ugreen-usb-c-hub-5-in-1/3.webp',
      '/images/products/ugreen-usb-c-hub-5-in-1/4.webp',
    ],
    views: 800,
    dateAdded: '2024-03-15',
    price: 3000,
    priceStatus: 'retail',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Global Brand BD price for the Ultra Slim 5-in-1 (CM418); comparable UGREEN 5-in-1 hubs run ৳2,650–৳3,500.',
    specSheet: {
      basicInfo: {
        model: 'USB-C Hub 5-in-1',
        brand: 'UGREEN',
        releaseDate: '2024',
      },
      display: {
        type: 'None',
        size: 'N/A',
        resolution: 'N/A',
        refreshRate: 'N/A',
        protection: 'N/A',
      },
      performance: {
        processor: 'N/A (bus-powered hub controller)',
        ram: 'N/A',
        storage: 'N/A',
        os: 'Driver-free on Windows, macOS, iPadOS, Android',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: 'N/A (bus-powered)',
        charging: 'Up to 100W USB-C Power Delivery pass-through',
      },
      buildDesign: {
        dimensions: 'Compact palm-size',
        weight: 'Approx. 60g',
        materials: 'Aluminum alloy shell',
        colors: ['Gray'],
      },
      connectivity: {
        network: 'N/A',
        bluetooth: 'N/A',
        ports: [
          'HDMI (4K @ 60Hz)',
          'USB-A 3.0 x3 (5Gbps)',
          'USB-C PD pass-through',
        ],
      },
      sensors: [],
      aiFeatures: [],
      notableLimitations: [
        'No Ethernet port on this 5-in-1 variant',
        'Single external display only',
        'Host charging speed may drop while PD pass-through is in use',
      ],
    },
  },
  {
    id: 11,
    title: 'AULA F75 Pro Wireless Mechanical Keyboard',
    seoName: 'AULA F75 Pro',
    category: 'Gaming',
    topCategory: 'Gadget Accessories',
    subCategory: 'Computer Accessories',
    imageAlt: 'AULA F75 Pro wireless keyboard',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/aula-f75-pro-wireless-mechanical-keyboard/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/aula-f75-pro-wireless-mechanical-keyboard/1.webp',
    gallery: [
            "/images/products/aula-f75-pro-wireless-mechanical-keyboard/1.webp",
            "/images/products/aula-f75-pro-wireless-mechanical-keyboard/2.webp",
            "/images/products/aula-f75-pro-wireless-mechanical-keyboard/3.webp",
            "/images/products/aula-f75-pro-wireless-mechanical-keyboard/4.webp",
            "/images/products/aula-f75-pro-wireless-mechanical-keyboard/5.webp"
    ],
    views: 1200,
    dateAdded: '2024-06-01',
    // No deal: the price note describes ordinary Bangladesh retail pricing,
    // so there is no regular price to discount from. Cards and /deals read
    // this flag + oldPrice, so both surfaces show the plain ৳5,200 price.
    price: 5200,
    priceStatus: 'retail',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Typical Bangladesh retail price (Creatus and others); the F75/F75 Pro line spans roughly ৳5,199–৳6,200 by switch variant.',
    specSheet: {
      basicInfo: {
        model: 'F75 Pro',
        brand: 'AULA',
        releaseDate: '2024',
      },
      display: {
        type: 'None',
        size: 'N/A',
        resolution: 'N/A',
        refreshRate: 'N/A',
        protection: 'N/A',
      },
      performance: {
        processor: 'N/A',
        ram: 'N/A',
        storage: 'N/A',
        os: 'N/A (plug and play)',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: 'Built-in rechargeable (tri-mode wireless use)',
        charging: 'USB-C charging',
      },
      buildDesign: {
        dimensions: '75% compact layout with media knob',
        weight: 'Approx. 950g',
        materials: 'PBT keycaps, gasket-mounted plate, hot-swappable switches',
        colors: ['Black', 'White'],
      },
      connectivity: {
        network: 'N/A',
        bluetooth: '5.0 (3-device memory)',
        ports: [
          'USB-C (wired mode / charging)',
          '2.4GHz USB-A receiver included',
        ],
      },
      sensors: [],
      aiFeatures: [],
      notableLimitations: [
        'Media knob is not remappable',
        'Hot-swap supports 3/5-pin mechanical switches only',
        'South-facing RGB can clash with some non-OEM switch designs',
      ],
    },
  },
  {
    id: 12,
    title: 'Samsung Galaxy Tab S10 Ultra',
    seoName: 'Galaxy Tab S10 Ultra',
    category: 'Tablets',
    topCategory: 'Tablet',
    subCategory: 'Samsung',
    imageAlt: 'Samsung Galaxy Tab S10 Ultra',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/samsung-galaxy-tab-s10-ultra/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/samsung-galaxy-tab-s10-ultra/1.webp',
    gallery: [
            "/images/products/samsung-galaxy-tab-s10-ultra/1.webp",
            "/images/products/samsung-galaxy-tab-s10-ultra/2.webp",
            "/images/products/samsung-galaxy-tab-s10-ultra/3.webp",
            "/images/products/samsung-galaxy-tab-s10-ultra/4.webp"
    ],
    views: 1400,
    dateAdded: '2024-10-05',
    price: 119999,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    /** Variant pricing: per-storage rows verified against Riointernational
     *  (wifi) and Star Tech (5G), Sep 2026. 512GB has no active BD listing.
     *  Base price mirrors the cheapest variant. */
    variants: [
      { label: '256GB', price: 119999 },
      { label: '512GB', price: 145999, priceEstimated: true },
    ],
    priceNote: 'Wi-Fi 256GB ৳119,999 (Riointernational, official BD). 5G 512GB ~৳145,999 (Star Tech listed ৳145,999-185,999 by config; estimated midpoint). 512GB Wi-Fi has no active BD listing — estimated +~৳26k over 256GB.',
    specSheet: {
      basicInfo: {
        model: 'Galaxy Tab S10 Ultra',
        brand: 'Samsung',
        releaseDate: 'Oct 2024',
      },
      display: {
        type: 'Dynamic AMOLED 2X',
        size: '14.6 inches',
        resolution: '2960 x 1848 pixels',
        refreshRate: '120Hz',
        protection: 'Anti-reflective coating',
      },
      performance: {
        processor: 'MediaTek Dimensity 9300+',
        ram: '12GB',
        storage: '256GB/512GB',
        os: 'Android 14, One UI 6.1',
      },
      cameraSystem: {
        rear: '13MP (main) + 8MP (ultra-wide)',
        front: '12MP + 12MP (ultra-wide)',
        features: ['S Pen included', 'Samsung DeX multitasking', '4K video recording'],
      },
      batteryCharging: {
        capacity: '11200mAh',
        charging: '45W wired',
      },
      buildDesign: {
        dimensions: '326.4 x 208.6 x 5.4 mm',
        weight: '718g',
        materials: 'Armor Aluminum frame, glass front',
        colors: ['Gray Platinum', 'Silver Blue'],
      },
      connectivity: {
        network: 'Wi-Fi 6E, optional 5G',
        bluetooth: '5.3',
        ports: ['USB-C 3.2', 'No headphone jack'],
      },
      sensors: ['Fingerprint (side-mounted)', 'Accelerometer', 'Gyroscope', 'Compass'],
      aiFeatures: ['Galaxy AI', 'Note Assist', 'Circle to Search', 'Sketch to Image'],
      notableLimitations: [
        'No headphone jack',
        'Keyboard cover sold separately',
        'Large size limits one-handed use',
      ],
    },
  },
  {
    id: 13,
    title: 'Apple iPad Air 11 (M3)',
    seoName: 'iPad Air 11 (M3)',
    category: 'Tablets',
    topCategory: 'Tablet',
    subCategory: 'Apple',
    imageAlt: 'Apple iPad Air 11 M3',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/apple-ipad-air-11-m3/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/apple-ipad-air-11-m3/1.webp',
    gallery: [
            "/images/products/apple-ipad-air-11-m3/1.webp",
            "/images/products/apple-ipad-air-11-m3/2.webp",
            "/images/products/apple-ipad-air-11-m3/3.webp",
            "/images/products/apple-ipad-air-11-m3/4.webp"
    ],
    colorImages: [
      { color: 'Blue', images: ['/images/products/apple-ipad-air-11-m3/blue/1.webp'] },
      { color: 'Purple', images: ['/images/products/apple-ipad-air-11-m3/purple/1.webp'] },
      { color: 'Space Gray', images: ['/images/products/apple-ipad-air-11-m3/space-gray/1.webp'] },
      { color: 'Starlight', images: ['/images/products/apple-ipad-air-11-m3/starlight/1.webp'] },
    ],
    views: 2000,
    dateAdded: '2025-03-12',
    price: 89999,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    /** Variant pricing: per-storage tiers from AppleGadgetsBD live listing,
     *  Sep 2026 (128GB Wi-Fi ৳89,999 … 1TB M2 ৳179,999). Base = cheapest. */
    variants: [
      { label: '128GB', price: 89999 },
      { label: '256GB', price: 100999 },
      { label: '512GB', price: 119999, priceEstimated: true },
      { label: '1TB', price: 179999 },
    ],
    priceNote: 'AppleGadgetsBD (official BD reseller): 128GB ৳89,999 · 256GB ৳100,999 · 1TB ৳179,999 (M2). 512GB currently out of stock there — estimated ৳119,999 between the 256GB and 1TB tiers. Cellular variants cost ~৳20k more.',
    specSheet: {
      basicInfo: {
        model: 'iPad Air 11 (M3)',
        brand: 'Apple',
        releaseDate: 'Mar 2025',
      },
      display: {
        type: 'Liquid Retina IPS LCD',
        size: '11 inches',
        resolution: '2360 x 1640 pixels',
        refreshRate: '60Hz',
        protection: 'Laminated, anti-reflective coating',
      },
      performance: {
        processor: 'Apple M3 (8-core CPU, 9-core GPU)',
        ram: '8GB',
        storage: '128GB/256GB/512GB/1TB',
        os: 'iPadOS 18',
      },
      cameraSystem: {
        rear: '12MP (wide)',
        front: '12MP Center Stage',
        features: ['Apple Pencil Pro support', 'Magic Keyboard support', '4K video recording'],
      },
      batteryCharging: {
        capacity: 'Up to 10 hours of web use (28.93 Wh)',
        charging: 'USB-C (20W+)',
      },
      buildDesign: {
        dimensions: '247.6 x 178.5 x 6.1 mm',
        weight: '462g',
        materials: 'Aluminum unibody',
        colors: ['Space Gray', 'Blue', 'Purple', 'Starlight'],
      },
      connectivity: {
        network: 'Wi-Fi 6E, optional 5G',
        bluetooth: '5.3',
        ports: ['USB-C (USB 2 speeds)', 'Smart Connector', 'No headphone jack'],
      },
      sensors: ['Touch ID (top button)', 'Accelerometer', 'Gyroscope', 'Barometer'],
      aiFeatures: ['Apple Intelligence', 'Writing Tools', 'Image Playground'],
      notableLimitations: [
        '60Hz display in this class',
        'USB-C limited to USB 2 speeds',
        'No Face ID',
      ],
    },
  },
  {
    id: 14,
    title: 'ASUS Vivobook 15 (X1504VA)',
    seoName: 'ASUS Vivobook 15 X1504VA',
    category: 'Laptops',
    topCategory: 'PC',
    subCategory: 'Laptop',
    imageAlt: 'ASUS Vivobook 15 laptop',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/asus-vivobook-15-x1504va/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/asus-vivobook-15-x1504va/1.webp',
    gallery: [
            "/images/products/asus-vivobook-15-x1504va/1.webp",
            "/images/products/asus-vivobook-15-x1504va/2.webp",
            "/images/products/asus-vivobook-15-x1504va/3.webp",
            "/images/products/asus-vivobook-15-x1504va/4.webp",
            "/images/products/asus-vivobook-15-x1504va/5.webp",
            "/images/products/asus-vivobook-15-x1504va/6.webp"
    ],
    colorImages: [
      { color: 'Cool Silver', images: ['/images/products/asus-vivobook-15-x1504va/cool-silver/1.webp', '/images/products/asus-vivobook-15-x1504va/cool-silver/2.webp'] },
      { color: 'Quiet Blue', images: ['/images/products/asus-vivobook-15-x1504va/quiet-blue/1.webp', '/images/products/asus-vivobook-15-x1504va/quiet-blue/2.webp'] },
      { color: 'Terra Cotta', images: ['/images/products/asus-vivobook-15-x1504va/terra-cotta/1.webp', '/images/products/asus-vivobook-15-x1504va/terra-cotta/2.webp'] },
    ],
    views: 900,
    dateAdded: '2023-06-15',
    price: 62000,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Retail listings for the X1504VA show the Core i3-1315U / 8GB / 512GB configuration at ৳62,000 (official BD warranty).',
    specSheet: {
      basicInfo: {
        model: 'Vivobook 15 X1504VA',
        brand: 'ASUS',
        releaseDate: '2023',
      },
      display: {
        type: 'IPS LCD (anti-glare)',
        size: '15.6 inches',
        resolution: '1920 x 1080 pixels',
        refreshRate: '60Hz',
        protection: 'N/A',
      },
      performance: {
        processor: 'Intel Core i3-1315U (13th Gen)',
        ram: '8GB DDR4',
        storage: '512GB NVMe SSD',
        os: 'Windows 11 Home',
      },
      cameraSystem: {
        rear: 'None',
        front: '720p webcam with privacy shutter',
        features: [],
      },
      batteryCharging: {
        capacity: '42Wh',
        charging: '45W USB-C adapter',
      },
      buildDesign: {
        dimensions: '35.97 x 23.25 x 1.79 cm',
        weight: '1.7kg',
        materials: 'Plastic chassis, backlit keyboard',
        colors: ['Quiet Blue', 'Cool Silver', 'Terra Cotta'],
      },
      connectivity: {
        network: 'Wi-Fi 6E',
        bluetooth: '5.3',
        ports: [
          'USB-C 3.2',
          'USB-A x2',
          'HDMI 1.4',
          '3.5mm combo jack',
          'microSD reader',
        ],
      },
      sensors: [],
      aiFeatures: ['Windows Studio Effects (supported apps)'],
      notableLimitations: [
        '60Hz basic panel',
        'No dedicated GPU',
        'RAM partially soldered depending on SKU',
      ],
    },
  },
  {
    id: 15,
    title: 'Lenovo IdeaCentre AIO 27\u2033',
    seoName: 'Lenovo IdeaCentre AIO 27',
    category: 'Desktops',
    topCategory: 'PC',
    subCategory: 'Desktop',
    imageAlt: 'Lenovo IdeaCentre AIO 27 desktop',
    /** Real product photos — see the field docs on the Product interface. */
    heroImage: '/images/products/lenovo-ideacentre-aio-27/1.webp',
    gallery: [
        '/images/products/lenovo-ideacentre-aio-27/1.webp',
        '/images/products/lenovo-ideacentre-aio-27/2.webp',
        '/images/products/lenovo-ideacentre-aio-27/3.webp',
        '/images/products/lenovo-ideacentre-aio-27/4.webp',
        '/images/products/lenovo-ideacentre-aio-27/5.webp',
        '/images/products/lenovo-ideacentre-aio-27/6.webp',
        '/images/products/lenovo-ideacentre-aio-27/7.webp',
        '/images/products/lenovo-ideacentre-aio-27/8.webp',
    ],
    colorImages: [
      { color: 'Dark Grey', images: ['/images/products/lenovo-ideacentre-aio-27/dark-grey/1.webp', '/images/products/lenovo-ideacentre-aio-27/dark-grey/2.webp', '/images/products/lenovo-ideacentre-aio-27/dark-grey/3.webp', '/images/products/lenovo-ideacentre-aio-27/dark-grey/4.webp'] },
      { color: 'Light Silver', images: ['/images/products/lenovo-ideacentre-aio-27/light-silver/1.webp', '/images/products/lenovo-ideacentre-aio-27/light-silver/2.webp', '/images/products/lenovo-ideacentre-aio-27/light-silver/3.webp', '/images/products/lenovo-ideacentre-aio-27/light-silver/4.webp'] },
    ],
    views: 600,
    dateAdded: '2024-01-20',
    price: 82000,
    priceStatus: 'estimated',
    oldPrice: null,
    priceEstimated: true,
    status: 'available',
    priceNote: 'No live BD listing found for the 27″ IdeaCentre AIO. Estimated ~৳82,000 from Lenovo BD\u2019s 23.8″ AIO (৳69,000) plus ~৳13,000 typical 27″/RAM uplift — confirm with a Lenovo BD retailer before launch.',
    specSheet: {
      basicInfo: {
        model: 'IdeaCentre AIO 27 (Gen 8)',
        brand: 'Lenovo',
        releaseDate: '2024',
      },
      display: {
        type: 'IPS LCD (all-in-one)',
        size: '27 inches',
        resolution: '1920 x 1080 pixels',
        refreshRate: '60Hz',
        protection: 'N/A',
      },
      performance: {
        processor: 'Intel Core i5-13420H',
        ram: '16GB DDR4',
        storage: '512GB NVMe SSD',
        os: 'Windows 11 Home',
      },
      cameraSystem: {
        rear: 'None',
        front: '5MP pop-up privacy camera',
        features: [],
      },
      batteryCharging: {
        capacity: 'N/A (mains powered)',
        charging: '135W power adapter',
      },
      buildDesign: {
        dimensions: 'All-in-one with slim bezels',
        weight: 'Approx. 6.6 kg',
        materials: 'Aluminum stand, plastic chassis; wireless keyboard + mouse included',
        colors: ['Dark Grey', 'Light Silver'],
      },
      connectivity: {
        network: 'Wi-Fi 6, Ethernet',
        bluetooth: '5.1',
        ports: [
          'USB-A x3',
          'USB-C (data)',
          'HDMI out',
          '3.5mm combo jack',
          'Ethernet',
        ],
      },
      sensors: [],
      aiFeatures: [],
      notableLimitations: [
        '1080p on a 27-inch panel is low pixel density',
        'Integrated graphics only',
        'No battery — desk-bound',
      ],
    },
  },
  {
    id: 16,
    title: 'Xiaomi Redmi Watch 5',
    seoName: 'Xiaomi Redmi Watch 5',
    category: 'Wearables',
    topCategory: 'Smart Watch',
    subCategory: 'Xiaomi',
    imageAlt: 'Xiaomi Redmi Watch 5',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/xiaomi-redmi-watch-5/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/xiaomi-redmi-watch-5/1.webp',
    gallery: [
            "/images/products/xiaomi-redmi-watch-5/1.webp",
            "/images/products/xiaomi-redmi-watch-5/2.webp",
            "/images/products/xiaomi-redmi-watch-5/3.webp"
    ],
    colorImages: [
      { color: 'Lavender Purple', images: ['/images/products/xiaomi-redmi-watch-5/lavender-purple/1.webp'] },
      { color: 'Obsidian Black', images: ['/images/products/xiaomi-redmi-watch-5/obsidian-black/1.webp'] },
      { color: 'Silver Gray', images: ['/images/products/xiaomi-redmi-watch-5/silver-gray/1.webp'] },
    ],
    views: 1700,
    dateAdded: '2025-01-15',
    // ৳13,999 matches the official price in the note below — the old ৳14,000
    // was a rounding that made the listing disagree with its own source.
    price: 13999,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote: 'official BD price: ৳13,999 (BT Calling, all colors same price).',
    specSheet: {
      basicInfo: {
        model: 'Redmi Watch 5',
        brand: 'Xiaomi',
        releaseDate: 'Jan 2025',
      },
      display: {
        type: 'AMOLED',
        size: '2.07 inches',
        resolution: '432 x 514 pixels',
        refreshRate: '60Hz',
        protection: '2.5D glass',
      },
      performance: {
        processor: 'N/A (wearable SoC)',
        ram: 'N/A',
        storage: 'N/A',
        os: 'Xiaomi HyperOS (wearable)',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: 'Up to 24 days typical use',
        charging: 'Magnetic charging dock',
      },
      buildDesign: {
        dimensions: 'Approx. 46.2 x 39.6 x 10.5 mm',
        weight: '36.3g (without strap)',
        materials: 'Aluminum alloy frame, 2.5D glass, 5ATM water resistance',
        colors: ['Obsidian Black', 'Silver Gray', 'Lavender Purple'],
      },
      connectivity: {
        network: 'N/A (no cellular)',
        bluetooth: '5.3',
        ports: ['Magnetic charging pins'],
      },
      sensors: ['Heart rate', 'SpO2', 'Accelerometer', 'Gyroscope'],
      aiFeatures: [],
      notableLimitations: [
        'No NFC payments in most regions',
        'Proprietary magnetic charger',
        'No third-party app support',
      ],
    },
  },
  {
    id: 17,
    title: 'Apple AirPods Pro 3',
    seoName: 'AirPods Pro 3',
    category: 'Audio',
    topCategory: 'Earbuds',
    subCategory: 'AirPods',
    imageAlt: 'Apple AirPods Pro 3',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/apple-airpods-pro-3/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/apple-airpods-pro-3/1.webp',
    gallery: [
            "/images/products/apple-airpods-pro-3/1.webp",
            "/images/products/apple-airpods-pro-3/2.webp",
            "/images/products/apple-airpods-pro-3/3.webp",
            "/images/products/apple-airpods-pro-3/4.webp"
    ],
    views: 3600,
    dateAdded: '2025-09-24',
    price: 33500,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote: 'Gadget & Gear (official BD Apple reseller) lists ৳33,500; AppleGadgetsBD currently shows ৳35,000-36,000.',
    specSheet: {
      basicInfo: {
        model: 'AirPods Pro 3',
        brand: 'Apple',
        releaseDate: 'Sep 2025',
      },
      display: {
        type: 'None',
        size: 'N/A',
        resolution: 'N/A',
        refreshRate: 'N/A',
        protection: 'IP57 (buds and case)',
      },
      performance: {
        processor: 'Apple H2 chip',
        ram: 'N/A',
        storage: 'N/A',
        os: 'N/A (iOS 18.4+ for all features)',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: 'Up to 8 hours (ANC on); 24 hours with case',
        charging: 'USB-C case (MagSafe/Qi wireless supported)',
      },
      buildDesign: {
        dimensions: 'In-ear with foam-tipped ear tips (XS–L)',
        weight: '5.55g per bud',
        materials: 'Plastic, sweat and water resistant (IP57)',
        colors: ['White'],
      },
      connectivity: {
        network: 'N/A',
        bluetooth: '5.3',
        ports: ['USB-C case port'],
      },
      sensors: ['Heart rate sensor', 'Skin-detect sensor', 'Accelerometer', 'Vent system'],
      aiFeatures: [
        'Adaptive Audio',
        'Conversation Awareness',
        'Live Translation (Apple Intelligence)',
        'Hearing Aid feature',
      ],
      notableLimitations: [
        'No lossless audio over Bluetooth',
        'Best features require Apple devices',
        'No physical volume controls on buds',
      ],
    },
  },
  {
    id: 18,
    title: 'Anker Soundcore R50i Earbuds',
    seoName: 'Soundcore R50i',
    category: 'Audio',
    topCategory: 'Earbuds',
    subCategory: 'Bluetooth Earbuds',
    imageAlt: 'Anker Soundcore R50i earbuds',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/anker-soundcore-r50i-earbuds/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/anker-soundcore-r50i-earbuds/1.webp',
    gallery: [
            "/images/products/anker-soundcore-r50i-earbuds/1.webp",
            "/images/products/anker-soundcore-r50i-earbuds/2.webp",
            "/images/products/anker-soundcore-r50i-earbuds/3.webp",
            "/images/products/anker-soundcore-r50i-earbuds/4.webp",
            "/images/products/anker-soundcore-r50i-earbuds/5.webp",
            "/images/products/anker-soundcore-r50i-earbuds/6.webp"
    ],
    colorImages: [
      { color: 'Black', images: ['/images/products/anker-soundcore-r50i-earbuds/black/1.webp', '/images/products/anker-soundcore-r50i-earbuds/black/2.webp'] },
      { color: 'Navy Blue', images: ['/images/products/anker-soundcore-r50i-earbuds/navi-blue/1.webp', '/images/products/anker-soundcore-r50i-earbuds/navi-blue/2.webp'] },
      { color: 'White', images: ['/images/products/anker-soundcore-r50i-earbuds/white/1.webp', '/images/products/anker-soundcore-r50i-earbuds/white/2.webp'] },
    ],
    views: 950,
    dateAdded: '2023-08-10',
    price: 2590,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote: 'Ryans Archives (official BD distributor pricing): ৳2,590.',
    specSheet: {
      basicInfo: {
        model: 'Soundcore R50i',
        brand: 'Anker (Soundcore)',
        releaseDate: '2023',
      },
      display: {
        type: 'None',
        size: 'N/A',
        resolution: 'N/A',
        refreshRate: 'N/A',
        protection: 'IPX5 (buds)',
      },
      performance: {
        processor: 'N/A',
        ram: 'N/A',
        storage: 'N/A',
        os: 'Soundcore app (iOS/Android)',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: 'Up to 10 hours per charge; 42 hours total with case',
        charging: 'USB-C',
      },
      buildDesign: {
        dimensions: 'In-ear stem design',
        weight: 'Approx. 4g per bud',
        materials: 'Plastic',
        colors: ['Black', 'White', 'Navy Blue'],
      },
      connectivity: {
        network: 'N/A',
        bluetooth: '5.3',
        ports: ['USB-C case port'],
      },
      sensors: [],
      aiFeatures: ['22 preset EQ modes via app', 'Custom EQ'],
      notableLimitations: [
        'No active noise cancelling',
        'No wireless charging on the case',
        'Average mic quality for calls',
      ],
    },
  },
  {
    id: 19,
    title: 'DJI Osmo Action 5 Pro',
    seoName: 'DJI Osmo Action 5 Pro',
    category: 'Cameras',
    topCategory: 'Camera',
    subCategory: 'Action Camera',
    imageAlt: 'DJI Osmo Action 5 Pro',
    /** Purchasable package bundles — a real option dimension (affects price),
     *  unlike colors. Rendered as "Package:" buttons on the detail page. */
    purchaseOptions: ['Standard', 'Adventure Combo'],
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/dji-osmo-action-5-pro/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/dji-osmo-action-5-pro/1.webp',
    gallery: [
            "/images/products/dji-osmo-action-5-pro/1.webp",
            "/images/products/dji-osmo-action-5-pro/2.webp",
            "/images/products/dji-osmo-action-5-pro/3.webp",
            "/images/products/dji-osmo-action-5-pro/4.webp"
    ],
    views: 1100,
    dateAdded: '2024-09-18',
    price: 36500,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    /** Variant pricing: DJI\u2019s purchasable dimension is the bundle
     *  (purchaseOptions), so variant labels are 'Standard' / 'Adventure Combo'.
     *  Both from Star Tech\u2019s live listing, Sep 2026. */
    variants: [
      { label: 'Standard', price: 36500 },
      { label: 'Adventure Combo', price: 45500 },
    ],
    priceNote: 'Star Tech (official BD): Standard Combo ৳36,500 · Adventure Combo ৳45,500.',
    specSheet: {
      basicInfo: {
        model: 'Osmo Action 5 Pro',
        brand: 'DJI',
        releaseDate: 'Sep 2024',
      },
      display: {
        type: 'Dual OLED touchscreens (front + rear)',
        size: '1.4 inches (front) / 2.0 inches (rear)',
        resolution: 'N/A',
        refreshRate: 'N/A',
        protection: 'Waterproof to 20m without housing',
      },
      performance: {
        processor: 'N/A (DJI imaging SoC)',
        ram: 'N/A',
        storage: '47GB built-in + microSD',
        os: 'N/A',
      },
      cameraSystem: {
        rear: '1/1.3-inch sensor, up to 4K @ 120fps',
        front: 'Uses the same main sensor (dual-screen action cam)',
        features: [
          'RockSteady 3.0 stabilization',
          '47GB internal storage',
          'Up to 4 hours recording per charge',
          'Waterproof to 20m without case',
        ],
      },
      batteryCharging: {
        capacity: 'Up to 4 hours recording',
        charging: 'USB-C',
      },
      buildDesign: {
        dimensions: 'Compact action-cam body',
        weight: '146g',
        materials: 'Waterproof body, magnetic quick-release mount',
        colors: ['Black'],
      },
      connectivity: {
        network: 'Wi-Fi + Bluetooth (DJI Mimo app)',
        bluetooth: '5.0',
        ports: ['USB-C'],
      },
      sensors: [],
      aiFeatures: ['Subject tracking', 'AI highlighting (Mimo auto-edit)'],
      notableLimitations: [
        'Fixed focal length (no optical zoom)',
        'microSD needed beyond 47GB internal storage',
        'No built-in ND filter',
      ],
    },
  },
  {
    id: 20,
    title: 'Anker PowerCore 20000 Power Bank',
    seoName: 'Anker PowerCore 20000',
    category: 'Accessories',
    topCategory: 'Gadget Accessories',
    subCategory: 'Charging',
    imageAlt: 'Anker PowerCore 20000 power bank',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/anker-powercore-20000-power-bank/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/anker-powercore-20000-power-bank/1.webp',
    gallery: [
            "/images/products/anker-powercore-20000-power-bank/1.webp",
            "/images/products/anker-powercore-20000-power-bank/2.webp",
            "/images/products/anker-powercore-20000-power-bank/3.webp"
    ],
    views: 1300,
    dateAdded: '2023-02-01',
    price: 4400,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote: 'Star Tech: Anker A1344 20,000mAh 22.5W — ৳4,400 (official BD warranty).',
    specSheet: {
      basicInfo: {
        model: 'PowerCore Select 20000',
        brand: 'Anker',
        releaseDate: '2023',
      },
      display: {
        type: 'None',
        size: 'N/A',
        resolution: 'N/A',
        refreshRate: 'N/A',
        protection: 'N/A (MultiProtect safety system)',
      },
      performance: {
        processor: 'N/A',
        ram: 'N/A',
        storage: 'N/A',
        os: 'N/A (plug and play)',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: '20000mAh cell (≈74Wh)',
        charging: '22.5W max output; USB-C PD input/output; ~5h full recharge',
      },
      buildDesign: {
        dimensions: 'Compact brick form factor',
        weight: 'Approx. 445g',
        materials: 'Plastic shell',
        colors: ['Black'],
      },
      connectivity: {
        network: 'N/A',
        bluetooth: 'N/A',
        ports: ['USB-C (PD in/out)', 'USB-A'],
      },
      sensors: [],
      aiFeatures: [],
      notableLimitations: [
        'Charger not included',
        'No capacity display on the base model',
        '22.5W cap — not for full-speed laptop charging',
      ],
    },
  },
  {
    id: 21,
    title: 'Xiaomi Robot Vacuum S10',
    seoName: 'Xiaomi Robot Vacuum S10',
    category: 'Smart Home',
    topCategory: 'Home Accessories',
    subCategory: 'Cleaning Robot',
    imageAlt: 'Xiaomi Robot Vacuum S10',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/xiaomi-robot-vacuum-s10/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/xiaomi-robot-vacuum-s10/1.webp',
    gallery: [
            "/images/products/xiaomi-robot-vacuum-s10/1.webp",
            "/images/products/xiaomi-robot-vacuum-s10/2.webp",
            "/images/products/xiaomi-robot-vacuum-s10/3.webp",
            "/images/products/xiaomi-robot-vacuum-s10/4.webp"
    ],
    colorImages: [
      { color: 'Black', images: ['/images/products/xiaomi-robot-vacuum-s10/black/1.webp', '/images/products/xiaomi-robot-vacuum-s10/black/2.webp'] },
      { color: 'White', images: ['/images/products/xiaomi-robot-vacuum-s10/white/1.webp', '/images/products/xiaomi-robot-vacuum-s10/white/2.webp'] },
    ],
    views: 1000,
    dateAdded: '2022-08-20',
    price: 28500,
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote: 'Sumash Tech (official BD warranty): ৳28,500 (previously ৳33,000).',
    specSheet: {
      basicInfo: {
        model: 'Robot Vacuum S10',
        brand: 'Xiaomi',
        releaseDate: '2022',
      },
      display: {
        type: 'None (LED status indicator)',
        size: 'N/A',
        resolution: 'N/A',
        refreshRate: 'N/A',
        protection: 'N/A',
      },
      performance: {
        processor: 'N/A',
        ram: 'N/A',
        storage: 'N/A (on-device map storage)',
        os: 'Mi Home / Xiaomi Home app',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: '5200mAh (up to ~130 min per charge)',
        charging: 'Auto-recharge and resume cleaning',
      },
      buildDesign: {
        dimensions: '353 x 350 x 94.5 mm',
        weight: 'Approx. 3.6 kg',
        materials: 'White plastic body with LDS turret',
        colors: ['White', 'Black'],
      },
      connectivity: {
        network: 'Wi-Fi 2.4GHz (app control)',
        bluetooth: 'N/A',
        ports: ['Charging dock'],
      },
      sensors: ['LDS laser distance sensor', 'Cliff sensors', 'Wall sensor'],
      aiFeatures: [
        'LDS laser navigation and mapping',
        'Room zoning and no-go zones',
        'Google Assistant / Alexa voice control',
      ],
      notableLimitations: [
        'Basic flat mop (no vibration or lift)',
        '2.4GHz Wi-Fi only',
        'No auto-empty dock',
      ],
    },
  },
  {
    id: 22,
    title: 'Xiaomi Smart TV X Pro 55',
    seoName: 'Xiaomi X Pro 55 TV',
    category: 'Appliances',
    topCategory: 'Home Appliances',
    subCategory: 'Smart TV',
    imageAlt: 'Xiaomi Smart TV X Pro 55',
    /** Real product photos (hero = 1.webp; rest are gallery angles).
     *  Served from public/images/products/xiaomi-smart-tv-x-pro-55/ — the single
     *  shared copy used by Shop, Quick Look, and every other surface. */
    heroImage: '/images/products/xiaomi-smart-tv-x-pro-55/1.webp',
    gallery: [
            "/images/products/xiaomi-smart-tv-x-pro-55/1.webp",
            "/images/products/xiaomi-smart-tv-x-pro-55/2.webp",
            "/images/products/xiaomi-smart-tv-x-pro-55/3.webp",
            "/images/products/xiaomi-smart-tv-x-pro-55/4.webp"
    ],
    views: 1500,
    dateAdded: '2023-04-18',
    price: 85000,
    priceStatus: 'estimated',
    oldPrice: null,
    priceEstimated: true,
    status: 'available',
    priceNote: 'Estimated ~৳85,000 — the exact X Pro 55 has no active BD listing. Anchored to its official sibling, the Xiaomi TV A Pro 55″ QLED 2026 at ৳74,999 (Sumash Tech, official BD), plus a typical ~৳10k step up for the higher X Pro tier. Confirm with a Xiaomi BD retailer before launch.',
    specSheet: {
      basicInfo: {
        model: 'Smart TV X Pro 55',
        brand: 'Xiaomi',
        releaseDate: '2023',
      },
      display: {
        type: 'QLED',
        size: '55 inches',
        resolution: '3840 x 2160 pixels (4K)',
        refreshRate: '120Hz',
        protection: 'N/A',
      },
      performance: {
        processor: 'Quad-core media SoC',
        ram: '2GB',
        storage: '32GB',
        os: 'Google TV (Android TV)',
      },
      cameraSystem: {
        rear: 'None',
        front: 'None',
        features: [],
      },
      batteryCharging: {
        capacity: 'N/A (mains powered)',
        charging: 'N/A',
      },
      buildDesign: {
        dimensions: 'Slim bezel design with metal stand',
        weight: 'Approx. 12 kg (with stand)',
        materials: 'Plastic frame, metal stand',
        colors: ['Black'],
      },
      connectivity: {
        network: 'Dual-band Wi-Fi, Ethernet',
        bluetooth: '5.0',
        ports: [
          'HDMI 2.1 (eARC/ALLM)',
          'USB-A x2',
          'Ethernet',
          'Optical audio out',
        ],
      },
      sensors: [],
      aiFeatures: ['Dolby Vision IQ', 'Google Assistant', 'Chromecast built-in'],
      notableLimitations: [
        'Average 30W speaker system',
        'Google TV ads/sponsored content',
        'Only one HDMI 2.1 port',
      ],
    },
  },
  {
    id: 23,
    title: 'Apple HomeView Smart Display',
    seoName: 'Apple HomeView',
    category: 'Smart Home',
    topCategory: 'Home Accessories',
    subCategory: 'Smart Home Devices',
    imageAlt: 'Apple HomeView Smart Display',
    /** AI-generated renders supplied for this product — the only product
     *  images on the site that are not photographs. They are declared as
     *  renders three ways: this note (visible under the gallery), every alt
     *  string below, and the price/spec copy. Numeric names like the rest of
     *  the catalog, inside a NEW product folder so no other product's cached
     *  1.webp can be served here; 1024x1024 WebP, sharp-converted.
     *  Order: 1 = tabletop silver (main), 2 = starlight, 3 = rose pink,
     *  4 = space gray, 5-6 = wall-mounted. The supplied files' colour names
     *  were paired with the wrong renders (the pink-based file was called
     *  silver, the cream one starlight, and so on), so each file was matched
     *  to the colour it actually shows before numbering. */
    heroImage: '/images/products/apple-homeview-smart-display/1.webp',
    gallery: [
      '/images/products/apple-homeview-smart-display/1.webp',
      '/images/products/apple-homeview-smart-display/2.webp',
      '/images/products/apple-homeview-smart-display/3.webp',
      '/images/products/apple-homeview-smart-display/4.webp',
      '/images/products/apple-homeview-smart-display/5.webp',
      '/images/products/apple-homeview-smart-display/6.webp',
    ],
    galleryAlts: [
      {
        src: '/images/products/apple-homeview-smart-display/1.webp',
        alt: 'AI render of the Apple HomeView tabletop display in silver',
      },
      {
        src: '/images/products/apple-homeview-smart-display/2.webp',
        alt: 'AI render of the Apple HomeView tabletop display in starlight',
      },
      {
        src: '/images/products/apple-homeview-smart-display/3.webp',
        alt: 'AI render of the Apple HomeView tabletop display in rose pink',
      },
      {
        src: '/images/products/apple-homeview-smart-display/4.webp',
        alt: 'AI render of the Apple HomeView tabletop display in space gray',
      },
      {
        src: '/images/products/apple-homeview-smart-display/5.webp',
        alt: 'AI render of the wall-mounted Apple HomeView on a wall',
      },
      {
        src: '/images/products/apple-homeview-smart-display/6.webp',
        alt: 'AI render of the wall-mounted Apple HomeView shown closer up',
      },
    ],
    galleryNote:
      'Images are renders based on Apple\'s announced design, not photographs.',
    priceDisplayNote:
      'No Bangladesh price yet — Apple lists a US launch price of $299 for both versions (announced October 13, 2026, before tax and shipping).',
    /** No offers, rating or review exist for this product, so a Product node
     *  would be incomplete — opt out and keep the page's FAQPage only. */
    noProductSchema: true,
    /** 1200x630 card cropped centred from the hero render (the site's OG
     *  card format) instead of the square hero, which social crawlers
     *  letterbox. */
    ogImage: '/og/apple-homeview-smart-display-20261018.png',
    views: 1200,
    dateAdded: '2026-10-18',
    price: null,
    priceStatus: 'not-launched',
    oldPrice: null,
    /** No Bangladesh price exists — deliberately NOT set to a converted US
     *  figure. purchaseMode 'free-order' keeps the page to a single Free
     *  Order request button (no Buy Now, no cart, no payment). */
    priceEstimated: true,
    purchaseMode: 'free-order',
    status: 'upcoming',
    priceNote:
      'Apple has not announced a Bangladesh price or release date. Apple announced a US launch price of $299 for both versions on October 13, 2026, with pre-orders open and availability from November 13, 2026 in the US, Australia, Canada, India, New Zealand, Singapore, South Africa and the UK.',
    specSheet: {
      basicInfo: {
        model: 'HomeView',
        brand: 'Apple',
        releaseDate: 'Nov 2026',
      },
      display: {
        type: 'Liquid Retina (LED-backlit IPS, square)',
        size: '7 inches (6.98 inches measured diagonally)',
        resolution: '1088 x 1088 pixels (220 ppi)',
        refreshRate: 'Not listed by Apple',
        protection: 'Not listed by Apple',
      },
      performance: {
        processor: 'A18 chip',
        ram: 'Not listed by Apple',
        storage: 'Not listed by Apple',
        os: 'Not named by Apple — requires iOS 27.2 or iPadOS 27.2 or later on a paired iPhone or iPad',
      },
      cameraSystem: {
        // A smart display has no rear camera — 'None' is the catalog's
        // non-applicable marker (filtered out of generated descriptions).
        rear: 'None',
        front: '12MP Center Stage camera (ƒ/2.4)',
        features: [
          'Center Stage keeps you framed during FaceTime calls',
          'Home Camera face shows up to nine video feeds at once',
        ],
      },
      batteryCharging: {
        // Apple lists no battery; both versions are mains powered.
        capacity: 'No battery listed by Apple — mains powered',
        charging:
          'Tabletop: 30W power adapter and 1.5 m USB-C cable included. Wall-mounted: compatible mount, USB-C cable and a 20W-or-higher power adapter sold separately',
      },
      buildDesign: {
        dimensions:
          'Tabletop: 5.73 in x 5.38–6.82 in x 3.78–5.13 in; wall-mounted: 5.73 in x 5.73 in x 0.39 in',
        weight: 'Tabletop 2.1 lb (952 g); wall-mounted 0.63 lb (286 g)',
        materials: 'Not listed by Apple',
        colors: ['Silver', 'Starlight', 'Rose Pink', 'Space Gray'],
      },
      connectivity: {
        network: 'Wi-Fi 6E (802.11ax) with MIMO, Thread networking',
        bluetooth: '6.0',
        ports: ['USB-C'],
      },
      sensors: [
        'Four beamforming microphones for far-field Siri',
        '12MP Center Stage camera',
        'Ambient light sensor, temperature and humidity sensor, accelerometer',
      ],
      aiFeatures: [
        'Siri AI with broad world knowledge and natural conversation',
        'Personal context when paired with an Apple Intelligence-enabled iPhone or iPad',
        'Personalized Home Screen for up to six recognized people',
        'Siri AI music discovery',
        'Faces including Photos, Flow and Snoopy',
        'Home Camera face showing up to nine video feeds at once',
      ],
      notableLimitations: [
        'Not announced for Bangladesh — no local price, release date or launch market',
        'Not available for sale in the European Union, because Siri AI is unavailable in iOS there',
        'Wall-mounted version ships without a mount, USB-C cable or power adapter',
        'Personal context needs an Apple Intelligence-enabled iPhone or iPad — without one, Siri AI is limited to world knowledge and music discovery',
        'Power Mount PoE Wired arrives only in early 2027',
        'No ultra-wideband (UWB) listed in Apple\'s wireless specifications',
      ],
    },
  },
  {
    id: 24,
    title: 'Redmi Note 14 Pro Plus 5G',
    seoName: 'Redmi Note 14 Pro+ 5G',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Xiaomi',
    imageAlt: 'Redmi Note 14 Pro+ 5G',
    /** Base image = the DEFAULT version's first color (Global, Frost Blue).
     *  Every non-version-aware surface (cards, Shop, JSON-LD) shows this. */
    heroImage: '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/1.webp',
    gallery: [
            "/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/1.webp",
            "/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/2.webp",
            "/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/3.webp",
            "/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/4.webp",
            "/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/5.webp"
    ],
    /** Default-version colors (Global). The detail page reads the SELECTED
     *  version's own colorImages, so its swatches swap with the version. */
    colorImages: [
      {
        color: 'Frost Blue',
        images: [
          '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/1.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/2.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/3.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/4.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/5.webp',
        ],
      },
      {
        color: 'Midnight Black',
        images: [
          '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/1.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/2.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/3.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/4.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/5.webp',
        ],
      },
      {
        color: 'Lavender Purple',
        images: [
          '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/1.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/2.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/3.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/4.webp',
          '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/5.webp',
        ],
      },
    ],
    views: 900,
    dateAdded: '2026-10-22',
    price: 37500,
    priceStatus: 'unofficial',
    oldPrice: null,
    priceEstimated: false,
    /**
     * NOTIFY-ONLY on every surface: no Add to Cart, no Buy Now, no Free Order
     * (the owner left the button choice open, so the page asks for a stock
     * alert instead of taking orders for an unofficially imported phone).
     */
    purchaseMode: 'notify',
    status: 'available',
    /** No source confirms stock, so the Product schema carries the offer but
     *  no availability value. */
    omitSchemaAvailability: true,
    /** TWO sources per priced variant, every one of them re-opened on
     *  22-23 October 2026 (the most recent, Rio International, on 23 Oct).
     *  Xiaomi's own Bangladesh site does not sell this model, so every figure
     *  below is UNOFFICIAL — there is no Xiaomi Bangladesh price to quote. */
    priceNote:
      'Unofficial Bangladesh price (no Xiaomi Bangladesh listing exists for this model). Global version: 8GB/256GB ৳37,500 and 12GB/512GB ৳43,500 (MobileDokan.com, updated 27 Sep 2026; Rio International lists ৳35,999 and ৳44,999 on 23 Oct 2026), 12GB/256GB ৳39,500 (MobileDokan.com 27 Sep 2026; Rio International ৳39,499 on 23 Oct 2026). China version: 12GB/256GB ৳35,000 (MobileDokan.com, updated 19 Oct 2026; MobileDokan.co ৳34,000 on 2 Sep 2026, Rio International ৳34,999 and RMTI ৳34,000 on 23 Oct 2026). Prices vary by seller and by version — ask which model number you are being sold.',
    priceCheckedAt: '2026-10-23',
    priceDisplayNote:
      '(Unofficial price in Bangladesh — imported unit, not a Xiaomi Bangladesh price)',
    /**
     * Global version = the base spec sheet: Xiaomi Global's own spec page
     * (mi.com/global/product/redmi-note-14-pro-plus-5g/specs/, opened
     * 22 Oct 2026) — 6.67-inch 1.5K 120Hz AMOLED, Snapdragon 7s Gen 3,
     * 200MP OIS + 8MP ultra-wide + 2MP macro, 20MP front, 5110mAh/120W,
     * IP68. The China version's differences live in `versions` below.
     */
    specSheet: {
      basicInfo: {
        model: 'Redmi Note 14 Pro+ 5G (Global)',
        brand: 'Xiaomi',
        releaseDate: 'January 2025',
      },
      display: {
        type: 'CrystalRes AMOLED, Dolby Vision',
        size: '6.67 inches',
        resolution: '2712 x 1220 pixels (1.5K)',
        refreshRate: '120Hz',
        protection: 'Corning Gorilla Glass Victus 2',
      },
      performance: {
        processor: 'Qualcomm Snapdragon 7s Gen 3 (4nm)',
        ram: '8GB/12GB',
        storage: '256GB/512GB',
        os: 'Android 14, HyperOS',
      },
      cameraSystem: {
        rear: '200MP main (OIS) + 8MP ultra-wide + 2MP macro',
        front: '20MP',
        features: [
          'OIS on the 200MP main camera',
          '4K video at 24/30fps, 1080p slow motion at 120fps',
          'Motion tracking focus and Lightning Burst',
          'Dual speakers with Dolby Atmos',
        ],
      },
      batteryCharging: {
        capacity: '5110mAh',
        charging: '120W HyperCharge',
      },
      buildDesign: {
        dimensions: '162.53 x 74.67 x 8.75 mm',
        weight: '210g',
        materials: 'Glass front (Gorilla Glass Victus 2) and glass back, IP68',
        colors: ['Frost Blue', 'Midnight Black', 'Lavender Purple'],
      },
      connectivity: {
        network: '5G (2G/3G/4G/5G)',
        bluetooth: 'Bluetooth 5.4',
        ports: ['USB Type-C 2.0'],
      },
      sensors: [
        'In-screen fingerprint sensor',
        'AI Face Unlock',
        'IR blaster',
        'Gyroscope and electronic compass',
        'X-axis linear motor',
      ],
      aiFeatures: [
        'Circle to Search with Google',
        'Google Gemini',
        'AI Interpreter and AI Subtitles',
        'AI Notes and AI Recorder',
        'AI image editing',
      ],
      notableLimitations: [
        'Not sold officially in Bangladesh — no Xiaomi Bangladesh price and no manufacturer warranty here',
        'Unofficial import: the seller, not Xiaomi, is your only warranty route',
        'The Global version uses LPDDR4X memory and UFS 2.2 storage, slow for the money in 2026',
        'No 3.5mm headphone jack',
        'The 8GB/128GB listing some shops show is not a Xiaomi Global configuration (Global lists 8GB/256GB, 12GB/256GB and 12GB/512GB)',
      ],
    },
    /**
     * TWO VERSIONS of ONE model. Verified 22 Oct 2026: Xiaomi Global's spec
     * page for the Global figures; the China figures come from
     * MobileDokan.com's China listing (updated 19 Oct 2026: 6200mAh, 90W,
     * IP68/IP69K, 50MP f/1.6 main + 50MP 2.5x telephoto + 8MP ultra-wide),
     * corroborated by Gadget Man's 6200mAh/90W entry and Xiaomi India's page
     * for the same hardware.
     *
     * PRICING RULE APPLIED: a storage option appears only when two sources
     * listed it. China 12GB/512GB (৳36,500 on MobileDokan.com, 26 Aug 2026)
     * had ONE source and is therefore NOT offered here.
     */
    versions: [
      {
        id: 'global',
        label: 'Global Version',
        shortLabel: 'Global',
        colorImages: [
          {
            color: 'Frost Blue',
            images: [
              '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/1.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/2.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/3.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/4.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/frost-blue/5.webp',
            ],
          },
          {
            color: 'Midnight Black',
            images: [
              '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/1.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/2.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/3.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/4.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/midnight-black/5.webp',
            ],
          },
          {
            color: 'Lavender Purple',
            images: [
              '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/1.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/2.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/3.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/4.webp',
              '/images/products/redmi-note-14-pro-plus-5g/global/lavender-purple/5.webp',
            ],
          },
        ],
        /** MobileDokan.com Global listing (updated 27 Sep 2026), each
         *  cross-checked against a second Bangladesh listing: Rio
         *  International's variant matrix (23 Oct 2026) for 8/256 and
         *  12/512, Rio International for 12/256. Where the two differed by
         *  under 5% the more recently updated MobileDokan figure is used, as
         *  the price rule asks. */
        variants: [
          { label: '8GB/256GB', price: 37500 },
          { label: '12GB/256GB', price: 39500 },
          { label: '12GB/512GB', price: 43500 },
        ],
      },
      {
        id: 'china',
        label: 'China Version',
        shortLabel: 'China',
        colorImages: [
          {
            color: 'Black',
            images: [
              '/images/products/redmi-note-14-pro-plus-5g/china/black/1.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/black/2.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/black/3.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/black/4.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/black/5.webp',
            ],
          },
          {
            color: 'White',
            images: [
              '/images/products/redmi-note-14-pro-plus-5g/china/white/1.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/white/2.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/white/3.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/white/4.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/white/5.webp',
            ],
          },
          {
            color: 'Green',
            images: [
              '/images/products/redmi-note-14-pro-plus-5g/china/green/1.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/green/2.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/green/3.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/green/4.webp',
              '/images/products/redmi-note-14-pro-plus-5g/china/green/5.webp',
            ],
          },
        ],
        /** MobileDokan.com China listing (updated 19 Oct 2026) ৳35,000,
         *  confirmed by MobileDokan.co (৳34,000, 2 Sep 2026), Rio
         *  International (৳34,999) and RMTI (৳34,000) on 23 Oct 2026. The
         *  China 12GB/512GB figure (৳36,500) appeared on one listing only,
         *  so it is NOT offered here. */
        variants: [{ label: '12GB/256GB', price: 35000 }],
        specOverrides: {
          basicInfo: {
            model: 'Redmi Note 14 Pro+ 5G (China)',
          },
          performance: {
            ram: '12GB',
            storage: '256GB',
          },
          cameraSystem: {
            rear: '50MP main (f/1.6, OIS) + 50MP 2.5x telephoto + 8MP ultra-wide',
            front: '20MP',
            features: [
              'OIS on the 50MP main camera',
              '50MP 2.5x telephoto, rated for 5x lossless zoom',
              '4K video at 24/30fps, 1080p slow motion at 120fps',
              'Dual speakers with Dolby Atmos',
            ],
          },
          batteryCharging: {
            capacity: '6200mAh',
            charging: '90W wired',
          },
          buildDesign: {
            dimensions: '162.5 x 74.7 x 8.7 mm',
            weight: '210.8g',
            materials: 'Glass front (Gorilla Glass Victus 2) and glass back, IP68',
            colors: ['Black', 'White', 'Green'],
          },
          notableLimitations: [
            'Not sold officially in Bangladesh — no Xiaomi Bangladesh price and no manufacturer warranty here',
            'Unofficial import: the seller, not Xiaomi, is your only warranty route',
            'Google Mobile Services on the China version was not confirmed by any source we opened — ask the seller before buying',
            'No 3.5mm headphone jack',
            'Only one storage option (12GB/256GB) had two independent Bangladesh price sources, so it is the only one shown',
          ],
        },
      },
    ],
    defaultVersion: 'global',
  },
  {
    id: 25,
    title: 'Redmi Note 15 5G',
    seoName: 'Redmi Note 15 5G',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Xiaomi',
    imageAlt: 'Redmi Note 15 5G',
    /** Hero = the default colour's front-and-back view (Glacier Blue), the
     *  same convention the other colour-mapped phones use. */
    heroImage: '/images/products/redmi-note-15-5g/glacier-blue/1.webp',
    gallery: [
      '/images/products/redmi-note-15-5g/glacier-blue/1.webp',
      '/images/products/redmi-note-15-5g/glacier-blue/2.webp',
      '/images/products/redmi-note-15-5g/glacier-blue/3.webp',
      '/images/products/redmi-note-15-5g/glacier-blue/4.webp',
      '/images/products/redmi-note-15-5g/glacier-blue/5.webp',
    ],
    /** Three official colours, each with its own five-image set:
     *  1 front and back with the screen on, 2 rear-camera close-up,
     *  3 top and bottom edges, 4 water-splash shot, 5 pocket shot. */
    colorImages: [
      {
        color: 'Glacier Blue',
        images: [
          '/images/products/redmi-note-15-5g/glacier-blue/1.webp',
          '/images/products/redmi-note-15-5g/glacier-blue/2.webp',
          '/images/products/redmi-note-15-5g/glacier-blue/3.webp',
          '/images/products/redmi-note-15-5g/glacier-blue/4.webp',
          '/images/products/redmi-note-15-5g/glacier-blue/5.webp',
        ],
      },
      {
        color: 'Mist Purple',
        images: [
          '/images/products/redmi-note-15-5g/mist-purple/1.webp',
          '/images/products/redmi-note-15-5g/mist-purple/2.webp',
          '/images/products/redmi-note-15-5g/mist-purple/3.webp',
          '/images/products/redmi-note-15-5g/mist-purple/4.webp',
          '/images/products/redmi-note-15-5g/mist-purple/5.webp',
        ],
      },
      {
        color: 'Black',
        images: [
          '/images/products/redmi-note-15-5g/black/1.webp',
          '/images/products/redmi-note-15-5g/black/2.webp',
          '/images/products/redmi-note-15-5g/black/3.webp',
          '/images/products/redmi-note-15-5g/black/4.webp',
          '/images/products/redmi-note-15-5g/black/5.webp',
        ],
      },
    ],
    /** One hand-written alt per supplied image, describing only what that
     *  file shows (official Xiaomi product images, so no render wording).
     *  All different, all under 100 characters — the shared helper uses these
     *  instead of its generic "photo N of M" text. */
    galleryAlts: [
      { src: '/images/products/redmi-note-15-5g/glacier-blue/1.webp', alt: 'Redmi Note 15 5G in Glacier Blue, front and back with the screen on' },
      { src: '/images/products/redmi-note-15-5g/glacier-blue/2.webp', alt: 'Redmi Note 15 5G in Glacier Blue, close-up of the rear camera deco' },
      { src: '/images/products/redmi-note-15-5g/glacier-blue/3.webp', alt: 'Redmi Note 15 5G in Glacier Blue, top and bottom edges side by side' },
      { src: '/images/products/redmi-note-15-5g/glacier-blue/4.webp', alt: 'Redmi Note 15 5G in Glacier Blue with water splashing across the frame' },
      { src: '/images/products/redmi-note-15-5g/glacier-blue/5.webp', alt: 'Redmi Note 15 5G in Glacier Blue sliding into a denim pocket' },
      { src: '/images/products/redmi-note-15-5g/mist-purple/1.webp', alt: 'Redmi Note 15 5G in Mist Purple, front and back with the screen on' },
      { src: '/images/products/redmi-note-15-5g/mist-purple/2.webp', alt: 'Redmi Note 15 5G in Mist Purple, close-up of the rear camera deco' },
      { src: '/images/products/redmi-note-15-5g/mist-purple/3.webp', alt: 'Redmi Note 15 5G in Mist Purple, top and bottom edges side by side' },
      { src: '/images/products/redmi-note-15-5g/mist-purple/4.webp', alt: 'Redmi Note 15 5G in Mist Purple with water splashing across the frame' },
      { src: '/images/products/redmi-note-15-5g/mist-purple/5.webp', alt: 'Redmi Note 15 5G in Mist Purple sliding into a denim pocket' },
      { src: '/images/products/redmi-note-15-5g/black/1.webp', alt: 'Redmi Note 15 5G in Black, front and back with the screen on' },
      { src: '/images/products/redmi-note-15-5g/black/2.webp', alt: 'Redmi Note 15 5G in Black, close-up of the rear camera deco' },
      { src: '/images/products/redmi-note-15-5g/black/3.webp', alt: 'Redmi Note 15 5G in Black, top and bottom edges side by side' },
      { src: '/images/products/redmi-note-15-5g/black/4.webp', alt: 'Redmi Note 15 5G in Black with water splashing across the frame' },
      { src: '/images/products/redmi-note-15-5g/black/5.webp', alt: 'Redmi Note 15 5G in Black sliding into a denim pocket' },
    ],
    views: 760,
    dateAdded: '2026-10-23',
    price: 36999,
    /** Official: Star Tech (authorised Bangladesh retailer) lists the
     *  8GB/256GB unit at ৳36,999, and MobileDokan records the same official
     *  figure for the same configuration. */
    priceStatus: 'official',
    oldPrice: null,
    priceEstimated: false,
    purchaseMode: 'buy',
    status: 'available',
    priceNote:
      'Official Bangladesh price: ৳36,999 for 8GB/256GB (Star Tech product listing and MobileDokan official price, both checked 24 October 2026; the MobileDokan page was updated 21 September 2026). Unofficial imports: 6GB/128GB ৳24,000 and 8GB/256GB ৳31,000 (MobileDokan.co, page updated 24 October 2026; Apple Gadgets BD lists 6GB/128GB at ৳30,499 and 8GB/256GB at ৳29,499, Rio International lists both within ৳25,499–৳34,499, all checked 24 October 2026), while MobileDokan.com lists the 8GB/256GB import at ৳34,000 (page updated 21 September 2026). Only import sizes with a MobileDokan price and a second Bangladesh retailer are offered. Imports carry no Xiaomi Bangladesh warranty.',
    priceCheckedAt: '2026-10-24',
    /**
     * Verified on Xiaomi Global's own Redmi Note 15 5G spec page (opened
     * 23 Oct 2026) and cross-checked against Star Tech's specification table
     * and MobileDokan's listing. Rows Xiaomi does not publish (glass brand,
     * Bluetooth profiles) are left out rather than filled in.
     */
    specSheet: {
      basicInfo: {
        model: 'Redmi Note 15 5G',
        brand: 'Xiaomi',
        releaseDate: 'January 2026',
      },
      display: {
        type: 'AMOLED, 120Hz, 3200 nits peak',
        size: '6.77 inches',
        resolution: '2392 x 1080 (FHD+)',
        refreshRate: '120Hz',
        protection: 'High-durability display glass',
      },
      performance: {
        processor: 'Qualcomm Snapdragon 6 Gen 3 (4nm)',
        ram: '8GB',
        storage: '256GB',
        os: 'Android 15, HyperOS 2',
      },
      cameraSystem: {
        rear: '108MP main (f/1.7, 1/1.67-inch) + 8MP ultra-wide (f/2.2)',
        front: '20MP (f/2.2)',
        features: [
          '108MP main sensor with 9-in-1 pixel binning, 1.92μm output',
          '8MP ultra-wide with a 16mm-equivalent field of view',
          '4K video at 30fps from the rear camera',
          '1080p video at 30fps from the front camera',
        ],
      },
      batteryCharging: {
        capacity: '5520mAh',
        charging: '45W turbo charging',
      },
      buildDesign: {
        dimensions: '164 x 75.42 x 7.35mm',
        weight: '178g',
        materials: 'Glass front, plastic frame and plastic back (MobileDokan)',
        colors: ['Glacier Blue', 'Mist Purple', 'Black'],
      },
      connectivity: {
        network: '5G (2G/3G/4G/5G)',
        bluetooth: 'Bluetooth 5.1',
        ports: ['USB Type-C', 'microSD up to 1TB (shared SIM slot)'],
      },
      sensors: [
        'In-screen fingerprint sensor',
        'AI face unlock',
        'IR blaster',
        'Gyroscope and electronic compass',
        'Virtual proximity sensor',
      ],
      /** Read on Xiaomi's own product page (opened 23 Oct 2026), which lists
       *  these tools by name. Nothing here is inferred from other models. */
      aiFeatures: [
        'AI Erase, which removes unwanted objects and fills in the background',
        'AI image editing tools for photos',
        'Google Gemini with Gemini Live and the Gemini overlay',
      ],
      notableLimitations: [
        'No power adapter in the box — Xiaomi states none is included',
        'IP66 only: splash and dust resistant, not rated for submersion',
        'LPDDR4X memory and UFS 2.2 storage',
        'The official Bangladesh configuration is 8GB/256GB only; other memory sizes come through imports',
      ],
    },
    /**
     * TWO VERSIONS of ONE model, because the same phone reaches Bangladesh on
     * two different channels: an official unit at a fixed price with Xiaomi
     * Care cover, and grey imports in memory sizes Xiaomi does not sell here.
     *
     * PRICING RULE APPLIED: an import variant is offered only when it has a
     * MobileDokan price AND a second Bangladesh retailer price. 6GB/128GB and
     * 8GB/256GB both qualify (MobileDokan.co updated 24 Oct 2026; Apple
     * Gadgets BD and Rio International checked the same day). 8GB/128GB and
     * 12GB/256GB are listed by retailers but carry no MobileDokan price, so
     * they are NOT offered.
     */
    versions: [
      {
        id: 'official',
        label: 'Official (Bangladesh)',
        shortLabel: 'Official',
        colorImages: [
          {
            color: 'Glacier Blue',
            images: [
              '/images/products/redmi-note-15-5g/glacier-blue/1.webp',
              '/images/products/redmi-note-15-5g/glacier-blue/2.webp',
              '/images/products/redmi-note-15-5g/glacier-blue/3.webp',
              '/images/products/redmi-note-15-5g/glacier-blue/4.webp',
              '/images/products/redmi-note-15-5g/glacier-blue/5.webp',
            ],
          },
          {
            color: 'Mist Purple',
            images: [
              '/images/products/redmi-note-15-5g/mist-purple/1.webp',
              '/images/products/redmi-note-15-5g/mist-purple/2.webp',
              '/images/products/redmi-note-15-5g/mist-purple/3.webp',
              '/images/products/redmi-note-15-5g/mist-purple/4.webp',
              '/images/products/redmi-note-15-5g/mist-purple/5.webp',
            ],
          },
          {
            color: 'Black',
            images: [
              '/images/products/redmi-note-15-5g/black/1.webp',
              '/images/products/redmi-note-15-5g/black/2.webp',
              '/images/products/redmi-note-15-5g/black/3.webp',
              '/images/products/redmi-note-15-5g/black/4.webp',
              '/images/products/redmi-note-15-5g/black/5.webp',
            ],
          },
        ],
        variants: [{ label: '8GB/256GB', price: 36999 }],
        priceDisplayNote:
          '(Official price in Bangladesh — 8GB/256GB, one-year warranty at Xiaomi Care)',
      },
      {
        id: 'import',
        label: 'Unofficial import',
        shortLabel: 'Import',
        /** Same three colours, same image files — the import units are the
         *  same handset, so nothing is duplicated on disk. */
        colorImages: [
          {
            color: 'Glacier Blue',
            images: [
              '/images/products/redmi-note-15-5g/glacier-blue/1.webp',
              '/images/products/redmi-note-15-5g/glacier-blue/2.webp',
              '/images/products/redmi-note-15-5g/glacier-blue/3.webp',
              '/images/products/redmi-note-15-5g/glacier-blue/4.webp',
              '/images/products/redmi-note-15-5g/glacier-blue/5.webp',
            ],
          },
          {
            color: 'Mist Purple',
            images: [
              '/images/products/redmi-note-15-5g/mist-purple/1.webp',
              '/images/products/redmi-note-15-5g/mist-purple/2.webp',
              '/images/products/redmi-note-15-5g/mist-purple/3.webp',
              '/images/products/redmi-note-15-5g/mist-purple/4.webp',
              '/images/products/redmi-note-15-5g/mist-purple/5.webp',
            ],
          },
          {
            color: 'Black',
            images: [
              '/images/products/redmi-note-15-5g/black/1.webp',
              '/images/products/redmi-note-15-5g/black/2.webp',
              '/images/products/redmi-note-15-5g/black/3.webp',
              '/images/products/redmi-note-15-5g/black/4.webp',
              '/images/products/redmi-note-15-5g/black/5.webp',
            ],
          },
        ],
        variants: [
          { label: '6GB/128GB', price: 24000 },
          { label: '8GB/256GB', price: 31000 },
        ],
        priceDisplayNote:
          '(Unofficial import price — no Xiaomi Bangladesh warranty, seller cover only)',
        specOverrides: {
          basicInfo: { model: 'Redmi Note 15 5G (import unit)' },
          performance: {
            ram: '6GB/8GB',
            storage: '128GB/256GB',
          },
          notableLimitations: [
            'Import units carry no Xiaomi Bangladesh warranty — the seller’s cover is the only warranty',
            'China and International stock are sold side by side: Rio International lists the China unit with a 50MP main camera and the International unit with the 108MP one, so check the region on the box',
            'The official Bangladesh unit is 8GB/256GB only; imports are also sold as 6GB/128GB',
          ],
        },
      },
    ],
    defaultVersion: 'official',
  },
];

/** URL slug for a product title, e.g. 'HONOR Robot Phone' -> 'honor-robot-phone' */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * How a product is sold, on EVERY surface that renders a purchase action:
 * - 'buy'        → Add to Cart + Buy Now (Pre-Order while upcoming)
 * - 'free-order' → ONE Free Order button (order request, no payment/cart)
 * The shared ProductActions component is the only place these buttons are
 * rendered; see scripts/check-product-actions.js for the build guard.
 */
export type PurchaseMode = 'buy' | 'free-order' | 'notify';

/**
 * A version of a product (Global / China), resolved by its id, its short
 * label ("Global") or its button label ("Global Version"). Case-insensitive,
 * so a cart string or a URL query can carry either form.
 */
export function versionOf(p: Product, label: string | null | undefined) {
  if (!p.versions?.length || !label) return undefined;
  const t = label.trim().toLowerCase();
  return p.versions.find(
    (v) => v.id.toLowerCase() === t || v.shortLabel.toLowerCase() === t || v.label.toLowerCase() === t
  );
}

/** The version a product renders by default (defaultVersion, else the first). */
export function defaultVersionOf(p: Product) {
  if (!p.versions?.length) return undefined;
  return p.versions.find((v) => v.id === p.defaultVersion) ?? p.versions[0];
}

/**
 * THE spec resolver for a version: the base spec sheet with that version's
 * specOverrides merged in. Products without versions (or an unknown id)
 * return the base sheet object unchanged.
 */
export function specSheetOf(p: Product, versionId?: string): Product['specSheet'] {
  const base = p.specSheet;
  const version = versionId ? p.versions?.find((v) => v.id === versionId) : undefined;
  const o = version?.specOverrides;
  if (!o) return base;
  return {
    basicInfo: { ...base.basicInfo, ...o.basicInfo },
    display: { ...base.display, ...o.display },
    performance: { ...base.performance, ...o.performance },
    cameraSystem: { ...base.cameraSystem, ...o.cameraSystem },
    batteryCharging: { ...base.batteryCharging, ...o.batteryCharging },
    buildDesign: { ...base.buildDesign, ...o.buildDesign },
    connectivity: { ...base.connectivity, ...o.connectivity },
    sensors: o.sensors ?? base.sensors,
    aiFeatures: base.aiFeatures,
    notableLimitations: o.notableLimitations ?? base.notableLimitations,
  };
}

/**
 * The ONE resolver for a product's purchase mode. An explicit
 * `purchaseMode` always wins; otherwise estimated-price products default to
 * 'free-order' (never charge/checkout an unconfirmed price).
 */
export function purchaseModeOf(p: Product): PurchaseMode {
  if (p.purchaseMode) return p.purchaseMode;
  return p.priceEstimated ? 'free-order' : 'buy';
}

/**
 * A product can be ordered only when its price is a confirmed real price.
 * Estimated (unconfirmed) or missing prices must never reach checkout —
 * every Buy Now button across the app gates on this helper.
 */
export function isPurchasable(p: Product): boolean {
  return p.price !== null && !p.priceEstimated;
}

/**
 * Storage-option labels derived from the spec string ('256GB/512GB/1TB' →
 * ['256GB', '512GB', '1TB']). Shared by the detail page and the variant
 * price resolver so every surface splits the string identically.
 */
/** Spec values that mean "no such dimension exists" — 'Not listed by
 *  Apple' for the HomeView, whose storage Apple does not publish. */
const NON_SPEC = /^(n\/?a|none|unknown|tbd|-|–|not listed|not specified|not named)/i;

export function storageOptionsOf(p: Product): string[] {
  const s = (p.specSheet.performance.storage ?? '').trim();
  // A product with no storage dimension gets NO storage options (and so no
  // storage selector and no "… / Not listed by Apple" variant label).
  if (!s || NON_SPEC.test(s)) return [];
  return s.includes('/')
    ? s.split('/').map((x) => x.trim()).filter(Boolean)
    : [s];
}

/** Resolved pricing for a product/option pair — always all three fields. */
export type ResolvedPrice = {
  price: number | null;
  oldPrice: number | null;
  priceEstimated: boolean;
};

function flatPrice(p: Product): ResolvedPrice {
  return { price: p.price, oldPrice: p.oldPrice ?? null, priceEstimated: p.priceEstimated };
}

/**
 * Resolve the price for a selected storage/variant option. Falls back to
 * the product's flat price fields when no per-variant entry matches (or
 * when the product has none), so callers never need a null branch.
 *
 * `versionId` (optional) scopes the lookup to ONE version's priced options —
 * a Global 12GB/256GB and a China 12GB/256GB are different prices. Without
 * it (every product that has no versions, and any legacy call site) the
 * lookup is exactly the old flat/variants one.
 */
export function variantPrice(
  p: Product,
  optionLabel: string | null,
  versionId?: string
): ResolvedPrice {
  if (optionLabel && versionId && p.versions?.length) {
    const ver = p.versions.find((v) => v.id === versionId);
    const hit = ver?.variants.find((x) => x.label === optionLabel);
    if (hit) {
      return {
        price: hit.price,
        oldPrice: hit.oldPrice ?? null,
        priceEstimated: hit.priceEstimated ?? false,
      };
    }
  }
  if (!optionLabel) return flatPrice(p);
  const v = p.variants?.find((x) => x.label === optionLabel);
  if (!v) return flatPrice(p);
  return {
    price: v.price,
    oldPrice: v.oldPrice ?? null,
    priceEstimated: v.priceEstimated ?? false,
  };
}

/**
 * Resolve the price for a CART/CHECKOUT variant string ("Titanium Black /
 * 512GB", "Global / Frost Blue / 12GB/256GB", "512GB", "Standard", …).
 * Checks each '/'-segment from the right (storage comes after color) against
 * the product's variants labels, then falls back to the flat price. This is
 * what makes cart lines and Buy Now checkout charge the SELECTED variant's
 * price, not the base one.
 *
 * VERSIONS: when the product has versions, the version part of the string is
 * resolved FIRST ("Global" / "Global Version" / the version id), and the
 * storage label is then matched inside that version only — so the same
 * "12GB/256GB" costs different money on the Global and China versions.
 * Storage labels contain a '/' themselves ("12GB/256GB"), so matching uses
 * `includes`, never a segment equal to the label. Any product without
 * versions takes the identical old path, and an unparseable string still
 * falls back to the flat price.
 */
export function priceForCartVariant(p: Product, variant: string): ResolvedPrice {
  if (variant && variant !== 'Standard') {
    if (p.versions?.length) {
      const lower = variant.toLowerCase();
      const ver =
        p.versions.find(
          (v) =>
            lower.startsWith(`${v.shortLabel.toLowerCase()} /`) ||
            lower.startsWith(`${v.label.toLowerCase()} /`)
        ) ?? p.versions.find((v) => lower.includes(v.shortLabel.toLowerCase()));
      const pools = ver ? [ver] : p.versions;
      for (const v of pools) {
        const hit = [...v.variants]
          .sort((a, b) => b.label.length - a.label.length)
          .find((x) => variant.includes(x.label));
        if (hit) {
          return {
            price: hit.price,
            oldPrice: hit.oldPrice ?? null,
            priceEstimated: hit.priceEstimated ?? false,
          };
        }
      }
    }
    if (p.variants?.length) {
      const segs = variant.split('/').map((s) => s.trim());
      for (let i = segs.length - 1; i >= 0; i--) {
        const v = p.variants.find((x) => x.label === segs[i]);
        if (v) {
          return {
            price: v.price,
            oldPrice: v.oldPrice ?? null,
            priceEstimated: v.priceEstimated ?? false,
          };
        }
      }
    }
  }
  return flatPrice(p);
}

/**
 * 'upcoming' products are announced but not yet officially available in
 * Bangladesh — they get a Pre-Order button instead of Buy Now everywhere.
 */
export function isUpcoming(p: Product): boolean {
  return p.status === 'upcoming';
}
