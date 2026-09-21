"use client";

import React, { useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
import ScrollHint from '@/components/ScrollHint';
import Link from 'next/link';
import { posts } from '@/lib/posts';
import NewsletterPopup from '@/components/NewsletterPopup';

const Blog: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Filtered posts based on selectedFilter, default-sorted most-viewed
  // first (views are simulated for now) WITHIN the active category filter.
  const filteredPosts = posts
    .filter((post) => {
      if (selectedFilter === 'All') return true;
      return post.category === selectedFilter;
    })
    .sort((a, b) => b.views - a.views);

  // Fixed site taxonomy — the chips must always show exactly these five.
  // ('Review' has no posts yet; its grid shows the friendly empty state
  // instead of the chip disappearing, as happened with the old derived list.)
  const filterOptions = ['All', 'Review', 'Guide', 'News', 'Explainer'];

  return (
    <>
      <main className="min-h-[calc(100vh-64px)] bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filter Chips — MOBILE: one swipeable line with the fade +
              chevron scroll indicator (hides at the row's end). DESKTOP:
              unchanged wrap behavior. */}
          <ScrollHint
            ariaLabel="Blog categories"
            wrapperClassName="mb-4"
            className="md:flex-wrap md:overflow-visible items-center gap-2 md:gap-3 -mx-4 px-4 md:mx-0 md:px-0"
          >
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedFilter(option)}
                className={`shrink-0 whitespace-nowrap px-2.5 py-1.5 text-xs md:px-4 md:py-2 md:text-sm font-medium rounded-md border transition-colors duration-200 ${
                  selectedFilter === option
                    ? 'bg-accent border-accent text-text-on-dark'
                    : 'bg-transparent border-text-heading/20 text-text-heading hover:border-accent hover:text-accent'
                }`}
              >
                {option}
              </button>
            ))}
          </ScrollHint>

          {/* Article Grid — MOBILE: 2 columns (cards go compact via
              ArticleCard's mobile rules). DESKTOP: unchanged. */}
          <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
            {filteredPosts.length === 0 && (
              <div className="col-span-2 md:col-span-4 text-center py-12 text-text-body">
                No posts found for {selectedFilter === 'All' ? 'this category' : selectedFilter + ' category'}.
              </div>
            )}
          </div>
        </div>
      </main>
      <NewsletterPopup />
    </>
  );
};

export default Blog;