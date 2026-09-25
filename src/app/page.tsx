"use client";

import Link from 'next/link';
import { posts } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import Hero from '@/components/Hero';
import ShopTeaser from '@/components/ShopTeaser';
import TrendingPosts from '@/components/TrendingPosts';
import BuyingGuideHighlight from '@/components/BuyingGuideHighlight';
import WhyTrustUs from '@/components/WhyTrustUs';
import NewsletterBanner from '@/components/NewsletterBanner';
import HomeFAQ from '@/components/HomeFAQ';
import Testimonials from '@/components/Testimonials';
import JsonLd from '@/components/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/schema';

export default function Home() {
  // Featured post for the Hero section (first post)
  const featuredPost = posts[0];

  // Latest Posts grid: default sort most-viewed first (views are simulated
  // for now). Copied before sorting — never mutate the shared posts array.
  const latestPosts = [...posts].sort((a, b) => b.views - a.views);

  return (
    <>
      {/* Site-wide identity + searchbox schema (AEO Standards item 8). */}
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <Hero post={featuredPost} />
      {/* pt-6: small breathing gap above the heading so it doesn't sit tight
          against the section boundary below the Hero. */}
      <section className="pt-6 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-heading mb-6">
            Latest Posts
          </h2>
          {/* MOBILE: 2-col grid of compact title-only cards. DESKTOP:
              4-up like the /blog page — keeps card images compact (16:9).
              Renders the SAME ArticleCard used on /blog — one shared card,
              one shared image source. */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
            {latestPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>
      <ShopTeaser />
      <NewsletterBanner />
      <div className="mt-12">
        <TrendingPosts />
      </div>
      <BuyingGuideHighlight />
      <WhyTrustUs />
      <Testimonials />
      <HomeFAQ />
    </>
  );
}
