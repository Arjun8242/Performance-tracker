import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * WorkoutCalendar Component
 * A "cute" month-by-month calendar that highlights completed workouts and rest days.
 */
const WorkoutCalendar = ({ logs = [], currentStreak = 0 }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calendar Helper Functions
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Map logs to a date string key for quick lookup: "YYYY-MM-DD"
    const completedDates = logs.reduce((acc, log) => {
        if (log.status === 'completed') {
            const dateStr = new Date(log.date).toISOString().split('T')[0];
            acc[dateStr] = true;
        }
        return acc;
    }, {});

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-black tracking-tight uppercase">
                        {monthName} <span className="text-orange-500">{year}</span>
                    </h3>
                    <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                        Consistency Heatmap
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-3 hover:bg-neutral-50 rounded-2xl transition-colors text-neutral-400 hover:text-black border border-neutral-100"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-3 hover:bg-neutral-50 rounded-2xl transition-colors text-neutral-400 hover:text-black border border-neutral-100"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-4">
                {/* Weekday Names */}
                {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-neutral-300 py-2">
                        {day}
                    </div>
                ))}

                {/* Empty cells for start of month */}
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: totalDays }).map((_, i) => {
                    const day = i + 1;
                    const getLocalDateString = (d) => {
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                    };

                    const dateObj = new Date(year, month, day);
                    const dateStr = getLocalDateString(dateObj);
                    const isSunday = dateObj.getDay() === 0;
                    const isCompleted = completedDates[dateStr];
                    const isToday = getLocalDateString(new Date()) === dateStr;

                    return (
                        <motion.div
                            key={day}
                            whileHover={{ scale: 1.05 }}
                            className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border group
                                ${isCompleted
                                    ? 'bg-orange-500 border-orange-400 shadow-lg shadow-orange-200 text-white'
                                    : isSunday
                                        ? 'bg-neutral-50 border-neutral-100 text-neutral-300'
                                        : 'bg-white border-neutral-100 text-neutral-900 hover:border-orange-200'
                                }
                                ${isToday && !isCompleted ? 'ring-2 ring-orange-500/20 border-orange-500/50' : ''}
                            `}
                        >
                            <span className={`text-sm font-black ${isSunday && !isCompleted ? 'opacity-50' : ''}`}>
                                {day}
                            </span>

                            <div className="absolute bottom-1.5">
                                {isCompleted ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex flex-col items-center"
                                    >
                                        <Flame className="w-3 h-3 text-white fill-white" />
                                        {currentStreak > 0 && day === new Date().getDate() && month === new Date().getMonth() && (
                                            <span className="text-[8px] font-black absolute -top-4 -right-2 bg-black text-white px-1 rounded-sm">
                                                {currentStreak}
                                            </span>
                                        )}
                                    </motion.div>
                                ) : isSunday ? (
                                    <Coffee className="w-3 h-3 text-neutral-300" />
                                ) : null}
                            </div>

                            {/* Tooltip on hover */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {isCompleted ? 'Workout Done!' : isSunday ? 'Rest Day' : 'Pending'}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-8 flex items-center justify-center gap-6 border-t border-neutral-50 pt-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-neutral-50 border border-neutral-100" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Rest / Sunday</span>
                </div>
            </div>
        </div>
    );
};

export default WorkoutCalendar;
