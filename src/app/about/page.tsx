import React from 'react';
import Link from 'next/link';
import WhyTrustUs from '@/components/WhyTrustUs';

// Honest stats only — no fabricated review/reader counts.
const STATS = [
  { value: 'Est. 2026', label: 'Founded for Bangladeshi readers' },
  { value: '🇧🇩', label: 'Focused on the Bangladesh market' },
  { value: 'বাংলা + EN', label: 'Every piece in both languages' },
  { value: 'Hands-on', label: 'We test before we recommend' },
];

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us — Who We Are & Why You Can Trust Us',
  description:
    'TechBD is Bangladesh\u2019s honest source for gadget reviews, guides, and buying advice \u2014 hands-on testing, no paid bias, in Bangla and English.',
};

export default function AboutPage() {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-bg-light">
      {/* Heading + tagline — own wrapper; container classes are byte-identical
          to the content wrapper below, so left edges align exactly */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <h1 className="text-3xl font-bold text-text-heading mb-2">About TechBD</h1>
        <p className="text-text-body mb-8">
          Bangladesh&apos;s honest source for gadget reviews, guides, and buying advice.
        </p>
      </div>

      {/* Story card + stats — same container classes as the heading wrapper above
          (py-12 was split into pt-12/pb-12; horizontal classes identical) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Mission/story — full width box (stacked layout; the earlier
            side-by-side story+stats grid was reverted per user decision) */}
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-text-heading mb-4">Our Story</h2>
          <p className="text-text-body leading-relaxed mb-4">
            TechBD started because buying a laptop or phone in Bangladesh shouldn&apos;t feel like
            guesswork. Market prices shift from shop to shop, spec sheets get lost in translation,
            and sponsored posts drown out the honest voices. We&apos;re here to fix that — with
            reviews, guides, and buying advice written for Bangladeshi readers, not copied from
            foreign sites.
          </p>
          <p className="text-text-body leading-relaxed mb-4">
            In our first phase we&apos;re focused on what most of our readers actually buy and use
            every day: PCs, laptops, and everything Windows — from budget student laptops to
            programming and gaming builds. And because half the country thinks in Bangla, our
            content comes in both Bangla and English, side by side.
          </p>
          <p className="text-text-body leading-relaxed">
            Everything we recommend is tested hands-on before it goes live — real usage, real
            benchmarks, real battery runs. We don&apos;t run paid placements or sponsored
            &ldquo;reviews,&rdquo; and brands can&apos;t buy a verdict here. If a product has a
            flaw, we say so. If it isn&apos;t worth your taka, we say that too.
          </p>
        </div>

        {/* Stats row (honest facts only) — single 4-across row on md+,
            stacking to 2 columns on small screens */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 text-center"
            >
              <div className="text-xl font-bold text-accent mb-1">{stat.value}</div>
              <div className="text-xs text-text-body">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Same trust points as the homepage — imported, never duplicated */}
      <WhyTrustUs />

      {/* CTA — same container as WhyTrustUs so the edges align with the trust row.
          pb-24 (padding, not margin — margins can collapse through the section)
          keeps a clearly visible gap above the Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-bg-dark rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-text-on-dark mb-2">
            Ready for your next gadget decision?
          </h2>
          <p className="text-text-on-dark/70 mb-6">
            Read our latest reviews and guides, or browse the shop — no sponsored nonsense, ever.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/blog"
              className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Explore the Blog →
            </Link>
            <Link
              href="/shop"
              className="px-6 py-2.5 border border-text-on-dark/30 text-text-on-dark font-medium rounded-md hover:bg-text-on-dark/10 transition-colors"
            >
              Browse the Shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
