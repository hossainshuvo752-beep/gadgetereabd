import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { posts } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${name} Articles — Blog`,
    description: `TechBD articles in the ${name} category — reviews, guides, news, and explainers for Bangladesh.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const filteredPosts = posts.filter(post => post.category.toLowerCase() === category.toLowerCase());

  return (
    <section className="min-h-[calc(100vh-64px)] bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-text-heading mb-6">
          {category.charAt(0).toUpperCase() + category.slice(1)} Posts
        </h1>
        
        {filteredPosts.length === 0 ? (
          <p className="text-text-body text-center py-12">
            No posts found in the {category} category.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
            {/* Same shared ArticleCard as /blog and the homepage — one card,
                one image source, one 16:9 ratio. */}
            {filteredPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors">
            ← Back to All Posts
          </Link>
        </div>
      </div>
    </section>
  );
}