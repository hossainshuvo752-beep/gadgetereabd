export interface Product {
  id: number;
  title: string;
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
  /** 'available' = officially released/available in Bangladesh; 'upcoming' =
   *  announced but not yet officially available (pre-order stage). */
  status: 'available' | 'upcoming';
  /** Price source/context — tooltip everywhere, visible text on detail pages. */
  priceNote?: string;
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
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'HONOR',
    imageAlt: 'HONOR Robot Phone',
    views: 5200,
    dateAdded: '2026-08-15',
    price: 179999,
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
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Samsung',
    imageAlt: 'Samsung Galaxy S26 Ultra',
    views: 4800,
    dateAdded: '2026-02-20',
    price: 199999,
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
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Apple',
    imageAlt: 'Apple iPhone 17 Pro Max',
    views: 6100,
    dateAdded: '2025-09-19',
    price: 209900,
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
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Vivo',
    imageAlt: 'Vivo X300 Pro',
    views: 2200,
    dateAdded: '2025-10-30',
    price: 149999,
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
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Tecno',
    imageAlt: 'Tecno Camon 40 Pro',
    views: 1500,
    dateAdded: '2025-05-28',
    price: 27999,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote: 'Official TECNO Bangladesh price for 8GB/256GB (VAT applicable).',
    specSheet: {
      basicInfo: {
        model: 'Camon 40 Pro',
        brand: 'Tecno',
        releaseDate: 'May 2025',
      },
      display: {
        type: 'AMOLED',
        size: '6.78 inches',
        resolution: '1080 x 2436 pixels',
        refreshRate: '144Hz',
        protection: 'Gorilla Glass 7i',
      },
      performance: {
        processor: 'MediaTek Dimensity 7300 (4nm)',
        ram: '8GB/12GB',
        storage: '256GB',
        os: 'Android 15, HiOS 15',
      },
      cameraSystem: {
        rear: '50MP (main, OIS) + 8MP (ultra-wide)',
        front: '50MP',
        features: [
          'OIS',
          '4K video recording',
          'AI portrait modes',
        ],
      },
      batteryCharging: {
        capacity: '5200mAh',
        charging: '45W wired',
      },
      buildDesign: {
        dimensions: 'TBD',
        weight: 'TBD',
        materials: 'Gorilla Glass 7i front, plastic back and frame, IP68/IP69',
        colors: ['Emerald Lake Green', 'Galaxy Black', 'Glacier White'],
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
        'Ask AI assistant',
        'AI Eraser',
        'AI Portrait',
        'AI Auto Snapshot',
      ],
      notableLimitations: [
        'Plastic back and frame',
        'No wireless charging',
        'HiOS ships with bloatware',
      ],
    },
  },
  {
    id: 6,
    title: 'Infinix Note 60 Pro',
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Infinix',
    imageAlt: 'Infinix Note 60 Pro',
    views: 1900,
    dateAdded: '2026-02-10',
    isDeal: true,
    price: 45499,
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
        colors: ['Mist Titanium', 'Midnight Black', 'Fizz Blue'],
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
    category: 'Smartphones',
    topCategory: 'Mobile',
    subCategory: 'Samsung',
    imageAlt: 'Samsung Galaxy Z Fold7 (placeholder image)',
    views: 2600,
    dateAdded: '2025-07-25',
    price: 154999,
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
    category: 'Accessories',
    topCategory: 'Gadget Accessories',
    subCategory: 'Sound',
    imageAlt: 'Sony WH-1000XM5 headphones (placeholder image)',
    views: 3100,
    dateAdded: '2022-05-20',
    isDeal: true,
    price: 29990,
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
    category: 'Gaming',
    topCategory: 'Gadget Accessories',
    subCategory: 'Other',
    imageAlt: 'PlayStation 5 Slim disc console (placeholder image)',
    views: 5400,
    dateAdded: '2023-11-10',
    isDeal: true,
    price: 100000,
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
    category: 'Accessories',
    topCategory: 'Gadget Accessories',
    subCategory: 'Cables & Adapters',
    imageAlt: 'UGREEN USB-C 5-in-1 hub (placeholder image)',
    views: 800,
    dateAdded: '2024-03-15',
    price: 3000,
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
    category: 'Gaming',
    topCategory: 'Gadget Accessories',
    subCategory: 'Computer Accessories',
    imageAlt: 'AULA F75 Pro wireless keyboard (placeholder image)',
    views: 1200,
    dateAdded: '2024-06-01',
    isDeal: true,
    price: 5200,
    oldPrice: 5800,
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
    category: 'Tablets',
    topCategory: 'Tablet',
    subCategory: 'Samsung',
    imageAlt: 'Samsung Galaxy Tab S10 Ultra (placeholder image)',
    views: 1400,
    dateAdded: '2024-10-05',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
    category: 'Tablets',
    topCategory: 'Tablet',
    subCategory: 'Apple',
    imageAlt: 'Apple iPad Air 11 M3 (placeholder image)',
    views: 2000,
    dateAdded: '2025-03-12',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
    category: 'Laptops',
    topCategory: 'PC',
    subCategory: 'Laptop',
    imageAlt: 'ASUS Vivobook 15 laptop (placeholder image)',
    views: 900,
    dateAdded: '2023-06-15',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
        processor: 'Intel Core i5-1335U (13th Gen)',
        ram: '8GB/16GB DDR4',
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
        colors: ['Quiet Blue', 'Cool Silver'],
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
    category: 'Desktops',
    topCategory: 'PC',
    subCategory: 'Desktop',
    imageAlt: 'Lenovo IdeaCentre AIO 27 desktop (placeholder image)',
    views: 600,
    dateAdded: '2024-01-20',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
        colors: ['Cloud Gray'],
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
    category: 'Wearables',
    topCategory: 'Smart Watch',
    subCategory: 'Xiaomi',
    imageAlt: 'Xiaomi Redmi Watch 5 (placeholder image)',
    views: 1700,
    dateAdded: '2025-01-15',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
        colors: ['Black', 'Silver', 'Blue'],
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
    category: 'Audio',
    topCategory: 'Earbuds',
    subCategory: 'AirPods',
    imageAlt: 'Apple AirPods Pro 3 (placeholder image)',
    views: 3600,
    dateAdded: '2025-09-24',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
    category: 'Audio',
    topCategory: 'Earbuds',
    subCategory: 'Bluetooth Earbuds',
    imageAlt: 'Anker Soundcore R50i earbuds (placeholder image)',
    views: 950,
    dateAdded: '2023-08-10',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
        colors: ['Black', 'White', 'Blue'],
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
    category: 'Cameras',
    topCategory: 'Camera',
    subCategory: 'Action Camera',
    imageAlt: 'DJI Osmo Action 5 Pro (placeholder image)',
    views: 1100,
    dateAdded: '2024-09-18',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
        colors: ['Standard', 'Adventure Combo'],
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
    category: 'Accessories',
    topCategory: 'Gadget Accessories',
    subCategory: 'Charging',
    imageAlt: 'Anker PowerCore 20000 power bank (placeholder image)',
    views: 1300,
    dateAdded: '2023-02-01',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
    category: 'Smart Home',
    topCategory: 'Home Accessories',
    subCategory: 'Cleaning Robot',
    imageAlt: 'Xiaomi Robot Vacuum S10 (placeholder image)',
    views: 1000,
    dateAdded: '2022-08-20',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
        colors: ['White'],
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
    category: 'Appliances',
    topCategory: 'Home Appliances',
    subCategory: 'Smart TV',
    imageAlt: 'Xiaomi Smart TV X Pro 55 (placeholder image)',
    views: 1500,
    dateAdded: '2023-04-18',
    price: null,
    oldPrice: null,
    priceEstimated: false,
    status: 'available',
    priceNote:
      'Sample catalog product — no confirmed Bangladesh price yet. Verify with retailers before launch.',
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
];

/** URL slug for a product title, e.g. 'HONOR Robot Phone' -> 'honor-robot-phone' */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
 * 'upcoming' products are announced but not yet officially available in
 * Bangladesh — they get a Pre-Order button instead of Buy Now everywhere.
 */
export function isUpcoming(p: Product): boolean {
  return p.status === 'upcoming';
}
