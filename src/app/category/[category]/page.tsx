import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { posts } from '@/lib/posts';
import PostMeta from '@/components/PostMeta';

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
            {/* Same compact card treatment as ArticleCard/blog listing */}
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="h-36 md:h-48 bg-bg-dark-secondary/10 flex items-center justify-center">
                    <span className="text-text-body text-sm">{post.imageAlt}</span>
                  </div>
                  <div className="p-3 md:p-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent-hover rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-sm md:text-xl font-bold text-text-heading mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="hidden md:line-clamp-2 text-text-body leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <PostMeta date={post.date} readTime={post.readTime} />
                  </div>
                </div>
              </Link>
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