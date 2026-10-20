import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import { DEFAULT_OG_IMAGE } from '@/lib/siteOgImage';

/**
 * Listing-page metadata for /quick-look. Worded to cover the WHOLE catalog
 * (phones, laptops, audio, accessories, appliances) rather than phones only,
 * and to match how these pages are actually searched: the price-lookup
 * phrase carries the year and the catalogue name. Title/description mirror
 * to og:/twitter: exactly as the Home page does so a shared link renders
 * identically.
 */
const LISTING_TITLE = 'Phone & Gadget Prices in Bangladesh 2026: Quick Look';
const LISTING_DESCRIPTION =
  'Prices, specs and buying guides for phones, laptops, audio and smart-home gadgets in Bangladesh, with official and estimated prices.';

export const metadata: Metadata = {
  // Absolute: the 52-char title would break the 60-char budget once the
  // root layout appended " | Jupiter BD".
  title: { absolute: LISTING_TITLE },
  description: LISTING_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/quick-look` },
  openGraph: {
    title: LISTING_TITLE,
    description: LISTING_DESCRIPTION,
    url: `${SITE_URL}/quick-look`,
    images: [{ ...DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: LISTING_TITLE,
    description: LISTING_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function QuickLookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
