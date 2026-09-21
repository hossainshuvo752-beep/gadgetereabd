import React from 'react';
import { Star, Quote } from 'lucide-react';

type Testimonial = {
  id: number;
  quote: string;
  rating: number; // out of 5
  reviewerName: string;
  reviewerLocation: string;
  reviewerInitials: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "TechBD's reviews are thorough and unbiased. I bought a laptop based on their recommendation and it's been perfect for my studies.",
    rating: 5,
    reviewerName: "Rafiul Islam",
    reviewerLocation: "Dhaka",
    reviewerInitials: "RI"
  },
  {
    id: 2,
    quote: "The buying guides helped me choose the right smartphone within my budget. Great service!",
    rating: 4,
    reviewerName: "Tania Akter",
    reviewerLocation: "Chattogram",
    reviewerInitials: "TA"
  },
  {
    id: 3,
    quote: "I trust TechBD for honest opinions. Their team is knowledgeable and always ready to help.",
    rating: 5,
    reviewerName: "Shakib Hasan",
    reviewerLocation: "Sylhet",
    reviewerInitials: "SH"
  },
  {
    id: 4,
    quote: "The latest update on Windows 11 features was spot on. Keep up the good work!",
    rating: 5,
    reviewerName: "Nusrat Jahan",
    reviewerLocation: "Khulna",
    reviewerInitials: "NJ"
  },
  {
    id: 5,
    quote: "As a developer, I rely on their programming laptop guides. They save me time and money.",
    rating: 4,
    reviewerName: "Mehedi Hasan",
    reviewerLocation: "Rajshahi",
    reviewerInitials: "MH"
  },
  {
    id: 6,
    quote: "Their buying guides are spot-on and saved me hours of research before purchasing my new monitor.",
    rating: 5,
    reviewerName: "Farhana Rahman",
    reviewerLocation: "Barisal",
    reviewerInitials: "FR"
  }
];

/** Shared star row — identical rendering for the mobile and desktop blocks. */
const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className="h-4 w-4"
        style={{
          fill: star <= rating ? 'currentColor' : 'none',
          stroke: star <= rating ? 'currentColor' : '#cbd5e1',
          strokeWidth: 2,
        }}
      />
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  return (
    <section className="py-12 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-text-heading mb-2">
          What Our Customers Say
        </h2>
        <p className="text-center text-text-body mb-8">
          Trusted by thousands across Bangladesh
        </p>

        {/* MOBILE: horizontally scrollable, snap-scrolling row — each card is
            ~85% of the viewport so the next one peeks in from the right,
            hinting there is more to swipe. -mx-4/px-4 lets the row reach the
            true screen edges while cards align with the section padding.
            DESKTOP (sm+): exact original grid — sm:grid-cols-2 → lg:grid-cols-3,
            overflow and snapping disabled. */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex flex-nowrap gap-4 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 overflow-x-auto sm:overflow-visible hide-scrollbar">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="w-[85%] max-w-[85vw] shrink-0 snap-center sm:w-auto bg-text-on-dark rounded-lg shadow-md p-4 sm:p-6"
            >
              {/* MOBILE card content (reference order): thin line-style quote
                  icon top-left → star row → quote → avatar/name/location. */}
              <div className="md:hidden flex flex-col">
                <Quote
                  className="h-5 w-5 text-text-body mb-2"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <div className="mb-3 text-accent">
                  <Stars rating={testimonial.rating} />
                </div>
                <p className="text-text-heading font-semibold italic text-sm leading-relaxed mb-5">
                  {testimonial.quote}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-text-on-dark font-medium text-xs">
                    {testimonial.reviewerInitials}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-text-heading text-sm">
                      {testimonial.reviewerName}
                    </p>
                    <p className="text-text-body text-xs">
                      {testimonial.reviewerLocation}
                    </p>
                  </div>
                </div>
              </div>

              {/* DESKTOP card content — exactly the original layout, untouched. */}
              <div className="hidden md:flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-3.5h9l4 3.5V4c0-1.1-.9-2-2-2zm0 19H4V4h16v17z" />
                  </svg>
                </div>
                <div>
                  <p className="text-text-heading font-semibold italic mb-4">{testimonial.quote}</p>
                  <div className="flex items-center mb-2">
                    <Stars rating={testimonial.rating} />
                    <div className="ml-4 flex items-center space-x-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-text-on-dark font-medium text-xs">
                        {testimonial.reviewerInitials}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-text-heading text-sm">{testimonial.reviewerName}</p>
                        <p className="text-text-body text-xs">{testimonial.reviewerLocation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
