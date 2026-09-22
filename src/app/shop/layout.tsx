import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop — Gadgets, Laptops & Accessories in Bangladesh',
  description:
    "Browse TechBD's curated selection of phones, laptops, accessories, and smart home tech with transparent Bangladesh pricing.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
