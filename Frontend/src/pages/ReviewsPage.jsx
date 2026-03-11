import React from 'react';
import { Star } from 'lucide-react';
import TestimonialsSection from '../components/home/TestimonialsSection';
import ReviewForm from '../components/home/ReviewForm';

const ReviewsPage = () => {
  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 text-black dark:text-white uppercase transition-colors">
          User <span className="text-orange-500">Reviews</span>
        </h1>
        <p className="text-neutral-500 text-lg max-w-2xl font-medium">
          See what the community is saying and share your own experience.
        </p>
      </div>

      {/* Submit review form */}
      <div className="max-w-xl">
        <ReviewForm />
      </div>

      {/* All testimonials */}
      <TestimonialsSection />
    </div>
  );
};

export default ReviewsPage;
