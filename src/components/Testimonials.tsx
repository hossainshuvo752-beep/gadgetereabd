import React from 'react';
import { Star } from 'lucide-react';

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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-text-on-dark rounded-lg shadow-md p-6">
              <div className="flex items-start space-x-4">
                {/* Quote Icon */}
                <div className="flex-shrink-0 mt-1">
                  <svg className="h-5 w-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-3.5h9l4 3.5V4c0-1.1-.9-2-2-2zm0 19H4V4h16v17z" />
                  </svg>
                </div>
                <div>
                  <p className="text-text-heading font-semibold italic mb-4">{testimonial.quote}</p>
                  <div className="flex items-center mb-2">
                    {/* Star Rating */}
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4"
                          style={{
                            fill: star <= testimonial.rating ? 'currentColor' : 'none',
                            stroke: star <= testimonial.rating ? 'currentColor' : '#cbd5e1',
                            strokeWidth: 2,
                          }}
                        />
                      ))}
                    </div>
                    {/* Reviewer Info */}
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
