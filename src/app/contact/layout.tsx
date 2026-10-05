import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Jupiter BD team — questions, corrections, feedback, and partnership inquiries.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
