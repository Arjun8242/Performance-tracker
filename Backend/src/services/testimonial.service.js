import Testimonial from '../models/testimonial.model.js';

/**
 * Get all approved testimonials
 */
const getApprovedTestimonials = async () => {
  const testimonials = await Testimonial.find({ isApproved: true })
    .sort({ createdAt: -1 })
    .lean();

  return testimonials.map(({ _id, __v, ...rest }) => ({
    id: _id.toString(),
    ...rest,
  }));
};

/**
 * Create a new testimonial (requires auth)
 */
const createTestimonial = async (data) => {
  const testimonial = await Testimonial.create(data);
  return testimonial.toJSON();
};

export { getApprovedTestimonials, createTestimonial };
