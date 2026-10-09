import Link from 'next/link';
import type { QuickLookGuide } from '@/lib/quickLookContent';
import { CheckCircle2, XCircle, BookOpen, ArrowRight } from 'lucide-react';

/**
 * Long-form SEO guide section for /quick-look/[slug] — rendered BELOW the
 * spec content and above the footer, only when content exists for the
 * product's slug (products without an entry show nothing extra).
 *
 * SEO/AEO rules implemented here:
 * - The page's product title stays the only H1; this section starts at H2,
 *   sub-parts use H3 — heading levels never skip.
 * - Paragraph text is readable-length prose (max-w-prose) at article
 *   contrast (--color-text-article, same as blog posts).
 * - EVERYTHING is server-rendered text visible by default: no accordions,
 *   no collapsed panels, no hidden text. The FAQ cards are static.
 * - FAQPage JSON-LD is emitted by the page from the SAME faqs array this
 *   renders (schema mirrors visible content exactly).
 * - Colors come only from @theme tokens (accent orange, heading/body
 *   colors); the accent-soft classes use accent/10-style opacity, which
 *   still derives from the token.
 */
export default function QuickLookGuideSection({ guide }: { guide: QuickLookGuide }) {
  return (
    <section
      aria-label="Buying guide"
      className="border-t border-text-heading/10 bg-text-on-dark"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      {/* H2 + direct-answer lead (quotable by AI answer engines) */}
      <div className="max-w-prose">
        <h2 className="text-2xl md:text-3xl font-bold text-text-heading leading-tight">
          {guide.heading}
        </h2>
        <p className="mt-4 text-lg font-medium text-text-heading leading-relaxed">
          {guide.lead}
        </p>
        {guide.overview.map((p) => (
          <p key={p.slice(0, 40)} className="mt-4 text-text-article leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      {/* Price in Bangladesh — the money section */}
      <div className="mt-10 max-w-prose">
        <h3 className="text-xl md:text-2xl font-bold text-text-heading">
          {guide.priceSection.heading}
        </h3>
        <div className="mt-4 space-y-4">
          {guide.priceSection.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? 'text-text-article leading-relaxed' : 'text-text-body leading-relaxed'}>
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Key features — clean stacked feature blocks in a 2-up grid on md+ */}
      {guide.features.length > 0 && (
      <div className="mt-12">
        <h3 className="text-xl md:text-2xl font-bold text-text-heading">
          {guide.features[0].heading}
        </h3>
        <div className="mt-5 grid gap-4 md:gap-5 md:grid-cols-2">
          {guide.features.map((f) => (
            <div
              key={f.title}
              className="bg-bg-light border border-text-heading/10 rounded-lg p-5 card-lift"
            >
              <h4 className="text-base font-semibold text-text-heading mb-2">{f.title}</h4>
              <p className="text-sm text-text-article leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Who should buy / skip — two side-by-side cards, stacked on mobile */}
      <div className="mt-12">
        <h3 className="text-xl md:text-2xl font-bold text-text-heading">
          {guide.buyers.heading}
        </h3>
        <div className="mt-5 grid gap-4 md:gap-5 md:grid-cols-2">
          <div className="bg-bg-light border border-text-heading/10 rounded-lg p-5">
            <h4 className="text-base font-semibold text-text-heading mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent/10 text-accent">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              Who should buy the {guide.productName}
            </h4>
            <ul className="space-y-2">
              {guide.buyers.should.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-article leading-relaxed">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-bg-light border border-text-heading/10 rounded-lg p-5">
            <h4 className="text-base font-semibold text-text-heading mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-bg-dark-secondary/10 text-text-heading">
                <XCircle className="w-4 h-4" />
              </span>
              Who should skip it
            </h4>
            <ul className="space-y-2">
              {guide.buyers.skip.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-article leading-relaxed">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-text-body shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Pros & Cons — two cards with clear markers */}
      <div className="mt-12">
        <h3 className="text-xl md:text-2xl font-bold text-text-heading">
          {guide.pros.heading}
        </h3>
        <div className="mt-5 grid gap-4 md:gap-5 md:grid-cols-2">
          <div className="bg-bg-light border border-text-heading/10 rounded-lg p-5">
            <h4 className="text-base font-semibold text-text-heading mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-accent/10 text-accent">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              Pros
            </h4>
            <ul className="space-y-2">
              {guide.pros.pros.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-article leading-relaxed">
                  <CheckCircle2 className="mt-0.5 w-4 h-4 text-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-bg-light border border-text-heading/10 rounded-lg p-5">
            <h4 className="text-base font-semibold text-text-heading mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-danger/10 text-danger">
                <XCircle className="w-4 h-4" />
              </span>
              Cons
            </h4>
            <ul className="space-y-2">
              {guide.pros.cons.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-article leading-relaxed">
                  <XCircle className="mt-0.5 w-4 h-4 text-danger shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Buying tips for Bangladesh */}
      <div className="mt-12 max-w-prose">
        <h3 className="text-xl md:text-2xl font-bold text-text-heading">
          {guide.buyingTips.heading}
        </h3>
        <div className="mt-4 space-y-4">
          {guide.buyingTips.paragraphs.map((p, i) => (
            <p key={i} className="text-text-article leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* FAQ — static, visible answers (no accordion), matches JSON-LD exactly */}
      <div className="mt-12 max-w-prose">
        <h3 className="text-xl md:text-2xl font-bold text-text-heading">
          Frequently asked questions: {guide.productName}
        </h3>
        <div className="mt-5 space-y-4">
          {guide.faqs.map((faq) => (
            <div key={faq.question} className="bg-bg-light border border-text-heading/10 rounded-lg p-5">
              <h4 className="text-base font-semibold text-text-heading">{faq.question}</h4>
              <p className="mt-2 text-sm text-text-article leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keep exploring — internal link cards */}
      <div className="mt-12">
        <h3 className="text-xl md:text-2xl font-bold text-text-heading flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          Keep exploring
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guide.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-bg-light border border-text-heading/10 rounded-lg p-4 card-lift"
            >
              <span className="block text-sm font-semibold text-text-heading group-hover:text-accent transition-colors">
                {link.label}
              </span>
              <span className="mt-1 block text-xs text-text-body">{link.description}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                View
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
