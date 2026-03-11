import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import TestimonialCard from './TestimonialCard';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.get('/testimonials');
        setTestimonials(res.data.testimonials || []);
      } catch {
        setTestimonials([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  return (
    <section className="w-full py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <MessageSquare className="w-3.5 h-3.5" />
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black dark:text-white tracking-tight">
            What Our Users Say
          </h2>
          <p className="mt-4 text-neutral-500 dark:text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto">
            Real results from real people who transformed their fitness journey
          </p>
        </motion.div>

        {/* Cards grid */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm font-medium">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
