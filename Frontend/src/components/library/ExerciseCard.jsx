import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, CheckCircle2, Plus, Filter, TrendingUp, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExerciseCard = ({ exercise, isSelected, onSelect }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            layout
            whileHover={{ y: -5 }}
            className={`group relative bg-white dark:bg-neutral-900 rounded-4xl border-2 transition-all duration-300 overflow-hidden ${isSelected ? 'border-orange-500 shadow-xl shadow-orange-500/10' : 'border-neutral-100 dark:border-neutral-800 hover:border-orange-500/30 shadow-sm'
                }`}
        >
            {/* Visual Header */}
            <div className={`h-32 p-6 flex items-start justify-between transition-colors ${isSelected ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-neutral-50 dark:bg-neutral-800 group-hover:bg-orange-50/30 dark:group-hover:bg-orange-500/10'
                }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-orange-500 border-orange-500 scale-110' : 'bg-white border-neutral-100 group-hover:border-orange-500/20'
                    }`}>
                    <Dumbbell className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-neutral-400 group-hover:text-orange-500'}`} />
                </div>
                <button
                    onClick={onSelect}
                    className={`p-2 rounded-xl transition-all ${isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-neutral-300 border border-neutral-100 hover:text-orange-500 hover:border-orange-500/50'
                        }`}
                >
                    {isSelected ? <CheckCircle2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/5 px-2 py-0.5 rounded-md border border-orange-500/10 mb-2 inline-block">
                        {exercise.muscleGroup}
                    </span>
                    <h3 className="text-lg font-bold text-black dark:text-white group-hover:text-orange-600 transition-colors line-clamp-1 capitalize">
                        {exercise.name}
                    </h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-neutral-500">
                        <Filter className="w-4 h-4 text-neutral-300" />
                        <span className="text-xs font-semibold capitalize">{exercise.equipment}</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500">
                        <TrendingUp className="w-4 h-4 text-neutral-300" />
                        <span className="text-xs font-semibold capitalize">{exercise.difficulty}</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate(`/exercise/${exercise.id || exercise._id}`)}
                    className="w-full mt-6 py-3 px-4 bg-neutral-50 dark:bg-neutral-800 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black text-neutral-400 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                    <BarChart2 className="w-4 h-4" />
                    View Analytics
                </button>
            </div>
        </motion.div>
    );
};

export default ExerciseCard;
