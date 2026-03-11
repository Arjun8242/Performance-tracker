import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const ReviewForm = ({ onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || reviewText.trim().length < 10) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/testimonials', {
        reviewText: reviewText.trim(),
        rating,
      });
      setSubmitted(true);
      setRating(0);
      setReviewText('');
      onSubmitted?.();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to submit a review.');
      } else {
        setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-6 sm:p-8 shadow-sm"
    >
      <h3 className="text-lg font-bold text-black dark:text-white mb-1">
        Share Your Experience
      </h3>
      <p className="text-sm text-neutral-400 mb-6">
        Your review helps others on their fitness journey
      </p>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-8"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-black dark:text-white font-semibold">Thank you!</p>
            <p className="text-sm text-neutral-400 text-center">
              Your review has been submitted successfully.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              Write another review
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* Star rating */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 block">
                Rating
              </label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    onMouseEnter={() => setHoveredStar(i + 1)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        i < (hoveredStar || rating)
                          ? 'fill-orange-500 text-orange-500'
                          : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-2 block">
                Your Review
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us about your fitness journey..."
                rows={4}
                maxLength={1000}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              />
              <p className="text-xs text-neutral-400 mt-1">
                {reviewText.length}/1000 characters (min 10)
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || reviewText.trim().length < 10}
              className="flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 text-white font-bold py-3 px-6 rounded-xl transition-colors text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReviewForm;
