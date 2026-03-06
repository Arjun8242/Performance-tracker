import express from 'express';
import * as progressController from '../controllers/progress.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as progressValidation from '../validations/progress.validation.js';

const router = express.Router();

/**
 * Progress Routes
 * All routes require authentication
 */

router.get('/streak', protect, progressController.getStreak);
router.get('/summary', protect, progressController.getSummary);
router.get('/month', protect, validate(progressValidation.getMonth), progressController.getMonth);
router.get('/insights', protect, progressController.getInsights);
router.get('/exercises', protect, progressController.getPerformedExercises);
router.get('/exercise/:exerciseId', protect, validate(progressValidation.getExerciseAnalytics), progressController.getExerciseAnalytics);
router.get('/muscle-volume', protect, progressController.getMuscleVolume);

export default router;
