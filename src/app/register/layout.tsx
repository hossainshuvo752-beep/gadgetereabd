import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Register for a TechBD account.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
