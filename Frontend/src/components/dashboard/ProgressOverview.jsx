import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Zap, AlertCircle } from 'lucide-react';

/**
 * ProgressOverview Component
 * Displays a 3-card grid containing weekly completion, current streak, and motivation status.
 */
const ProgressOverview = ({ summary, streak, isLoading, error }) => {
    // Loading State: Skeleton Cards
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-[2.5rem] h-48"
                    />
                ))}
            </div>
        );
    }

    // Error State: Subtle inline error
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 rounded-[2.5rem] p-6 mb-12 flex items-center gap-3 text-red-700"
            >
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="font-medium text-sm">Progress temporarily unavailable.</p>
            </motion.div>
        );
    }

    // Percentage clamping and formatting
    const percentage = summary ? Math.min(100, Math.max(0, summary.percentage)) : 0;
    const isCompleted = percentage === 100;

    // Motivation message logic
    const getMotivationMessage = (pct) => {
        if (pct === 0) return 'Let’s begin.';
        if (pct < 50) return 'Building momentum.';
        if (pct < 80) return 'Strong consistency.';
        return 'Elite discipline.';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
            {/* Card 1: Weekly Completion */}
            <motion.div
                variants={itemVariants}
                className={`bg-white dark:bg-neutral-900 border p-8 rounded-[2.5rem] shadow-sm transition-all duration-500 ${isCompleted ? 'border-emerald-500/30 ring-4 ring-emerald-500/5 dark:ring-emerald-500/20' : 'border-neutral-200 dark:border-neutral-800'}`}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-neutral-400 mb-2">Weekly Completion</p>
                        <h3 className="text-4xl font-black text-black dark:text-white tracking-tight">
                            {percentage}%
                        </h3>
                    </div>
                    <div className={`p-4 rounded-2xl transition-all duration-700 ${isCompleted ? 'bg-emerald-500 text-white rotate-12 scale-110 shadow-lg shadow-emerald-200' : 'bg-orange-50 text-orange-500'}`}>
                        <Trophy className="w-6 h-6" />
                    </div>
                </div>

                <p className="text-neutral-500 text-sm font-semibold mb-6">
                    {summary?.total === 0 ? 'No plan yet' : `${summary?.completed || 0} of ${summary?.total || 0} workouts completed`}
                </p>

                <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-orange-500'}`}
                    />
                </div>
            </motion.div>

            {/* Card 2: Current Streak */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 rounded-[2.5rem] shadow-sm group hover:border-orange-500/30 dark:hover:border-orange-500/50 transition-colors duration-500"
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-neutral-400 mb-2">Current Streak</p>
                        <div className="flex items-baseline gap-2">
                            <motion.h3
                                key={streak?.currentStreak}
                                initial={{ scale: 1.2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-4xl font-black text-black dark:text-white tracking-tight"
                            >
                                {streak?.currentStreak || 0}
                            </motion.h3>
                            <span className="text-neutral-400 text-sm font-bold uppercase tracking-widest">Days</span>
                        </div>
                    </div>
                    <div className={`p-4 rounded-2xl transition-all duration-700 ${streak?.currentStreak > 0 ? 'bg-orange-500 text-white shadow-xl shadow-orange-200 scale-110' : 'bg-neutral-50 text-neutral-300'}`}>
                        <Flame className={`w-6 h-6 ${streak?.currentStreak > 0 ? 'animate-bounce' : ''}`} />
                    </div>
                </div>

                <p className="text-neutral-500 text-sm font-semibold">
                    {streak?.currentStreak > 0 ? 'Consistency is key. Keep it up!' : 'Start your streak today'}
                </p>

                {streak?.currentStreak > 0 && (
                    <motion.div
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mt-4 h-1 w-12 bg-orange-500 rounded-full"
                    />
                )}
            </motion.div>

            {/* Card 3: Motivation Status */}
            <motion.div
                variants={itemVariants}
                className="bg-neutral-900 dark:bg-black border border-neutral-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
            >
                {/* Background Decoration */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-orange-500 rounded-full blur-3xl"
                />

                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-orange-500 mb-4">Training Intelligence</p>
                        <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
                            {getMotivationMessage(percentage)}
                        </h3>
                    </div>

                    <div className="mt-auto flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-500 fill-orange-500/20" />
                        </div>
                        <div>
                            <p className="text-white text-[10px] font-black uppercase tracking-widest">System Status</p>
                            <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Active & Synced</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProgressOverview;
