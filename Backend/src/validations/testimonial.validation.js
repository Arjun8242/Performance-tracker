import Joi from 'joi';

const createTestimonial = {
  body: Joi.object().keys({
    reviewText: Joi.string().trim().min(10).max(1000).required().messages({
      'string.min': 'Review must be at least 10 characters',
      'string.max': 'Review must be at most 1000 characters',
      'any.required': 'Review text is required',
    }),
    rating: Joi.number().integer().min(1).max(5).required().messages({
      'number.min': 'Rating must be between 1 and 5',
      'number.max': 'Rating must be between 1 and 5',
      'any.required': 'Rating is required',
    }),
  }),
};

export { createTestimonial };
