import WorkoutLog from '../models/workoutLog.model.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import Exercise from '../models/Exercise.model.js';
import { normalizeDate, getCurrentWeekRange, getDayName } from '../utils/date.utils.js';
import mongoose from 'mongoose';

/**
 * Weekly Summary
 * Formula: (Completed + Skipped Logs this week) / Total Workouts in Active Plan
 */
const getWeeklySummary = async (userId) => {
    const [plan, { start, end }] = await Promise.all([
        WorkoutPlan.findOne({ userId }).lean(),
        Promise.resolve(getCurrentWeekRange())
    ]);

    // Fetch only necessary fields for performance
    const logs = await WorkoutLog.find({
        userId,
        date: { $gte: start, $lte: end }
    }).select('status date').lean();

    const total = plan?.workouts?.length || 0;

    // Use a Map/Set if counting unique days per workout is needed in future, 
    // for now counting total logs vs total plan slots as per requirements.
    const completed = logs.filter(l => l.status === 'completed').length;
    const skipped = logs.filter(l => l.status === 'skipped').length;
    const totalLogged = completed + skipped;

    const percentage = total > 0 ? Math.round((totalLogged / total) * 100) : 0;

    return {
        total,
        completed,
        skipped,
        percentage: Math.min(percentage, 100),
        weekRange: { start, end }
    };
};

/**
 * Streak Calculation
 * - Skips rest days if a plan exists.
 * - Defaults to daily check if no plan exists.
 * - Performance optimized with .select()
 */
const calculateStreak = async (userId) => {
    const [logs, plan] = await Promise.all([
        WorkoutLog.find({ userId, status: 'completed' })
            .select('date')
            .sort({ date: -1 })
            .lean(),
        WorkoutPlan.findOne({ userId }).select('workouts').lean()
    ]);

    if (logs.length === 0) return 0;

    const uniqueLogDays = new Set(logs.map(l => normalizeDate(l.date).getTime()));
    const planDays = plan?.workouts ? new Set(plan.workouts.map(w => w.day.toLowerCase())) : null;

    let streak = 0;
    let current = normalizeDate(new Date());
    const todayTS = current.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    // Track backwards
    while (true) {
        const ts = current.getTime();
        const dayName = getDayName(current);

        // If plan exists, check if planned. Otherwise, every day is 'planned'.
        const isPlanned = planDays ? planDays.has(dayName) : true;

        if (uniqueLogDays.has(ts)) {
            streak++;
        } else if (isPlanned) {
            // Missing a required day breaks streak (ignore if it's currently Today)
            if (ts !== todayTS) break;
        } else {
            // Rest day - skip without breaking or incrementing
        }

        current.setUTCDate(current.getUTCDate() - 1);

        // Safety exit: stop if we go before the first log
        const minLogTs = Math.min(...uniqueLogDays);
        if (ts < minLogTs) break;
    }

    return streak;
};

/**
 * Month Heatmap
 */
const getMonthHeatmap = async (userId, month, year) => {
    const targetYear = year || new Date().getUTCFullYear();
    const targetMonth = month !== undefined ? month : new Date().getUTCMonth();

    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth, 1));
    const endOfMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59, 999));

    const [logs, plan] = await Promise.all([
        WorkoutLog.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).select('status date').lean(),
        WorkoutPlan.findOne({ userId }).select('workouts').lean()
    ]);

    const planDays = plan?.workouts ? new Set(plan.workouts.map(w => w.day.toLowerCase())) : new Set();
    const logMap = logs.reduce((acc, log) => {
        const dateStr = normalizeDate(log.date).toISOString().split('T')[0];
        acc[dateStr] = log.status;
        return acc;
    }, {});

    const heatmap = {};
    const today = normalizeDate(new Date());

    let current = new Date(startOfMonth);
    while (current <= endOfMonth) {
        const dateStr = current.toISOString().split('T')[0];
        const dayName = getDayName(current);

        if (logMap[dateStr]) {
            heatmap[dateStr] = logMap[dateStr];
        } else if (current < today) {
            heatmap[dateStr] = planDays.has(dayName) ? 'missed' : 'rest';
        } else {
            heatmap[dateStr] = 'upcoming';
        }

        current.setUTCDate(current.getUTCDate() + 1);
    }

    return heatmap;
};

/**
 * Rule-based Insights
 */
const getInsights = async (userId) => {
    const [summary, streak] = await Promise.all([
        getWeeklySummary(userId),
        calculateStreak(userId)
    ]);

    const insights = [];

    if (streak >= 7) insights.push({ type: 'positive', message: `Unstoppable! ${streak}-day streak! ⚡` });
    else if (streak >= 3) insights.push({ type: 'positive', message: `Great momentum! ${streak} days in a row.` });
    else if (streak === 1) insights.push({ type: 'positive', message: `Streak started! Stay consistent.` });

    if (summary.total > 0) {
        if (summary.percentage === 100) insights.push({ type: 'positive', message: "Legendary! 100% completion this week. 🏆" });
        if (summary.skipped > 0) insights.push({ type: 'warning', message: `You've skipped ${summary.skipped} workout${summary.skipped > 1 ? 's' : ''}. Let's get back to it!` });
    } else {
        insights.push({ type: 'info', message: "Define a workout plan to track weekly goals." });
    }

    if (insights.length === 0) {
        insights.push({ type: 'info', message: "Keep moving! Every workout counts." });
    }

    return insights;
};

/**
 * Advanced Exercise Analytics
 * ROI: Volume, Trends, E1RM, Frequency
 */
const getExerciseAnalytics = async (userId, exerciseId) => {
    const exercise = await Exercise.findById(exerciseId).select('name muscleGroup').lean();
    if (!exercise) {
        throw new Error('Exercise not found');
    }

    const exId = new mongoose.Types.ObjectId(exerciseId);
    const uId = new mongoose.Types.ObjectId(userId);

    const logs = await WorkoutLog.aggregate([
        {
            $match: {
                userId: uId,
                'performedExercises.exerciseId': exId,
                status: 'completed'
            }
        },
        { $unwind: '$performedExercises' },
        {
            $match: {
                'performedExercises.exerciseId': exId
            }
        },
        {
            $addFields: {
                sessionVolume: {
                    $sum: {
                        $map: {
                            input: '$performedExercises.sets',
                            as: 'set',
                            in: { $multiply: ['$$set.weight', '$$set.reps'] }
                        }
                    }
                },
                setsWithE1RM: {
                    $map: {
                        input: '$performedExercises.sets',
                        as: 'set',
                        in: {
                            weight: '$$set.weight',
                            reps: '$$set.reps',
                            e1RM: {
                                $multiply: [
                                    '$$set.weight',
                                    { $add: [1, { $divide: ['$$set.reps', 30] }] }
                                ]
                            }
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                maxE1RM: { $max: '$setsWithE1RM.e1RM' }
            }
        },
        { $sort: { date: 1 } }
    ]);

    if (logs.length === 0) {
        return null;
    }

    // Process stats
    let lifetimeVolume = 0;
    let totalSessions = logs.length;
    let bestSet = { weight: 0, reps: 0, estimated1RM: 0 };
    const volumeOverTime = [];
    const e1RMOverTime = [];

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000);
    const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000);

    let last7DaysSessions = 0;
    let last30DaysSessions = 0;

    // PR Detection Logic
    const prHistory = [];
    let rollingMaxE1RM = 0;

    logs.forEach(log => {
        lifetimeVolume += log.sessionVolume;

        // Best Set (Lifetime)
        log.setsWithE1RM.forEach(set => {
            if (set.e1RM > bestSet.estimated1RM) {
                bestSet = {
                    weight: set.weight,
                    reps: set.reps,
                    estimated1RM: Math.round(set.e1RM)
                };
            }
        });

        // PR History
        if (log.maxE1RM > rollingMaxE1RM) {
            rollingMaxE1RM = log.maxE1RM;
            const bestSetInSession = log.setsWithE1RM.reduce((prev, curr) => (curr.e1RM > prev.e1RM) ? curr : prev);
            prHistory.push({
                date: log.date.toISOString().split('T')[0],
                weight: bestSetInSession.weight,
                reps: bestSetInSession.reps,
                e1RM: Math.round(log.maxE1RM)
            });
        }

        // Trends
        const dateStr = log.date.toISOString().split('T')[0];
        volumeOverTime.push({ date: dateStr, volume: log.sessionVolume });
        e1RMOverTime.push({ date: dateStr, value: Math.round(log.maxE1RM) });

        // Frequency
        const logDate = new Date(log.date);
        if (logDate >= sevenDaysAgo) last7DaysSessions++;
        if (logDate >= thirtyDaysAgo) last30DaysSessions++;
    });

    // Comparison Metrics (4 weeks vs 4 weeks)
    const period1Logs = logs.filter(l => new Date(l.date) >= fourWeeksAgo);
    const period2Logs = logs.filter(l => new Date(l.date) >= eightWeeksAgo && new Date(l.date) < fourWeeksAgo);

    const calculateMetrics = (periodLogs) => {
        if (periodLogs.length === 0) return null;
        const totalVolume = periodLogs.reduce((sum, l) => sum + l.sessionVolume, 0);
        const maxE1RM = Math.max(...periodLogs.map(l => l.maxE1RM));
        const frequency = (periodLogs.length / 4); // sessions per week
        return { totalVolume, maxE1RM, frequency };
    };

    const m1 = calculateMetrics(period1Logs);
    const m2 = calculateMetrics(period2Logs);

    const percentageChanges = {
        e1RM: null,
        volume: null,
        frequency: null
    };

    if (m1 && m2) {
        percentageChanges.e1RM = Math.round(((m1.maxE1RM - m2.maxE1RM) / m2.maxE1RM) * 100);
        percentageChanges.volume = Math.round(((m1.totalVolume - m2.totalVolume) / m2.totalVolume) * 100);
        if (m2.frequency > 0) {
            percentageChanges.frequency = Math.round(((m1.frequency - m2.frequency) / m2.frequency) * 100);
        }
    }

    // Automated Insights
    const insights = [];
    if (m1 && m2) {
        if (percentageChanges.volume !== 0) {
            insights.push(`${percentageChanges.volume > 0 ? 'Volume increased' : 'Volume decreased'} ${Math.abs(percentageChanges.volume)}% compared to last 4 weeks.`);
        }
    }

    const peakLog = logs.reduce((prev, curr) => (curr.maxE1RM > prev.maxE1RM) ? curr : prev);
    const peakDate = new Date(peakLog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    insights.push(`E1RM peaked on ${peakDate}.`);

    if (m1) {
        insights.push(`Frequency stable at ${m1.frequency.toFixed(1)} sessions/week.`);
    }

    const lastPR = prHistory[prHistory.length - 1];
    if (lastPR) {
        const lastPRDate = new Date(lastPR.date);
        const daysSinceLastPR = Math.floor((now - lastPRDate) / (1000 * 60 * 60 * 24));
        if (daysSinceLastPR >= 30) {
            insights.push(`Strength plateau detected (no new PR in 30 days).`);
        }
    }

    return {
        exercise: {
            id: exercise._id,
            name: exercise.name,
            muscleGroup: exercise.muscleGroup
        },
        stats: {
            lifetimeVolume,
            totalSessions,
            averageVolumePerSession: Math.round(lifetimeVolume / totalSessions),
            bestSet,
            frequency: {
                last7Days: last7DaysSessions,
                last30Days: last30DaysSessions
            },
            percentageChanges
        },
        trends: {
            volumeOverTime,
            e1RMOverTime
        },
        prHistory: [...prHistory].reverse().slice(0, 5),
        insights: insights.slice(0, 4)
    };
};

/**
 * Get all unique performed exercises for a user with summary stats
 */
const getPerformedExercises = async (userId) => {
    const uId = new mongoose.Types.ObjectId(userId);

    const results = await WorkoutLog.aggregate([
        { $match: { userId: uId, status: 'completed' } },
        { $unwind: '$performedExercises' },
        {
            $addFields: {
                'performedExercises.sessionVolume': {
                    $sum: {
                        $map: {
                            input: '$performedExercises.sets',
                            as: 'set',
                            in: { $multiply: ['$$set.weight', '$$set.reps'] }
                        }
                    }
                },
                'performedExercises.maxE1RM': {
                    $max: {
                        $map: {
                            input: '$performedExercises.sets',
                            as: 'set',
                            in: {
                                $multiply: [
                                    '$$set.weight',
                                    { $add: [1, { $divide: ['$$set.reps', 30] }] }
                                ]
                            }
                        }
                    }
                }
            }
        },
        {
            $group: {
                _id: '$performedExercises.exerciseId',
                totalSessions: { $sum: 1 },
                lifetimeVolume: { $sum: '$performedExercises.sessionVolume' },
                bestE1RM: { $max: '$performedExercises.maxE1RM' },
                lastPerformed: { $max: '$date' }
            }
        },
        {
            $lookup: {
                from: 'exercises',
                localField: '_id',
                foreignField: '_id',
                as: 'exercise'
            }
        },
        { $unwind: '$exercise' },
        {
            $project: {
                exerciseId: '$_id',
                _id: 0,
                name: '$exercise.name',
                muscleGroup: '$exercise.muscleGroup',
                totalSessions: 1,
                lifetimeVolume: 1,
                bestE1RM: { $round: ['$bestE1RM', 0] },
                lastPerformed: 1
            }
        },
        { $sort: { name: 1 } }
    ]);

    return results;
};

/**
 * Weekly Muscle Volume
 * Aggregates total sets per muscle group for the current week.
 * Returns: { chest: N, back: N, legs: N, shoulders: N, biceps: N, triceps: N, core: N }
 * Also returns per-muscle exercise count and last trained day name.
 */
const getMuscleVolume = async (userId) => {
    const { start, end } = getCurrentWeekRange();

    const pipeline = [
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: start, $lte: end },
                status: 'completed'
            }
        },
        { $unwind: '$performedExercises' },
        {
            $lookup: {
                from: 'exercises',
                localField: 'performedExercises.exerciseId',
                foreignField: '_id',
                as: 'exercise'
            }
        },
        { $unwind: '$exercise' },
        {
            $project: {
                muscleGroup: '$exercise.muscleGroup',
                setsCount: { $size: '$performedExercises.sets' },
                date: 1
            }
        },
        {
            $group: {
                _id: '$muscleGroup',
                totalSets: { $sum: '$setsCount' },
                totalExercises: { $sum: 1 },
                lastTrainedDate: { $max: '$date' }
            }
        }
    ];

    const results = await WorkoutLog.aggregate(pipeline);

    const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core'];
    const volume = {};
    const details = {};

    for (const mg of muscleGroups) {
        volume[mg] = 0;
        details[mg] = { totalSets: 0, totalExercises: 0, lastTrained: null };
    }

    for (const r of results) {
        if (muscleGroups.includes(r._id)) {
            volume[r._id] = r.totalSets;
            details[r._id] = {
                totalSets: r.totalSets,
                totalExercises: r.totalExercises,
                lastTrained: getDayName(r.lastTrainedDate)
            };
        }
    }

    return { volume, details };
};

export {
    calculateStreak,
    getWeeklySummary,
    getMonthHeatmap,
    getInsights,
    getPerformedExercises,
    getExerciseAnalytics,
    getMuscleVolume
};
