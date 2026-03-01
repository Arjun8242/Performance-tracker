import React from 'react';
import { ChevronLeft, ChevronRight, Flame, Coffee, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Centralized status resolver for heatmap cells.
 * Rules:
 *   - Green  → workout completed
 *   - Red    → workout missed or skipped
 *   - No color → Sunday (rest day, even if workout exists)
 *   - Light grey → future dates
 *   - Neutral grey → no workout scheduled
 *
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {number} dayOfWeek - 0 (Sun) to 6 (Sat)
 * @param {Object} heatmapData - { "YYYY-MM-DD": "completed"|"missed"|"skipped"|"rest"|"upcoming" }
 * @returns {'completed'|'missed'|'skipped'|'rest'|'upcoming'|'none'}
 */
const getWorkoutDayStatus = (dateStr, dayOfWeek, heatmapData) => {
    // Rule: Sundays NEVER show red — always treated as rest regardless of data
    if (dayOfWeek === 0) return 'rest';

    const status = heatmapData[dateStr];
    if (!status) return 'none';
    return status;
};

/** Tailwind class mapping per status */
const STATUS_STYLES = {
    completed: 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 text-white',
    missed: 'bg-red-500/90 border-red-400 text-white',
    skipped: 'bg-red-400/80 border-red-300 text-white',
    rest: 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-700 text-neutral-300 dark:text-neutral-500',
    upcoming: 'bg-neutral-100/60 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 text-neutral-400',
    none: 'bg-white dark:bg-neutral-800/30 border-neutral-100 dark:border-neutral-700 text-neutral-400',
};

const STATUS_TOOLTIPS = {
    completed: 'Workout Done!',
    missed: 'Missed Workout',
    skipped: 'Skipped',
    rest: 'Rest Day',
    upcoming: 'Upcoming',
    none: 'No Workout Scheduled',
};

/**
 * WorkoutCalendar Component
 * Month-by-month heatmap calendar powered by backend heatmap API data.
 * Supports dynamic month navigation — all months (including February) render correctly.
 */
const WorkoutCalendar = ({ heatmapData = {}, calendarDate = new Date(), onPrevMonth, onNextMonth, isLoading = false, currentStreak = 0 }) => {
    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthName = calendarDate.toLocaleString('default', { month: 'long' });

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const formatDateStr = (y, m, d) =>
        `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const now = new Date();
    const todayStr = formatDateStr(now.getFullYear(), now.getMonth(), now.getDate());

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-black dark:text-white tracking-tight uppercase">
                        {monthName} <span className="text-orange-500">{year}</span>
                    </h3>
                    <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        Consistency Heatmap
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onPrevMonth}
                        className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-2xl transition-colors text-neutral-400 hover:text-black dark:hover:text-white border border-neutral-100 dark:border-neutral-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onNextMonth}
                        className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-2xl transition-colors text-neutral-400 hover:text-black dark:hover:text-white border border-neutral-100 dark:border-neutral-700"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
            ) : (
                <div className="grid grid-cols-7 gap-4">
                    {/* Weekday Names */}
                    {weekDays.map(wd => (
                        <div key={wd} className="text-center text-[10px] font-black uppercase tracking-widest text-neutral-300 py-2">
                            {wd}
                        </div>
                    ))}

                    {/* Empty cells for start of month */}
                    {Array.from({ length: startDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: totalDays }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = formatDateStr(year, month, day);
                        const dateObj = new Date(year, month, day);
                        const dayOfWeek = dateObj.getDay();
                        const isToday = dateStr === todayStr;

                        const status = getWorkoutDayStatus(dateStr, dayOfWeek, heatmapData);
                        const cellStyle = STATUS_STYLES[status] || STATUS_STYLES.none;
                        const tooltip = STATUS_TOOLTIPS[status] || '';

                        return (
                            <motion.div
                                key={day}
                                whileHover={{ scale: 1.05 }}
                                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border group
                                    ${cellStyle}
                                    ${isToday ? 'ring-2 ring-orange-500/30 border-orange-500/50' : ''}
                                `}
                            >
                                <span className={`text-sm font-black ${status === 'rest' ? 'opacity-50' : ''}`}>
                                    {day}
                                </span>

                                <div className="absolute bottom-1.5">
                                    {status === 'completed' ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="flex flex-col items-center"
                                        >
                                            <Flame className="w-3 h-3 text-white fill-white" />
                                            {currentStreak > 0 && isToday && (
                                                <span className="text-[8px] font-black absolute -top-4 -right-2 bg-black text-white px-1 rounded-sm">
                                                    {currentStreak}
                                                </span>
                                            )}
                                        </motion.div>
                                    ) : status === 'rest' ? (
                                        <Coffee className="w-3 h-3 text-neutral-300 dark:text-neutral-500" />
                                    ) : status === 'missed' || status === 'skipped' ? (
                                        <X className="w-3 h-3 text-white/80" />
                                    ) : null}
                                </div>

                                {/* Tooltip on hover */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    {tooltip}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Legend */}
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap border-t border-neutral-50 dark:border-neutral-800 pt-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/90" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Missed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Upcoming</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-neutral-50 border border-neutral-100" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Rest</span>
                </div>
            </div>
        </div>
    );
};

export default WorkoutCalendar;
