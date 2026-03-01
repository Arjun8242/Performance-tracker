import httpStatus from 'http-status';
import * as progressService from '../services/progress.service.js';

/**
 * Get current workout streak
 * GET /progress/streak
 */
const getStreak = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const currentStreak = await progressService.calculateStreak(userId);
        res.status(httpStatus.OK).json({ currentStreak });
    } catch (error) {
        next(error);
    }
};

/**
 * Get weekly progress summary
 * GET /progress/summary
 */
const getSummary = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const summary = await progressService.getWeeklySummary(userId);
        res.status(httpStatus.OK).json(summary);
    } catch (error) {
        next(error);
    }
};

/**
 * Get month heatmap
 * GET /progress/month
 */
const getMonth = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { month, year } = req.query;
        const heatmap = await progressService.getMonthHeatmap(
            userId,
            month !== undefined ? parseInt(month, 10) : undefined,
            year !== undefined ? parseInt(year, 10) : undefined
        );
        res.status(httpStatus.OK).json(heatmap);
    } catch (error) {
        next(error);
    }
};

/**
 * Get rule-based insights
 * GET /progress/insights
 */
const getInsights = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const insights = await progressService.getInsights(userId);
        res.status(httpStatus.OK).json({ insights });
    } catch (error) {
        next(error);
    }
};

/**
 * Get advanced exercise analytics
 * GET /progress/exercise/:exerciseId
 */
const getExerciseAnalytics = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { exerciseId } = req.params;
        const analytics = await progressService.getExerciseAnalytics(userId, exerciseId);

        if (!analytics) {
            return res.status(httpStatus.NOT_FOUND).json({
                message: 'Start logging this exercise to unlock analytics.'
            });
        }

        res.status(httpStatus.OK).json(analytics);
    } catch (error) {
        if (error.message === 'Exercise not found') {
            return res.status(httpStatus.NOT_FOUND).json({ message: error.message });
        }
        next(error);
    }
};

/**
 * Get all performed exercises for the user
 * GET /progress/exercises
 */
const getPerformedExercises = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const exercises = await progressService.getPerformedExercises(userId);
        res.status(httpStatus.OK).json(exercises);
    } catch (error) {
        next(error);
    }
};

export {
    getStreak,
    getSummary,
    getMonth,
    getInsights,
    getExerciseAnalytics,
    getPerformedExercises
};
