import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';

const PlanBuilderSaveBar = ({
    workoutCount,
    exerciseCount,
    onSave,
    onCancel,
    isSaving
}) => {
    const navigate = useNavigate();

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/workout-library');
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 z-50">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <div className="hidden sm:block">
                    <p className="text-neutral-500 font-medium">
                        Plan contains <span className="text-black dark:text-white font-bold">{workoutCount} days</span> and <span className="text-black dark:text-white font-bold">{exerciseCount} total exercises</span>
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={handleCancel}
                        className="flex-1 sm:flex-none px-8 py-4 text-neutral-500 hover:text-black dark:hover:text-white font-bold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-200 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all active:scale-95 min-w-[200px]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Workout Plan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanBuilderSaveBar;
