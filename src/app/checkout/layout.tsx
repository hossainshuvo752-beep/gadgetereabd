import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your TechBD order — cash on delivery, bKash, and Nagad supported.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
