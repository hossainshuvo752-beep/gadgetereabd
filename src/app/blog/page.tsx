"use client";

import React, { useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
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
          {/* Filter Chips */}
          <div className="mb-4 flex flex-wrap gap-3">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSelectedFilter(option)}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
                  selectedFilter === option
                    ? 'bg-accent border-accent text-text-on-dark'
                    : 'bg-transparent border-text-heading/20 text-text-heading hover:border-accent hover:text-accent'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Article Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
            {filteredPosts.length === 0 && (
              <div className="col-span-4 text-center py-12 text-text-body">
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