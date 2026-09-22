import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Tech Reviews, News & Buying Guides',
  description:
    'The latest gadget reviews, tech news, and buying guides for Bangladesh from the TechBD team.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
