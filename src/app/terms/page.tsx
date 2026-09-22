import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms that govern your use of the TechBD website.',
};

/**
 * Terms & Conditions — generic placeholder text for now. Replace with real
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
    heading: '1. Acceptance of Terms',
    paragraphs: [
      'By accessing or using TechBD, you agree to these Terms & Conditions. If you do not agree, please do not use the site.',
      'This is placeholder terms text intended as a starting template. It is not legal advice and will be replaced with a reviewed version before commercial features go live.',
    ],
  },
  {
    heading: '2. About TechBD',
    paragraphs: [
      'TechBD is an independent technology publication for readers in Bangladesh. We publish reviews, guides, news, and buying advice, focused first on PCs, laptops, and the Windows ecosystem.',
    ],
  },
  {
    heading: '3. Editorial Independence',
    paragraphs: [
      'Our reviews are written independently. We do not accept payment in exchange for positive coverage, and manufacturers do not approve or preview our content before publication. Where a product was provided free of charge for testing, that will be disclosed in the review itself.',
    ],
  },
  {
    heading: '4. Shop and Product Pages',
    paragraphs: [
      'Product listings, prices, and availability shown on this site are illustrative while the site is in development. Prices marked "Coming Soon / Price Unavailable" mean we have not confirmed official Bangladesh pricing yet.',
      'Ordering, cart, and checkout features on this site are demonstrations only. No real order is fulfilled and no payment is processed.',
    ],
  },
  {
    heading: '5. Purchases from Third-Party Retailers',
    paragraphs: [
      'If we link to external retailers or marketplaces, any purchase you make is a transaction between you and that retailer, governed by their own terms, pricing, warranty, and return policies. TechBD is not a party to those transactions and is not responsible for them.',
    ],
  },
  {
    heading: '6. Intellectual Property',
    paragraphs: [
      'All original content on this site — reviews, articles, guides, graphics, and code — is owned by TechBD unless otherwise stated. You may share and quote our content with clear attribution and a link back. Republishing substantial portions of our content without permission is not allowed.',
      'Product names, brands, and trademarks mentioned on this site belong to their respective owners.',
    ],
  },
  {
    heading: '7. User Contributions',
    paragraphs: [
      'If you submit comments, feedback, review requests, or messages through our forms, you grant us a non-exclusive right to use and respond to that submission. Do not submit unlawful, defamatory, or infringing content.',
    ],
  },
  {
    heading: '8. Accuracy and Availability',
    paragraphs: [
      'We work hard to keep specs, prices, and availability accurate, but technology changes fast and errors happen. Content is provided for general information only — always verify critical details (price, warranty, spec) with the retailer or manufacturer before purchasing.',
    ],
  },
  {
    heading: '9. Disclaimers',
    paragraphs: [
      'The site and its content are provided "as is" without warranties of any kind, express or implied, including fitness for a particular purpose. Use of the site is at your own risk.',
    ],
  },
  {
    heading: '10. Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by law, TechBD and its contributors will not be liable for any indirect, incidental, or consequential damages arising from your use of the site or reliance on its content, including purchasing decisions.',
    ],
  },
  {
    heading: '11. Governing Law',
    paragraphs: [
      'These terms are governed by the laws of the People\'s Republic of Bangladesh. Any disputes will be handled in the courts of Bangladesh.',
    ],
  },
  {
    heading: '12. Changes to These Terms',
    paragraphs: [
      'We may update these Terms & Conditions as the site grows. The "Last updated" date above reflects the current version.',
    ],
  },
  {
    heading: '13. Contact',
    paragraphs: [
      'Questions about these terms can be sent to hello@techbd.com (placeholder address) or through the contact page.',
    ],
  },
];

export default function TermsPage() {
  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">
          Terms &amp; Conditions
        </h1>
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
