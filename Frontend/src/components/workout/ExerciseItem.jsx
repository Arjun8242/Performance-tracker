import React from 'react';
import { Dumbbell, X } from 'lucide-react';

const ExerciseItem = ({
    exercise,
    onUpdate,
    onRemove
}) => {
    return (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-neutral-100 shadow-sm">
                <Dumbbell className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-[150px]">
                <h4 className="font-bold text-black capitalize">{exercise.name}</h4>
            </div>

            <div className="flex items-center gap-6">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Sets</label>
                    <input
                        type="number"
                        min="1"
                        value={exercise.sets}
                        onChange={(e) => onUpdate('sets', parseInt(e.target.value) || 0)}
                        className="w-16 bg-white border border-neutral-200 rounded-lg px-2 py-1 text-center font-bold focus:border-orange-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Reps</label>
                    <input
                        type="number"
                        min="1"
                        value={exercise.reps}
                        onChange={(e) => onUpdate('reps', parseInt(e.target.value) || 0)}
                        className="w-16 bg-white border border-neutral-200 rounded-lg px-2 py-1 text-center font-bold focus:border-orange-500 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Weight (kg)</label>
                    <input
                        type="number"
                        min="0"
                        value={exercise.weight}
                        onChange={(e) => onUpdate('weight', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-white border border-neutral-200 rounded-lg px-2 py-1 text-center font-bold focus:border-orange-500 outline-none"
                    />
                </div>
                <button
                    onClick={onRemove}
                    className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ExerciseItem;
