import express from 'express';
import * as testimonialController from '../controllers/testimonial.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as testimonialValidation from '../validations/testimonial.validation.js';

const router = express.Router();

/**
 * @route GET /testimonials
 * @desc Get all approved testimonials
 * @access Public
 */
router.get('/', testimonialController.getTestimonials);

/**
 * @route POST /testimonials
 * @desc Submit a new review (requires auth)
 * @access Private
 */
router.post(
  '/',
  protect,
  validate(testimonialValidation.createTestimonial),
  testimonialController.createTestimonial
);

export default router;
