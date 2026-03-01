import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';

import ExerciseItem from './ExerciseItem';

const DAYS = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
];

const WorkoutDayCard = ({
    workout,
    onUpdateDay,
    onRemoveDay,
    onUpdateExercise,
    onRemoveExercise,
    onAddExercise,
    readOnly = false,
    errors = {}
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-white dark:bg-neutral-900 rounded-[2.5rem] border shadow-sm overflow-hidden transition-all duration-300 ${readOnly ? 'border-neutral-200 dark:border-neutral-800' : 'border-neutral-200 dark:border-neutral-800 hover:border-orange-200 hover:shadow-xl'}`}
        >
            {/* Workout Header */}
            <div className={`p-6 bg-neutral-50/50 dark:bg-neutral-800/50 border-b flex flex-wrap items-center gap-4 transition-colors ${errors.name ? 'border-red-100 bg-red-50/30' : 'border-neutral-100 dark:border-neutral-700'}`}>
                <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2 shadow-sm">
                    <select
                        value={workout.day}
                        disabled={readOnly}
                        onChange={(e) => onUpdateDay('day', e.target.value)}
                        className={`bg-transparent font-bold text-sm focus:ring-0 outline-none capitalize ${readOnly ? 'appearance-none pl-0' : 'cursor-pointer'}`}
                    >
                        {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-50 relative group">
                    <input
                        type="text"
                        value={workout.name}
                        disabled={readOnly}
                        onChange={(e) => onUpdateDay('name', e.target.value)}
                        placeholder="Workout Name (e.g., Push Day)"
                        className={`w-full bg-transparent border-none focus:ring-0 text-xl font-bold text-black dark:text-white placeholder:text-neutral-300 transition-all ${readOnly ? 'cursor-default' : 'hover:translate-x-1'} ${errors.name ? 'text-red-600' : ''}`}
                    />
                    {!readOnly && <div className={`absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${workout.name ? 'w-full opacity-50' : 'w-0'}`} />}
                </div>

                {!readOnly && (
                    <button
                        onClick={onRemoveDay}
                        className="p-3 text-neutral-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-red-100"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Exercises List */}
            <div className="p-6 space-y-4">
                <AnimatePresence mode="popLayout">
                    {workout.exercises.map((ex, einx) => (
                        <ExerciseItem
                            key={ex.exerciseId?._id || ex.exerciseId || einx}
                            exercise={ex}
                            readOnly={readOnly}
                            errors={errors.exercises?.[einx] || {}}
                            onUpdate={(field, value) => onUpdateExercise(einx, field, value)}
                            onRemove={() => onRemoveExercise(einx)}
                        />
                    ))}
                </AnimatePresence>

                {!readOnly && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-100 mt-6">
                        <button
                            onClick={onAddExercise}
                            className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-orange-500 transition-all active:scale-95 shadow-md hover:shadow-orange-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            Add Exercise
                        </button>
                        <p className="text-xs text-neutral-400 font-medium italic flex items-center gap-1">
                            <Plus className="w-3 h-3" /> All exercises here are saved to your plan.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default WorkoutDayCard;
export { DAYS };
