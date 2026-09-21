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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-text-on-dark rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300">
              <div className="h-48 w-full bg-bg-dark-secondary/10 flex items-center justify-center">
                <span className="text-text-body text-sm">{guide.imageAlt}</span>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-text-heading mb-3">
                  {guide.title}
                </h3>
                <p className="text-text-body mb-4 line-clamp-2">
                  {guide.description}
                </p>
                <a href="#" className="text-accent hover:text-accent-hover underline font-medium">
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
