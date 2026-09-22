import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions',
  description:
    'Answers to common questions about TechBD: reviews, testing, ordering, payments, and delivery in Bangladesh.',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
