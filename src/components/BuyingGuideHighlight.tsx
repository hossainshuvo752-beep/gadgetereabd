import React from 'react';

const BuyingGuideHighlight: React.FC = () => {
  // Dummy data for buying guides
  const guides = [
    {
      id: 1,
      title: 'Best Laptop Under ৳50,000 in Bangladesh',
      description: 'Top picks for performance and value in the mid-range budget.',
      imageAlt: 'Laptop under 50000 BDT',
    },
    {
      id: 2,
      title: 'Best Laptop for Programming Students',
      description: 'Ideal machines for coding, compiling, and multitasking on a student budget.',
      imageAlt: 'Laptop for programming students',
    },
    {
      id: 3,
      title: 'Windows vs Mac: Which Laptop OS to Choose',
      description: 'A detailed comparison to help you decide the right operating system for your needs.',
      imageAlt: 'Windows vs Mac comparison',
    },
  ];

  return (
    <section className="mb-12 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-text-heading mb-6 text-center">
          Popular Buying Guides
        </h2>
        {/* MOBILE: 2-col compact grid, same card sizing as Latest Posts /
            Trending Now (h-36 image, p-3, text-sm title, no description).
            DESKTOP: unchanged. */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-text-on-dark rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300">
              {/* 16:9 ratio lock — guides aren't real posts yet (dummy data,
                  '#' links), so they can't reuse ArticleCard; visual style
                  follows the blog card spec regardless. */}
              <div className="aspect-video w-full bg-bg-dark-secondary/10 flex items-center justify-center">
                <span className="text-text-body text-sm">{guide.imageAlt}</span>
              </div>
              <div className="p-3 md:p-5">
                <h3 className="text-sm md:text-xl font-bold text-text-heading mb-3 line-clamp-2">
                  {guide.title}
                </h3>
                <p className="hidden md:line-clamp-2 text-text-body mb-4">
                  {guide.description}
                </p>
                <a href="#" className="text-accent hover:text-accent-hover underline font-medium text-sm md:text-base">
                  Read Guide →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuyingGuideHighlight;
