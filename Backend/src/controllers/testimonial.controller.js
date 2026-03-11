import httpStatus from 'http-status';
import * as testimonialService from '../services/testimonial.service.js';

/**
 * GET /testimonials
 * Public - returns approved testimonials
 */
const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await testimonialService.getApprovedTestimonials();
    res.status(httpStatus.OK).json({ testimonials });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /testimonials
 * Authenticated - submit a new review
 */
const createTestimonial = async (req, res, next) => {
  try {
    const { reviewText, rating } = req.body;

    const testimonial = await testimonialService.createTestimonial({
      userName: req.user.name || 'Anonymous',
      userAvatar: req.user.avatar || null,
      reviewText,
      rating,
      userId: req.user._id,
      isApproved: true,
    });

    res.status(httpStatus.CREATED).json({
      message: 'Review submitted successfully.',
      testimonial,
    });
  } catch (error) {
    next(error);
  }
};

export { getTestimonials, createTestimonial };
