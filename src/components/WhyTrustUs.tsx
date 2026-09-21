import React from 'react';

const WhyTrustUs: React.FC = () => {
  const trustPoints = [
    {
      id: 1,
      title: 'Genuine Testing',
      description: 'Every product is tested hands-on before we review it',
      icon: '✅', // checkmark emoji
    },
    {
      id: 2,
      title: 'No Paid Bias',
      description: 'Our reviews are honest, never influenced by sponsorships',
      icon: '🛡️', // shield emoji
    },
    {
      id: 3,
      title: 'Bangla + English',
      description: 'Content available in both languages for everyone',
      icon: '🌐', // globe emoji (for language)
    },
    {
      id: 4,
      title: 'Community Driven',
      description: 'Built for and shaped by Bangladeshi tech users',
      icon: '👥', // people emoji
    },
  ];

  return (
    <section className="mb-12 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-text-heading mb-6 text-center">
          Why Trust TechBD
        </h2>
        {/* Mobile: 2x2 card grid (reference-style); sm+ keeps the previous
            2-col / lg 4-col desktop layout unchanged. */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point) => (
            <div key={point.id} className="flex flex-col items-center text-center p-4 bg-text-on-dark rounded-lg shadow hover:shadow-md transition-shadow duration-300">
              <div className="mb-4 text-2xl">
                {point.icon}
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">
                {point.title}
              </h3>
              <p className="text-text-body text-sm">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTrustUs;
