import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { posts } from '@/lib/posts';
import { SITE_URL } from '@/lib/siteUrl';
import { DEFAULT_OG_IMAGE } from '@/lib/siteOgImage';
import ArticleCard from '@/components/ArticleCard';
import { createAltOccurrenceTracker, nextOccurrence, type AltOccurrenceTracker } from '@/lib/imageAlt';
import Hero from '@/components/Hero';
import HomeSectionHeading from '@/components/HomeSectionHeading';
import ShopTeaser from '@/components/ShopTeaser';
import TrendingPosts from '@/components/TrendingPosts';
import BrowseCategories from '@/components/BrowseCategories';
import BuyingGuideHighlight from '@/components/BuyingGuideHighlight';
import WhyTrustUs from '@/components/WhyTrustUs';
import NewsletterBanner from '@/components/NewsletterBanner';
import HomeFAQ from '@/components/HomeFAQ';
import Testimonials from '@/components/Testimonials';
import JsonLd from '@/components/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/schema';

/**
 * Homepage metadata.
 *
 * `title.absolute` is used ON PURPOSE: the root layout's template appends
 * "| Jupiter BD", which would duplicate the brand name in a title that
 * already starts with it. Description and the social title/description are
 * the SAME strings for og: and twitter: so a shared link renders
 * identically wherever it is pasted.
 */
const HOME_TITLE = 'Jupiter BD: Gadget Prices, Specs & Reviews in Bangladesh';
const HOME_DESCRIPTION =
  'Check phone and gadget prices in Bangladesh, full specs, honest reviews and buying guides. Prices for official and unofficial models.';

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  // Self-referencing canonical on the canonical origin (https://jupiter.bd).
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    images: [{ ...DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

/**
 * Homepage. Server component so the route can export metadata (a client
 * page cannot) — every interactive section below is its own client
 * component, so nothing here needs the directive.
 */
export default function Home() {
  // Featured post for the Hero section (first post)
  const featuredPost = posts[0];

  // Latest Posts grid: default sort most-viewed first (views are simulated
  // for now), capped at 8 — the homepage never shows more than one grid
  // (2 rows) of cards. Copied before sorting — never mutate shared posts.
  const latestPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 8);

  // Page-scoped alt-occurrence tracker: the same post image may appear in
  // several homepage sections (Hero + Latest Posts + Trending Now + Buying
  // Guides); the tracker gives each placement a distinct "card N" alt so
  // no two <img> on the page share identical alt text (a11y + SEO rule).
  // Passed down into the section components that render post images.
  const altTracker: AltOccurrenceTracker = createAltOccurrenceTracker();
  // The Hero's image counts as this post image's first placement.
  void nextOccurrence(altTracker, featuredPost.id);

  return (
    <>
      {/* Site-wide identity + searchbox schema (AEO Standards item 8). */}
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <Hero post={featuredPost} />
      {/* Latest Posts section — now owns the page's H1 directly above the
          post grid (the old slim intro strip and separate "Latest Posts"
          heading were merged into this one centered heading block; no
          orphan strip or divider remains between hero and grid). The hero
          headline stays h2. */}
      <section className="pt-8 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered heading pair via the SHARED homepage component — same
              sizes/weights/spacing as every other section title. */}
          <HomeSectionHeading
            title="Gadget Prices, Specs & Reviews in Bangladesh"
            support="Official & unofficial prices, full specs and honest guides"
          />
          {/* MOBILE: 2-col grid of compact title-only cards. DESKTOP:
              4-up like the /blog page — keeps card images compact (16:9).
              Renders the SAME ArticleCard used on /blog — one shared card,
              one shared image source. Grid cards, order and links are
              unchanged. */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
            {latestPosts.map((post, i) => (
              // Staggered entrance (shared .fade-up utility in globals.css) —
              // capped at 50ms steps so 8 cards never feel slow.
              <div key={post.id} className="fade-up" style={{ '--stagger-delay': `${Math.min(i * 50, 350)}ms` } as CSSProperties}>
                <ArticleCard post={post} occurrence={nextOccurrence(altTracker, post.id)} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <ShopTeaser />
      <NewsletterBanner />
      <div className="mt-12">
        <TrendingPosts altTracker={altTracker} />
      </div>
      {/* Category + Quick Look navigation, directly below Trending Picks.
          (The newsletter banner renders ABOVE Trending Picks on this page —
          it was not moved, so no existing section's order changed.) */}
      <BrowseCategories />
      <BuyingGuideHighlight altTracker={altTracker} />
      <WhyTrustUs />
      <Testimonials />
      <HomeFAQ />
    </>
  );
}
