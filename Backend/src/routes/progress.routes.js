import express from 'express';
import * as progressController from '../controllers/progress.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as progressValidation from '../validations/progress.validation.js';

const router = express.Router();

/**
 * Progress Routes
 * 
 * All routes require authentication
 * 
 * GET /progress/streak   - Get current workout streak
 * GET /progress/summary  - Get weekly completion summary
 */

// Protected routes (authentication required)
router.get('/streak', protect, progressController.getStreak);
router.get('/summary', protect, validate(progressValidation.getSummary), progressController.getSummary);

export default router;
