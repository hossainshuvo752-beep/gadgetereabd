"use client";

import Link from 'next/link';
import { posts } from '@/lib/posts';
import PostMeta from '@/components/PostMeta';
import Hero from '@/components/Hero';
import ShopTeaser from '@/components/ShopTeaser';
import TrendingPosts from '@/components/TrendingPosts';
import BuyingGuideHighlight from '@/components/BuyingGuideHighlight';
import WhyTrustUs from '@/components/WhyTrustUs';
import NewsletterBanner from '@/components/NewsletterBanner';
import HomeFAQ from '@/components/HomeFAQ';
import Testimonials from '@/components/Testimonials';

export default function Home() {
  // Featured post for the Hero section (first post)
  const featuredPost = posts[0];

  // Latest Posts grid: default sort most-viewed first (views are simulated
  // for now). Copied before sorting — never mutate the shared posts array.
  const latestPosts = [...posts].sort((a, b) => b.views - a.views);

  return (
    <>
      <Hero post={featuredPost} />
      {/* pt-6: small breathing gap above the heading so it doesn't sit tight
          against the section boundary below the Hero. */}
      <section className="pt-6 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-heading mb-6">
            Latest Posts
          </h2>
          {/* MOBILE: 2-col grid of compact title-only cards (same treatment
              as the /blog page). DESKTOP: unchanged 2→3 column grid. */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
                  <div className="h-36 md:h-48 bg-bg-dark-secondary/10 flex items-center justify-center">
                    <span className="text-text-body text-sm">{post.imageAlt}</span>
                  </div>
                  <div className="p-3 md:p-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-accent text-text-on-dark rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-sm md:text-xl font-bold text-text-heading mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="hidden md:line-clamp-2 text-text-body leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    {/* Two-line meta (avatar+author / date•readTime) */}
                    <PostMeta date={post.date} readTime={post.readTime} />
                  </div>
                </div>
              </Link>
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
