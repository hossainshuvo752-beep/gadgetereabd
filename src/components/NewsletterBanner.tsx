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
          {/* MOBILE: stacked full-width form — the side-by-side row's min-width
              (~330px from input placeholder + button) overflowed the px-4
              container on small phones, making the input touch the screen
              edge. SM+: original side-by-side row, capped at max-w-md. */}
          <form className="flex flex-col sm:flex-row items-stretch sm:items-center w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 w-full rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-text-heading/10 bg-text-on-dark px-4 text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="h-12 w-full sm:w-auto rounded-lg sm:rounded-l-none sm:rounded-r-none sm:rounded-r-lg bg-accent px-6 text-text-on-dark font-medium hover:bg-accent-hover mt-2 sm:mt-0"
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
