import React from 'react';
import Link from 'next/link';
import { posts } from '@/lib/posts';

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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <div className="bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="h-48 bg-bg-dark-secondary/10 flex items-center justify-center">
                    <span className="text-text-body text-sm">{post.imageAlt}</span>
                  </div>
                  <div className="p-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent-hover rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-bold text-text-heading mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-text-body leading-relaxed mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-text-body">
                      <span>By TechBD Team</span>
                      <span className="mx-2">•</span>
                      <span>{post.date}</span>
                      <span className="mx-2">•</span>
                      <span>{post.readTime}</span>
                    </div>
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