import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search TechBD articles and products.',
  robots: { index: false },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
