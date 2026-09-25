/**
 * THE single source of truth for the Shop page's category filter tree.
 * Top-level categories match the product taxonomy in src/lib/products.ts
 * (Product.topCategory), and each top-level category lists its
 * sub-categories (Product.subCategory).
 *
 * Notes on the tree:
 * - 'Mobile', 'Tablet', and 'Smart Watch' are brand-wise sub-filters. The
 *   Mobile list is the complete 15-brand roster (some brands may have no
 *   products yet — the grid shows a clean empty state for those).
 * - 'Other' exists under Gadget Accessories as a catch-all so every
 *   product in the catalog is reachable (e.g. gaming consoles) even when
 *   no named sub-category fits.
 */
export interface CategoryNode {
  name: string;
  subs: string[];
}

export const categoryTree: CategoryNode[] = [
  {
    name: 'Mobile',
    subs: [
      'Samsung',
      'Xiaomi',
      'Apple',
      'Google',
      'Huawei',
      'Realme',
      'OnePlus',
      'Oppo',
      'Vivo',
      'Nokia',
      'Motorola',
      'Tecno',
      'Infinix',
      'Walton',
      'Symphony',
    ],
  },
  {
    name: 'Tablet',
    subs: ['Samsung', 'Apple', 'Xiaomi', 'Lenovo', 'Other'],
  },
  {
    name: 'PC',
    subs: ['Laptop', 'Desktop'],
  },
  {
    name: 'Smart Watch',
    subs: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Other'],
  },
  {
    name: 'Earbuds',
    subs: ['AirPods', 'Bluetooth Earbuds', 'Neckband', 'Wired Earphones'],
  },
  {
    name: 'Camera',
    subs: ['Action Camera', 'Digital Camera'],
  },
  {
    name: 'Gadget Accessories',
    subs: [
      'Sound',
      'Charging',
      'Cables & Adapters',
      'Protection',
      'Computer Accessories',
      'Photography Accessories',
      'Other',
    ],
  },
  {
    name: 'Home Accessories',
    subs: [
      'Smart Desk Lamp',
      'Cleaning Robot',
      'Air Purifier',
      'Smart Home Devices',
    ],
  },
  {
    name: 'Home Appliances',
    subs: ['Smart TV', 'Refrigerator', 'AC', 'Washing Machine'],
  },
];

/** Top-level category names in sidebar order. */
export const topLevelCategories: string[] = categoryTree.map((c) => c.name);

/** Sub-categories for a top-level category (empty array if unknown). */
export function getSubCategories(topCategory: string): string[] {
  return categoryTree.find((c) => c.name === topCategory)?.subs ?? [];
}
