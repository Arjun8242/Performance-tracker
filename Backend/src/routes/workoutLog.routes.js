import express from 'express';
import workoutLogController from '../controllers/workoutLog.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();


// 1. Log Workout (Create or Update)
router.post('/log', protect, workoutLogController.logWorkout);

// 2. Fetch Logs by Date Range
router.get('/logs', protect, workoutLogController.getWorkoutLogs);

export default router;
