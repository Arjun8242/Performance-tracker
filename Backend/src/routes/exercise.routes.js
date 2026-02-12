import express from 'express';
import * as exerciseController from '../controllers/exercise.controller.js';

const router = express.Router();

/**
 * @route GET /api/exercises
 * @desc Get all exercises with filtering and pagination
 * @access Public (as per READ-ONLY API requirements, no auth changes)
 */
router.get('/', exerciseController.getExercises);

export default router;
