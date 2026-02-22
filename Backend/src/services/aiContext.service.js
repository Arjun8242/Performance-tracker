import WorkoutLog from '../models/workoutLog.model.js';
import Exercise from '../models/Exercise.model.js';
import { calculateStreak, getWeeklySummary } from './progress.service.js';

/**
 * Compute AI Context for a user
 * 
 * Aggregates performance data into a summarized format for LLM consumption.
 * Uses the Exercise database for muscle group mapping.
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Structured user performance data
 */
const getAIContext = async (userId) => {
    // 1. Get basic stats from existing progress service
    const [streak, weeklySummary] = await Promise.all([
        calculateStreak(userId),
        getWeeklySummary(userId)
    ]);

    // 2. Fetch logs for the last 30 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const logs30Days = await WorkoutLog.find({
        userId,
        date: { $gte: thirtyDaysAgo },
        status: 'completed'
    }).sort({ date: 1 }).lean();

    // 3. Extract unique exercise IDs and fetch their details from DB
    const uniqueExerciseIds = [...new Set(
        logs30Days.flatMap(log => (log.performedExercises || []).map(ex => ex.exerciseId.toString()))
    )];

    const exerciseDetails = await Exercise.find({
        _id: { $in: uniqueExerciseIds }
    }).select('name muscleGroup secondaryMuscles').lean();

    const exerciseMap = {};
    exerciseDetails.forEach(ex => {
        exerciseMap[ex._id.toString()] = {
            name: ex.name,
            primary: ex.muscleGroup,
            secondary: ex.secondaryMuscles || []
        };
    });

    // 4. Process Exercise Trends and PRs (30 Day Window)
    const exerciseHistory = {};
    logs30Days.forEach(log => {
        (log.performedExercises || []).forEach(ex => {
            const details = exerciseMap[ex.exerciseId.toString()];
            if (!details) return;

            const name = details.name;
            // Calculate volume for this exercise in this log
            const volume = ex.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
            const maxWeight = Math.max(...ex.sets.map(s => s.weight));

            if (!exerciseHistory[name]) exerciseHistory[name] = [];
            exerciseHistory[name].push({
                date: log.date,
                volume,
                weight: maxWeight
            });
        });
    });

    // Compute trends
    const exerciseTrends = Object.keys(exerciseHistory).map(name => {
        const history = exerciseHistory[name];
        const lastPRItem = history.reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev), { weight: 0, date: new Date(0) });
        const lastPRDate = lastPRItem.date;
        const daysSincePR = lastPRDate.getTime() === 0 ? null : Math.floor((new Date() - new Date(lastPRDate)) / (1000 * 60 * 60 * 24));

        let volumeTrendValue = 'stable';
        if (history.length >= 4) {
            const recentVolume = history.slice(-2).reduce((sum, h) => sum + h.volume, 0);
            const previousVolume = history.slice(-4, -2).reduce((sum, h) => sum + h.volume, 0);
            if (recentVolume > previousVolume * 1.05) volumeTrendValue = 'increasing';
            else if (recentVolume < previousVolume * 0.95) volumeTrendValue = 'decreasing';
        }

        return {
            exercise: name.charAt(0).toUpperCase() + name.slice(1),
            volumeTrend: volumeTrendValue,
            lastPR: lastPRDate.getTime() === 0 ? 'N/A' : lastPRDate.toISOString().split('T')[0],
            daysSincePR
        };
    });

    // 5. Identify Weak Muscle Groups (Weekly sets, including secondary)
    const logs7Days = logs30Days.filter(log => new Date(log.date) >= sevenDaysAgo);
    const muscleSets = {};
    const mainMuscleGroups = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core'];

    mainMuscleGroups.forEach(m => muscleSets[m] = 0);

    logs7Days.forEach(log => {
        (log.performedExercises || []).forEach(ex => {
            const mapping = exerciseMap[ex.exerciseId.toString()];
            if (mapping) {
                const setWeight = ex.sets.length;
                // Primary muscle gets full credit
                if (mainMuscleGroups.includes(mapping.primary)) {
                    muscleSets[mapping.primary] += setWeight;
                }
                // Secondary muscles get half credit
                (mapping.secondary || []).forEach(m => {
                    if (mainMuscleGroups.includes(m)) {
                        muscleSets[m] += setWeight * 0.5;
                    }
                });
            }
        });
    });

    const setValues = Object.values(muscleSets);
    const totalSets = setValues.reduce((a, b) => a + b, 0);
    const avgSets = totalSets / mainMuscleGroups.length;

    let weakMuscleGroups = [];
    if (totalSets > 0) {
        weakMuscleGroups = mainMuscleGroups.filter(m => {
            const sets = muscleSets[m] || 0;
            return sets < (avgSets * 0.6);
        });
    }

    return {
        streak,
        weeklyCompletion: weeklySummary.percentage,
        missedWorkouts: weeklySummary.total - weeklySummary.completed - weeklySummary.skipped,
        exerciseTrends: exerciseTrends.slice(0, 5),
        weakMuscleGroups,
        muscleDistribution: muscleSets // Useful for debugging/detailed UI
    };
};

export default {
    getAIContext
};
