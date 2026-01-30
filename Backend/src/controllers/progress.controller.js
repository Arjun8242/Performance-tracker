import httpStatus from 'http-status';
import * as progressService from '../services/progress.service.js';

/**
 * Progress Controller
 * 
 * Thin controller layer - only handles HTTP request/response
 * All business logic is in progress.service.js
 */

/**
 * Get current workout streak
 * GET /progress/streak
 * 
 * @returns {Object} { currentStreak: number }
 */
const getStreak = async (req, res, next) => {
    try {
        // Get userId from authenticated user (set by auth middleware)
        const userId = req.user.userId;

        const currentStreak = await progressService.calculateStreak(userId);

        res.status(httpStatus.OK).json({
            currentStreak,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get weekly progress summary
 * GET /progress/summary
 * 
 * Query params:
 * - week (optional): ISO week number, defaults to current week
 * 
 * @returns {Object} { plannedExercises, performedExercises, completionPercent, missedWorkouts }
 */
const getSummary = async (req, res, next) => {
    try {
        // Get userId from authenticated user (set by auth middleware)
        const userId = req.user.userId;

        // Get optional week parameter from query string
        const week = req.query.week ? parseInt(req.query.week, 10) : null;

        const summary = await progressService.getWeeklySummary(userId, week);

        res.status(httpStatus.OK).json(summary);
    } catch (error) {
        next(error);
    }
};

export { getStreak, getSummary };
