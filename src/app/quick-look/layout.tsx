import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import { DEFAULT_OG_IMAGE } from '@/lib/siteOgImage';

/**
 * Listing-page metadata for /quick-look. Worded to cover the WHOLE catalog
 * (phones, laptops, audio, accessories, appliances) rather than phones * only — the route serves every product type. Title/description mirror to * og:/twitter: exactly as the Home page does so a shared link renders * identically. */
export const metadata: Metadata = {
  title: 'Quick Look — Gadget Specs & Prices in Bangladesh',
  description:
    'Spec sheets and prices for phones, laptops, audio, wearables and smart-home gadgets in Bangladesh.',
  alternates: { canonical: `${SITE_URL}/quick-look` },
  openGraph: {
    title: 'Quick Look — Gadget Specs & Prices in Bangladesh',
    description:
      'Spec sheets and prices for phones, laptops, audio, wearables and smart-home gadgets in Bangladesh.',
    url: `${SITE_URL}/quick-look`,
    images: [{ ...DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick Look — Gadget Specs & Prices in Bangladesh',
    description:
      'Spec sheets and prices for phones, laptops, audio, wearables and smart-home gadgets in Bangladesh.',
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function QuickLookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
