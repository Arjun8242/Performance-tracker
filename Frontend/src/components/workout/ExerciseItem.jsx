import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, X } from 'lucide-react';
import ExerciseImage from '../common/ExerciseImage';

const ExerciseItem = ({
    exercise,
    onUpdate,
    onRemove,
    readOnly = false,
    errors = {}
}) => {
    const displayName = exercise.exerciseId?.name || exercise.name || 'Exercise';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-wrap items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border transition-all duration-300 group ${readOnly ? 'border-neutral-100 dark:border-neutral-700' : 'border-neutral-100 dark:border-neutral-700 hover:border-orange-200 hover:bg-white dark:hover:bg-neutral-900 hover:shadow-md'}`}
        >
            {/* Exercise Image or Icon */}
            {exercise.exerciseId?.image ? (
                <div className="w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-600 shadow-sm">
                    <ExerciseImage
                        src={exercise.exerciseId.image}
                        alt={displayName}
                        variant="thumbnail"
                    />
                </div>
            ) : (
                <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center border border-neutral-100 dark:border-neutral-700 shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-orange-500" />
                </div>
            )}
            <div className="flex-1 min-w-37.5">
                <h4 className="font-bold text-black dark:text-white capitalize transition-colors group-hover:text-orange-600">{displayName}</h4>
            </div>

            <div className="flex items-center gap-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Sets</label>
                    <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        disabled={readOnly}
                        onChange={(e) => onUpdate('sets', parseInt(e.target.value) || 1)}
                        className={`w-16 bg-white dark:bg-neutral-900 border rounded-lg px-2 py-1 text-center font-bold text-black dark:text-white focus:border-orange-500 outline-none transition-all ${readOnly ? 'cursor-default border-transparent bg-transparent' : errors.sets ? 'border-red-500 bg-red-50 shadow-sm shadow-red-100' : 'border-neutral-200 dark:border-neutral-700'}`}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Reps</label>
                    <input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        disabled={readOnly}
                        onChange={(e) => onUpdate('reps', parseInt(e.target.value) || 1)}
                        className={`w-16 bg-white dark:bg-neutral-900 border rounded-lg px-2 py-1 text-center font-bold text-black dark:text-white focus:border-orange-500 outline-none transition-all ${readOnly ? 'cursor-default border-transparent bg-transparent' : errors.reps ? 'border-red-500 bg-red-50 shadow-sm shadow-red-100' : 'border-neutral-200 dark:border-neutral-700'}`}
                    />                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Weight (kg)</label>
                    <input
                        type="number"
                        min="0"
                        value={exercise.weight}
                        disabled={readOnly}
                        onChange={(e) => onUpdate('weight', parseFloat(e.target.value) || 0)}
                        className={`w-20 bg-white dark:bg-neutral-900 border rounded-lg px-2 py-1 text-center font-bold text-black dark:text-white focus:border-orange-500 outline-none transition-all ${readOnly ? 'cursor-default border-transparent bg-transparent' : errors.weight ? 'border-red-500 bg-red-50 shadow-sm shadow-red-100' : 'border-neutral-200 dark:border-neutral-700'}`}
                    />
                </div>
                {!readOnly && (
                    <button
                        onClick={onRemove}
                        className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default ExerciseItem;
