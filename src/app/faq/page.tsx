"use client";

import React, { useState } from 'react';
import JsonLd from '@/components/JsonLd';
import { track } from '@/lib/tracking';
import { faqSchema } from '@/lib/schema';

/**
 * Site-wide FAQ page — same accordion pattern as the HomeFAQ component
 * (single-open accordion, chevron icon), with general site questions.
 */

type FaqItem = {
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    question: 'What is TechBD?',
    answer:
      'TechBD is Bangladesh\u2019s honest source for gadget reviews, guides, and buying advice — written for Bangladeshi readers, in both Bangla and English.',
  },
  {
    question: 'Are your reviews sponsored or paid for?',
    answer:
      'No. Our reviews are never sponsored. We test products hands-on and publish our own verdicts. If a product was loaned or provided for testing, that is disclosed in the review.',
  },
  {
    question: 'Why do some products show no price?',
    answer:
      'We only show prices we can stand behind. When official Bangladesh pricing is not confirmed yet, the product is marked "Coming Soon / Price Unavailable in Bangladesh" instead of guessing.',
  },
  {
    question: 'Can I buy products directly from TechBD?',
    answer:
      'Not yet. TechBD is primarily a review and information platform. The shop, cart, and checkout on this site are early demos — no real orders are fulfilled and no payments are processed.',
  },
  {
    question: 'Do you cover content in Bangla as well as English?',
    answer:
      'Yes. Serving readers in both Bangla and English is one of our core principles, and new content is planned in both languages.',
  },
  {
    question: 'What kind of products do you review?',
    answer:
      'In our first phase we focus on PCs, laptops, and everything Windows — from budget student laptops to programming and gaming builds — with smartphones and accessories alongside.',
  },
  {
    question: 'How do you decide what to review next?',
    answer:
      'A mix of what our community asks for and what is launching in the Bangladeshi market. Request a review through the contact page — community requests get priority.',
  },
  {
    question: 'How can I contact the TechBD team?',
    answer:
      'Use the contact page form or email hello@techbd.com (placeholder address for now). We read every message.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      {/* FAQPage schema — same FAQS array the accordion renders, so the
          marked-up Q&As match the visible content exactly. */}
      <JsonLd data={faqSchema(FAQS)} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-text-body mb-8">
          Everything you might want to know about TechBD.
        </p>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={faq.question}
              className="border border-text-heading/10 rounded-lg overflow-hidden shadow-sm bg-text-on-dark"
            >
              <button
                type="button"
                onClick={() => {
                  toggleAccordion(index);
                  track('faq_expand', { question: faq.question.slice(0, 80) });
                }}
                aria-expanded={openIndex === index}
                className="flex items-center justify-between gap-4 w-full p-4 text-left cursor-pointer hover:bg-bg-light transition-colors"
              >
                <h2 className="text-lg font-medium text-text-heading flex-1">
                  {faq.question}
                </h2>
                <span className="flex-shrink-0" aria-hidden="true">
                  {openIndex === index ? (
                    <svg className="h-5 w-5 text-accent transition-transform duration-200 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-accent transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-text-body">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
