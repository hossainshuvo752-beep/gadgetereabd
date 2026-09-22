import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quick Look — Phone Spec Sheets & Prices in Bangladesh',
  description:
    'Spec sheets, variants, and prices for the phones everyone is asking about in Bangladesh.',
};

export default function QuickLookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
