import WorkoutLog from '../models/workoutLog.model.js';
import WorkoutPlan from '../models/workoutPlan.model.js';
import { normalizeDate, getCurrentWeekRange, getDayName } from '../utils/date.utils.js';

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

export {
    calculateStreak,
    getWeeklySummary,
    getMonthHeatmap,
    getInsights
};
