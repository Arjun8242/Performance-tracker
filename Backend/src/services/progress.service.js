import httpStatus from 'http-status';
import WorkoutLog from '../models/workoutLog.model.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Progress Service
 * 
 * Handles all business logic for:
 * - Streak calculation
 * - Weekly completion percentage
 * - Missed workout detection
 * 
 * All calculations happen on the backend.
 */

/**
 * Calculate the current workout streak for a user
 * 
 * Rules:
 * - A streak day exists if the user performs at least one exercise on that calendar day
 * - Multiple exercises on the same day count as one streak day
 * - Missing any day breaks the streak
 * - Calculate the current streak up to today
 * 
 * @param {string} userId - User ID
 * @returns {Promise<number>} Current streak count
 */
const calculateStreak = async (userId) => {
    if (!userId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
    }

    // Get all workout logs for the user with at least one performed exercise
    // Sort by date descending (most recent first)
    const workoutLogs = await WorkoutLog.find({
        userId,
        performedExercises: { $exists: true, $ne: [] }, // At least one exercise performed
    })
        .select('date')
        .sort({ date: -1 })
        .lean();

    if (workoutLogs.length === 0) {
        return 0; // No workouts logged
    }

    // Normalize dates to start of day (UTC) to avoid timezone issues
    const normalizeDate = (date) => {
        const d = new Date(date);
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    };

    // Get unique workout days (multiple workouts on same day = 1 streak day)
    const uniqueDays = new Set();
    workoutLogs.forEach((log) => {
        const normalizedDate = normalizeDate(log.date).getTime();
        uniqueDays.add(normalizedDate);
    });

    // Convert to sorted array (most recent first)
    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);

    // Get today's date normalized
    const today = normalizeDate(new Date()).getTime();

    // Check if the most recent workout was today or yesterday (to keep active streak)
    const mostRecentDay = sortedDays[0];
    const oneDay = 24 * 60 * 60 * 1000;

    if (mostRecentDay !== today && mostRecentDay !== (today - oneDay)) {
        return 0;
    }

    // Calculate streak by counting consecutive days
    let streak = 0;
    let expectedDay = mostRecentDay;

    for (const day of sortedDays) {
        if (day === expectedDay) {
            streak++;
            expectedDay -= 24 * 60 * 60 * 1000; // Move to previous day
        } else {
            break; // Gap found, streak ends
        }
    }

    return streak;
};

/**
 * Get ISO week number from a date
 * @param {Date} date - Date object
 * @returns {number} ISO week number
 */
const getISOWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
};

/**
 * Calculate weekly completion percentage
 * 
 * Formula: (performed exercises in the week / planned exercises in the week) * 100
 * 
 * Rules:
 * - Planned exercises come from WorkoutPlan
 * - Performed exercises come from WorkoutLog.performedExercises
 * - Only logged exercises count
 * - Partial completion must be reflected accurately
 * 
 * @param {string} userId - User ID
 * @param {number} week - ISO week number (optional, defaults to current week)
 * @returns {Promise<Object>} { plannedExercises, performedExercises, completionPercent, missedWorkouts }
 */
const getWeeklySummary = async (userId, week = null) => {
    if (!userId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
    }

    // Default to current week if not provided
    const currentWeek = week || getISOWeek(new Date());

    // Get the workout plan for this week
    const workoutPlan = await WorkoutPlan.findOne({
        userId,
        week: currentWeek,
    }).lean();

    if (!workoutPlan) {
        // No plan for this week
        return {
            plannedExercises: 0,
            performedExercises: 0,
            completionPercent: 0,
            missedWorkouts: 0,
        };
    }

    // Count total planned exercises
    let plannedExercises = 0;
    const workoutIds = [];

    workoutPlan.workouts.forEach((workout) => {
        plannedExercises += workout.exercises.length;
        workoutIds.push(workout._id.toString());
    });

    // Get all workout logs for this week's workouts
    const workoutLogs = await WorkoutLog.find({
        userId,
        workoutId: { $in: workoutIds },
    }).lean();

    // Count performed exercises (only from completed logs)
    let performedExercises = 0;
    const completedWorkoutIds = new Set();

    workoutLogs.forEach((log) => {
        if (log.status === 'completed') {
            performedExercises += log.performedExercises.length;
            completedWorkoutIds.add(log.workoutId.toString());
        }
    });

    // Calculate completion percentage
    const completionPercent = plannedExercises > 0
        ? Math.round((performedExercises / plannedExercises) * 100)
        : 0;

    // Calculate missed workouts
    // A workout is missed if:
    // - It exists in the WorkoutPlan
    // - AND no completed WorkoutLog exists for that workout
    // - status: "skipped" counts as missed
    // - Missing logs count as missed
    const missedWorkouts = workoutPlan.workouts.filter((workout) => {
        const workoutId = workout._id.toString();
        return !completedWorkoutIds.has(workoutId);
    }).length;

    return {
        plannedExercises,
        performedExercises,
        completionPercent,
        missedWorkouts,
    };
};

export { calculateStreak, getWeeklySummary };
