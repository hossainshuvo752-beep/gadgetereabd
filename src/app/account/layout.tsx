import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your TechBD account.',
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
