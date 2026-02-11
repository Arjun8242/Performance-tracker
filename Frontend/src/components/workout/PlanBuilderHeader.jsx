import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlanBuilderHeader = ({
    planName,
    onNameChange,
    onAddDay
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 flex-1">
                <button
                    onClick={() => navigate('/workout-library')}
                    className="flex items-center gap-2 text-neutral-500 hover:text-black font-bold transition-colors mb-4"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Library
                </button>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-400 uppercase tracking-widest ml-1">Plan Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Summer Shred 2024"
                        value={planName}
                        onChange={(e) => onNameChange(e.target.value)}
                        className="w-full text-4xl font-extrabold bg-transparent border-none focus:ring-0 placeholder:text-neutral-200 p-0 text-black"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onAddDay}
                    className="flex items-center gap-2 px-6 py-4 bg-black text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Workout Day
                </button>
            </div>
        </div>
    );
};

export default PlanBuilderHeader;
