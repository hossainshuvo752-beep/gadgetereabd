import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Arrivals — Latest Gadgets at Jupiter BD',
  description:
    'The newest products in the Jupiter BD catalog, listed automatically as they are added.',
};

export default function NewArrivalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
