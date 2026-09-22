"use client";

import React, { useState } from 'react';
import JsonLd from '@/components/JsonLd';
import { faqSchema } from '@/lib/schema';

const HomeFAQ: React.FC = () => {
  const faqs = [
    {
      id: 1,
      question: 'What kind of products does TechBD review?',
      answer: 'We review a wide range of consumer electronics including smartphones, laptops, audio devices, gaming accessories, and smart home gadgets available in Bangladesh.',
    },
    {
      id: 2,
      question: 'Are your reviews sponsored?',
      answer: 'No, our reviews are never sponsored. We maintain strict editorial independence and never accept payment for positive reviews.',
    },
    {
      id: 3,
      question: 'Can I buy products directly from TechBD?',
      answer: 'TechBD is a review and information platform. We do not sell products directly, but we provide links to trusted retailers where you can purchase reviewed items.',
    },
    {
      id: 4,
      question: 'Do you cover both Bangla and English content?',
      answer: 'Yes, we provide content in both Bangla and English to serve all Bangladeshi tech enthusiasts. Language toggles are available on applicable articles.',
    },
    {
      id: 5,
      question: 'How often do you publish new reviews?',
      answer: 'We publish new reviews and tech articles multiple times per week, with a focus on timely coverage of new product launches and market trends.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mb-12 bg-bg-light">
      {/* FAQPage schema — same array the accordion renders (exact match rule). */}
      <JsonLd data={faqSchema(faqs)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-text-heading mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-text-heading/10 rounded-lg overflow-hidden shadow-sm bg-text-on-dark">
              <div
                className="flex items-center justify-between p-4 bg-text-on-dark cursor-pointer hover:bg-bg-light"
                onClick={() => toggleAccordion(faq.id)}
              >
                <h3 className="text-lg font-medium text-text-heading flex-1">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === faq.id ? (
                    <svg className="h-5 w-5 text-accent transition-transform duration-200 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-accent transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
              {openIndex === faq.id && (
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
};

export default HomeFAQ;
