import React from 'react';

const NewsletterBanner: React.FC = () => {
  return (
    <section className="bg-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-text-on-dark mb-4">
          Get Weekly Tech Deals & Updates 🔥
        </h2>
        <p className="text-center text-text-on-dark/70 mb-6">
          Subscribe for exclusive reviews, new arrivals and tech tips
        </p>
        <div className="flex flex-col items-center">
          <form className="flex items-center gap-0">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 rounded-l-lg border border-text-heading/10 bg-text-on-dark px-4 text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="h-12 rounded-r-lg bg-accent px-6 text-text-on-dark font-medium hover:bg-accent-hover"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-2 text-text-on-dark/50 text-sm">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBanner;
