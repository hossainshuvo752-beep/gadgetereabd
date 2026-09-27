'use client';

import React, { useState } from 'react';

type Faq = { question: string; answer: string };

/**
 * FAQ accordion for blog post detail pages — same single-open interaction
 * pattern as HomeFAQ (chevron rotates open) and the /faq page, extracted
 * here because those are page-owned, while post pages need a reusable,
 * data-driven version fed by the post's `faqs` array.
 *
 * NO JsonLd here: the post page already emits FAQPage schema from the SAME
 * faqs array it passes to this component (exact-match rule) — emitting it
 * again here would duplicate the schema block.
 */
const PostFaqAccordion: React.FC<{ faqs: Faq[] }> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-text-heading mb-6">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div
            key={faq.question}
            className="border border-text-heading/10 rounded-lg overflow-hidden shadow-sm bg-text-on-dark"
          >
            <div
              className="flex items-center justify-between p-4 bg-text-on-dark cursor-pointer hover:bg-bg-light"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenIndex(openIndex === i ? null : i);
                }
              }}
            >
              <h3 className="text-base md:text-lg font-medium text-text-heading flex-1">
                {faq.question}
              </h3>
              <div className="flex-shrink-0 ml-3">
                {openIndex === i ? (
                  <svg className="h-5 w-5 text-accent transition-transform duration-200 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-accent transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
            {/* Smooth expand/collapse via the shared grid-rows transition
                (globals.css .accordion-panel) — no height snap. */}
            <div className="accordion-panel" data-open={openIndex === i}>
              <div>
                <div className="px-4 pb-4 text-text-body">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PostFaqAccordion;
