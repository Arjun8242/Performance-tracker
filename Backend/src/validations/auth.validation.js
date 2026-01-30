import Joi from 'joi';
import { objectId } from '../middleware/validate.middleware.js';

/**
 * Auth Validation Schemas
 */

const signup = {
    body: Joi.object().keys({
        email: Joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required',
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required',
        }),
        name: Joi.string().trim(),
        goal: Joi.string().valid('fat_loss', 'muscle_gain', 'endurance'),
        fitnessLevel: Joi.string().valid('beginner', 'intermediate', 'advanced'),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required',
        }),
        password: Joi.string().required().messages({
            'any.required': 'Password is required',
        }),
    }),
};

export { signup, login };
