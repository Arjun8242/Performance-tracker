import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TestimonialCard = ({ testimonial, index = 0 }) => {
  const { userName, userAvatar, reviewText, rating, createdAt } = testimonial;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-6 sm:p-8 flex flex-col gap-4 shadow-sm transition-colors"
    >
      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? 'fill-orange-500 text-orange-500'
                : 'fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700'
            }`}
          />
        ))}
      </div>

      {/* Review text */}
      <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed flex-1">
        "{reviewText}"
      </p>

      {/* User info */}
      <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            {userName?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-black dark:text-white">{userName}</p>
          {formattedDate && (
            <p className="text-xs text-neutral-400">{formattedDate}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
