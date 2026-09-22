import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deals — Current Tech Discounts in Bangladesh',
  description:
    'Products currently on deal at TechBD, pulled live from the shared catalog.',
};

export default function DealsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
