import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Arrivals — Latest Gadgets at TechBD',
  description:
    'The newest products in the TechBD catalog, listed automatically as they are added.',
};

export default function NewArrivalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
