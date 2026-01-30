import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import * as authValidation from '../validations/auth.validation.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

/**
 * Auth Routes
 * 
 * POST /auth/signup - Register new user
 * POST /auth/login  - Authenticate user
 * 
 * Rate limited to 5 requests per 15 minutes per IP
 */

// Public routes (no authentication required)
// Apply rate limiting to prevent brute force attacks
router.post('/signup', authLimiter, validate(authValidation.signup), authController.signup);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);

export default router;
