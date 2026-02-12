import React from 'react';
import { ChevronLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlanBuilderHeader = ({
    planName,
    onNameChange,
    onAddDay,
    backPath = '/workout-library',
    backLabel = 'Back to Library',
    isEditing = true,
    onToggleEdit,
    onSave,
    onCancel,
    onDelete,
    isSaving = false,
    nameError = null
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 flex-1">
                <button
                    onClick={() => navigate(backPath)}
                    className="flex items-center gap-2 text-neutral-500 hover:text-black font-bold transition-colors mb-4 group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {backLabel}
                </button>
                <div className="space-y-2 relative group">
                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 transition-colors ${nameError ? 'text-red-500' : 'text-neutral-400'}`}>Plan Protocol Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Hypertrophy Protocol"
                        value={planName}
                        disabled={!isEditing}
                        onChange={(e) => onNameChange(e.target.value)}
                        className={`w-full text-5xl font-black bg-transparent border-none focus:ring-0 placeholder:text-neutral-100 p-0 tracking-tighter transition-all ${!isEditing ? 'cursor-default' : 'hover:translate-x-1'} ${nameError ? 'text-red-600' : 'text-black'}`}
                    />
                    {isEditing && <div className={`h-1 bg-orange-500 rounded-full transition-all duration-500 ${planName ? 'w-32 opacity-100' : 'w-0 opacity-0'}`} />}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {isEditing ? (
                    <>
                        <button
                            onClick={onAddDay}
                            className="flex items-center gap-2 px-6 py-4 bg-white border border-neutral-200 text-black rounded-2xl font-bold hover:bg-neutral-50 transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Add Day
                        </button>
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="px-6 py-4 text-neutral-500 font-bold hover:text-black transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onDelete}
                            className="p-4 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            title="Delete Plan"
                        >
                            <Trash2 className="w-6 h-6" />
                        </button>
                        <button
                            onClick={onToggleEdit}
                            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg active:scale-95"
                        >
                            <Edit2 className="w-5 h-5" />
                            Edit Plan
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PlanBuilderHeader;
