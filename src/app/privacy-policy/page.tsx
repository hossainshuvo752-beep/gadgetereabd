import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How TechBD handles your data, cookies, and privacy.',
};

/**
 * Privacy Policy — generic placeholder text for now. Replace with real
 * legal review before launch.
 */

const LAST_UPDATED = 'September 19, 2026';

type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

const SECTIONS: LegalSection[] = [
  {
    heading: '1. Introduction',
    paragraphs: [
      'TechBD ("we", "our", "us") operates this website to provide gadget reviews, guides, and buying advice for readers in Bangladesh. This Privacy Policy explains what information we collect, how we use it, and the choices you have.',
      'This is placeholder policy text intended as a starting template. It is not legal advice, and it will be replaced with a reviewed policy before any personal data is actively collected.',
    ],
  },
  {
    heading: '2. Information We Collect',
    paragraphs: [
      'We may collect the following types of information when you use the site:',
    ],
    bullets: [
      'Information you provide voluntarily — for example, your name, email address, and message when you use the contact form or newsletter signup.',
      'Basic usage data — such as pages visited, approximate region, browser type, and device category, generally collected through analytics tools.',
      'Local storage data — small values stored in your own browser (such as session preferences) to remember choices like whether a popup has been shown.',
    ],
  },
  {
    heading: '3. How We Use Information',
    paragraphs: ['We use collected information only to:'],
    bullets: [
      'Respond to your questions, feedback, and review requests.',
      'Send newsletters or updates you have explicitly subscribed to.',
      'Understand which content is useful so we can improve the site.',
      'Keep the site secure and prevent misuse.',
    ],
  },
  {
    heading: '4. Cookies and Analytics',
    paragraphs: [
      'We may use cookies and similar technologies for analytics and to remember your preferences. You can disable cookies in your browser settings; the site will remain readable, though some convenience features may not persist.',
    ],
  },
  {
    heading: '5. Third-Party Links',
    paragraphs: [
      'Our reviews and guides may link to third-party retailers and manufacturers. We are not responsible for the privacy practices of those websites. When you leave our site, the privacy policy of the destination site applies.',
    ],
  },
  {
    heading: '6. Data Sharing',
    paragraphs: [
      'We do not sell your personal information. If, in the future, we share data with service providers (for example, an email newsletter provider), it will be limited to what is necessary to deliver the service and covered in an updated version of this policy.',
    ],
  },
  {
    heading: '7. Data Security and Retention',
    paragraphs: [
      'We take reasonable measures to protect any information we hold. Because the site is in an early phase, no sensitive personal or payment data is collected or stored. Information you submit through demo forms on this site is not persisted.',
    ],
  },
  {
    heading: '8. Children’s Privacy',
    paragraphs: [
      'The site is not directed at children under 13, and we do not knowingly collect personal information from children.',
    ],
  },
  {
    heading: '9. Your Choices',
    paragraphs: ['You can:'],
    bullets: [
      'Unsubscribe from our newsletter at any time using the link in any email.',
      'Ask us to delete information you have sent us by contacting hello@techbd.com.',
      'Clear stored session data in your browser at any time.',
    ],
  },
  {
    heading: '10. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy as the site evolves. The "Last updated" date at the top of this page will always reflect the current version, and significant changes will be highlighted on the homepage.',
    ],
  },
  {
    heading: '11. Contact',
    paragraphs: [
      'Questions about this policy can be sent to hello@techbd.com (placeholder address) or through the contact page.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-body mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-bold text-text-heading mb-3">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph, i) => (
                <p key={i} className="text-text-body leading-relaxed mb-3">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc list-inside space-y-2 text-text-body">
                  {section.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
