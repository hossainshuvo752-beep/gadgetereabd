import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your TechBD order has been placed successfully.',
  robots: { index: false },
};

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
