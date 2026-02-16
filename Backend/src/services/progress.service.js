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

    // Get user's workout plan to identify scheduled workout days
    const workoutPlan = await WorkoutPlan.findOne({ userId }).lean();
    const workoutDays = new Set(
        workoutPlan?.workouts?.map(w => w.day.toLowerCase()) || []
    );

    const isScheduledDay = (timestamp) => {
        // If no plan exists, assume every day is a workout day
        if (workoutDays.size === 0) return true;
        const d = new Date(timestamp);
        const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][d.getUTCDay()];
        return workoutDays.has(dayName);
    };

    // Get today's date normalized
    const today = normalizeDate(new Date()).getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    // 1. Check if the streak is still alive
    // Iterate backwards from today until we find a log or a missed scheduled workout
    let checkDay = today;
    let lastLogFound = null;

    while (checkDay > (today - 7 * oneDay)) { // Check back up to 7 days for safety
        if (uniqueDays.has(checkDay)) {
            lastLogFound = checkDay;
            break;
        }
        // If we skipped a scheduled day, the streak is broken (unless it's today and not over yet)
        if (checkDay !== today && isScheduledDay(checkDay)) {
            return 0;
        }
        checkDay -= oneDay;
    }

    if (lastLogFound === null) return 0;

    // 2. Count the streak backwards from the last log
    let streak = 0;
    let current = lastLogFound;

    // We continue the streak as long as:
    // - The day has a log
    // - OR the day is a rest day (not scheduled)
    while (true) {
        if (uniqueDays.has(current)) {
            streak++;
        } else if (isScheduledDay(current)) {
            // Hit a scheduled day with no log - streak ends
            break;
        }
        // If it's a rest day and no log, we just "pass through" it

        current -= oneDay;

        // Loop safety: Stop if we've gone further back than any existing log
        const minLogDate = Math.min(...uniqueDays);
        if (streak > 1000 || current < minLogDate) {
            break;
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

    // Get the workout plan (one plan per user)
    const workoutPlan = await WorkoutPlan.findOne({
        userId,
    }).lean();

    if (!workoutPlan) {
        // No plan found
        return {
            plannedExercises: 0,
            performedExercises: 0,
            completionPercent: 0,
            missedWorkouts: 0,
        };
    }

    // Calculate the start and end of the specified ISO week to filter logs
    const today = new Date();
    const targetYear = today.getFullYear(); // Assuming current year for simplicity, logic could be more robust

    // Simple way to get start of ISO week:
    const getStartOfISOWeek = (w, y) => {
        const simple = new Date(y, 0, 1 + (w - 1) * 7);
        const dow = simple.getDay();
        const ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        ISOweekStart.setHours(0, 0, 0, 0);
        return ISOweekStart;
    };

    const weekStart = getStartOfISOWeek(currentWeek, targetYear);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Count total planned exercises
    let plannedExercises = 0;
    const workoutIds = [];

    workoutPlan.workouts.forEach((workout) => {
        plannedExercises += workout.exercises.length;
        workoutIds.push(workout._id.toString());
    });

    // Get all workout logs for this week's workouts within the DATE range
    const workoutLogs = await WorkoutLog.find({
        userId,
        workoutId: { $in: workoutIds },
        date: { $gte: weekStart, $lte: weekEnd }
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
