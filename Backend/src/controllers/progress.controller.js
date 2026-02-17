import httpStatus from 'http-status';
import * as progressService from '../services/progress.service.js';

/**
 * Get current workout streak
 * GET /progress/streak
 */
const getStreak = async (req, res, next) => {
    try {
        const userId = req.user.userId;
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
        const userId = req.user.userId;
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
        const userId = req.user.userId;
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
        const userId = req.user.userId;
        const insights = await progressService.getInsights(userId);
        res.status(httpStatus.OK).json({ insights });
    } catch (error) {
        next(error);
    }
};

export {
    getStreak,
    getSummary,
    getMonth,
    getInsights
};
