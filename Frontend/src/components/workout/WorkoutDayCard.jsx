import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
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
    onRemoveExercise
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[2.5rem] border border-neutral-200 shadow-sm overflow-hidden"
        >
            {/* Workout Header */}
            <div className="p-6 bg-neutral-50/50 border-b border-neutral-100 flex flex-wrap items-center gap-4">
                <select
                    value={workout.day}
                    onChange={(e) => onUpdateDay('day', e.target.value)}
                    className="bg-white border border-neutral-200 rounded-xl px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none capitalize"
                >
                    {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <input
                    type="text"
                    value={workout.name}
                    onChange={(e) => onUpdateDay('name', e.target.value)}
                    placeholder="Workout Name (e.g., Push Day)"
                    className="flex-1 min-w-[200px] bg-transparent border-none focus:ring-0 text-xl font-bold text-black placeholder:text-neutral-300"
                />
                <button
                    onClick={onRemoveDay}
                    className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Exercises List */}
            <div className="p-6 space-y-4">
                {workout.exercises.map((ex, einx) => (
                    <ExerciseItem
                        key={ex.exerciseId + einx}
                        exercise={ex}
                        onUpdate={(field, value) => onUpdateExercise(einx, field, value)}
                        onRemove={() => onRemoveExercise(einx)}
                    />
                ))}

                <div className="pt-2">
                    <p className="text-xs text-neutral-400 font-medium italic">
                        Tip: All exercises selected from the library are automatically added to new days.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default WorkoutDayCard;
export { DAYS };
