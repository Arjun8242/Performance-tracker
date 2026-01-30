import express from 'express';
import workoutLogController from '../controllers/workoutLog.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import * as workoutLogValidation from '../validations/workoutLog.validation.js';

const router = express.Router();


// 1. Log Workout (Create or Update)
router.post('/log', protect, validate(workoutLogValidation.logWorkout), workoutLogController.logWorkout);

// 2. Fetch Logs by Date Range (with pagination)
router.get('/logs', protect, validate(workoutLogValidation.getWorkoutLogs), workoutLogController.getWorkoutLogs);

export default router;
