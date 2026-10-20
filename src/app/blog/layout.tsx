import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';
import { DEFAULT_OG_IMAGE } from '@/lib/siteOgImage';

/**
 * Blog index metadata. The title carries "Bangladesh" like every other
 * blog page (a blog page without it is what the SEO guard flags), and it is
 * rendered ABSOLUTE so the root layout's " | Jupiter BD" suffix cannot push
 * it past 60 characters. Description and social tags mirror each other.
 */
const BLOG_TITLE = 'Blog: Tech Reviews & Buying Guides for Bangladesh';
const BLOG_DESCRIPTION =
  'The latest gadget reviews, tech news, and buying guides for Bangladesh from the Jupiter BD team.';

export const metadata: Metadata = {
  title: { absolute: BLOG_TITLE },
  description: BLOG_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: `${SITE_URL}/blog`,
    images: [{ ...DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
