import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, Plus, Trash2, Save, Loader2,
    Dumbbell, ChevronDown, X, Notebook
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const WorkoutForm = ({
    state,
    dispatch,
    activePlan,
    onSuccess,
    setIsSearchOpen
}) => {
    const {
        selectedWorkoutId,
        logDate,
        status,
        performedExercises,
        notes,
        isSubmitting
    } = state;

    const authHeaders = useMemo(() => {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    const getLocalDateString = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Reset workout selection if the selected workout doesn't match the current day
    useEffect(() => {
        if (!selectedWorkoutId || !activePlan) return;
        const workout = activePlan.workouts.find(w => w._id === selectedWorkoutId);
        if (!workout) return;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const [y, m, d] = logDate.split('-').map(Number);
        const selectedDate = new Date(y, m - 1, d);
        const dayName = days[selectedDate.getDay()];

        if (workout.day.toLowerCase() !== dayName.toLowerCase()) {
            dispatch({ type: 'SET_FIELD', field: 'selectedWorkoutId', value: '' });
        }
    }, [logDate, activePlan, selectedWorkoutId, dispatch]);

    // Pre-fill exercises when workout is selected
    useEffect(() => {
        if (selectedWorkoutId && activePlan) {
            const workout = activePlan.workouts.find(w => w._id === selectedWorkoutId);
            if (workout) {
                const initialPerformed = workout.exercises.map(ex => ({
                    exerciseId: ex.exerciseId?._id || ex.exerciseId,
                    name: ex.exerciseId?.name || 'Exercise',
                    sets: Array.from({ length: ex.sets || 1 }, () => ({
                        reps: ex.reps || 1,
                        weight: ex.weight || 0
                    }))
                }));
                dispatch({ type: 'SET_FIELD', field: 'performedExercises', value: initialPerformed });
            }
        } else {
            dispatch({ type: 'SET_FIELD', field: 'performedExercises', value: [] });
        }
    }, [selectedWorkoutId, activePlan, dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!selectedWorkoutId) {
            dispatch({ type: 'SET_MESSAGE', payload: { type: 'error', text: 'Please select a workout.' } });
            return;
        }

        if (status === 'completed' && performedExercises.length === 0) {
            dispatch({ type: 'SET_MESSAGE', payload: { type: 'error', text: 'At least one exercise is required.' } });
            return;
        }

        for (const ex of performedExercises) {
            for (const set of ex.sets) {
                if (set.reps <= 0 || set.weight < 0) {
                    dispatch({ type: 'SET_MESSAGE', payload: { type: 'error', text: `Invalid values in ${ex.name}.` } });
                    return;
                }
            }
        }

        dispatch({ type: 'SET_SUBMITTING', value: true });
        try {
            const payload = {
                workoutId: selectedWorkoutId,
                date: logDate,
                status,
                performedExercises: performedExercises.map(ex => ({
                    exerciseId: ex.exerciseId,
                    sets: ex.sets.map(s => ({
                        reps: Number(s.reps),
                        weight: Number(s.weight)
                    }))
                })),
                notes
            };

            await axios.post(`${API_BASE_URL}/workouts/log`, payload, { headers: authHeaders });
            dispatch({ type: 'SET_MESSAGE', payload: { type: 'success', text: 'Workout logged successfully!' } });
            onSuccess();
            setTimeout(() => dispatch({ type: 'SET_MESSAGE', payload: { type: '', text: '' } }), 5000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to log workout.';
            dispatch({ type: 'SET_MESSAGE', payload: { type: 'error', text: errorMsg } });
        } finally {
            dispatch({ type: 'SET_SUBMITTING', value: false });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Session Details */}
            <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                            <ClipboardList className="w-6 h-6 text-orange-500" />
                            Session Details
                        </h2>
                        <p className="text-neutral-500 text-sm mt-1">Select your workout and date to start logging.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['Today', 'Yesterday'].map(d => {
                            const date = new Date();
                            if (d === 'Yesterday') date.setDate(date.getDate() - 1);
                            const ds = getLocalDateString(date);
                            const isActive = logDate === ds;

                            return (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => dispatch({ type: 'SET_FIELD', field: 'logDate', value: ds })}
                                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${isActive
                                        ? 'bg-black text-white border-black shadow-lg shadow-black/10'
                                        : 'bg-white text-neutral-400 border-neutral-200 hover:border-neutral-300'
                                        }`}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 ml-1">Workout from Plan</label>
                        <div className="relative">
                            <select
                                value={selectedWorkoutId}
                                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'selectedWorkoutId', value: e.target.value })}
                                className="w-full pl-4 pr-10 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm font-bold appearance-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="">Select a workout...</option>
                                {activePlan?.workouts?.filter(w => {
                                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                    const [y, m, d] = logDate.split('-').map(Number);
                                    const selectedDate = new Date(y, m - 1, d);
                                    const dayName = days[selectedDate.getDay()];
                                    return w.day.toLowerCase() === dayName.toLowerCase();
                                }).map(w => (
                                    <option key={w._id} value={w._id}>{w.day} - {w.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        </div>
                        {!activePlan && (
                            <p className="text-xs text-orange-500 font-medium italic mt-2">
                                No active plan found. <a href="/plan-builder" className="underline">Create one first.</a>
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 ml-1">Session Status</label>
                        <div className="flex gap-2">
                            {['completed', 'skipped'].map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => dispatch({ type: 'SET_FIELD', field: 'status', value: s })}
                                    className={`flex-1 py-3 rounded-2xl border transition-all font-bold text-xs uppercase tracking-widest ${status === s
                                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-lg scale-[1.02]'
                                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercises Section */}
            <AnimatePresence mode="wait">
                {status === 'completed' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-orange-500" />
                                Performed Exercises
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsSearchOpen(true)}
                                className="flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors bg-orange-50 px-3 py-2 rounded-lg"
                            >
                                <Plus className="w-4 h-4" />
                                Add Exercise
                            </button>
                        </div>

                        {performedExercises.length === 0 ? (
                            <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-[2rem] p-12 text-center">
                                <p className="text-neutral-400 font-medium">No exercises added yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {performedExercises.map((ex, idx) => (
                                    <motion.div
                                        key={idx}
                                        layout
                                        className="bg-white p-6 rounded-[2rem] border border-neutral-100 flex flex-wrap items-center gap-6 shadow-sm hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex-1 min-w-[200px]">
                                            <p className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-1">Exercise</p>
                                            <h4 className="text-xl font-black text-black uppercase tracking-tight">{ex.name}</h4>
                                            <button
                                                type="button"
                                                onClick={() => dispatch({ type: 'REMOVE_EXERCISE', index: idx })}
                                                className="mt-2 text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                                            >
                                                <X className="w-3 h-3" /> Remove Exercise
                                            </button>
                                        </div>

                                        <div className="w-full lg:flex-1 space-y-3">
                                            {ex.sets.map((set, sIdx) => (
                                                <div key={sIdx} className="flex items-center gap-4 bg-neutral-50 p-3 rounded-2xl border border-neutral-100 group/set">
                                                    <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-black text-neutral-400">
                                                        {sIdx + 1}
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={set.reps}
                                                                onChange={(e) => dispatch({ type: 'UPDATE_EXERCISE_SET', payload: { exIdx: idx, setIdx: sIdx, field: 'reps', value: parseInt(e.target.value) || 0 } })}
                                                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-black text-right"
                                                            />
                                                            <span className="text-[10px] font-black text-neutral-400">REPS</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                value={set.weight}
                                                                onChange={(e) => dispatch({ type: 'UPDATE_EXERCISE_SET', payload: { exIdx: idx, setIdx: sIdx, field: 'weight', value: parseFloat(e.target.value) || 0 } })}
                                                                className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-black text-right"
                                                            />
                                                            <span className="text-[10px] font-black text-neutral-400">KG</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => dispatch({ type: 'REMOVE_SET', payload: { exIdx: idx, setIdx: sIdx } })}
                                                        disabled={ex.sets.length <= 1}
                                                        className="p-2 text-neutral-300 hover:text-red-500 disabled:opacity-0 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => dispatch({ type: 'ADD_SET', payload: { exIdx: idx } })}
                                                className="w-full py-2 border border-dashed border-neutral-200 rounded-xl text-[10px] font-black text-neutral-400 hover:border-orange-500 hover:text-orange-500 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-3 h-3" /> Add Set
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notes Section */}
            <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2 mb-4">
                    <Notebook className="w-5 h-5 text-orange-500" />
                    Session Notes
                </h3>
                <textarea
                    value={notes}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })}
                    placeholder="How did it feel? Any PRs? Any pain?"
                    className="w-full min-h-[120px] bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end p-2 pb-12">
                <button
                    disabled={isSubmitting}
                    className="group relative overflow-hidden flex items-center gap-3 px-10 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-neutral-200 hover:bg-orange-500 hover:shadow-orange-200 transition-all duration-300 disabled:opacity-50 active:scale-95"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            SHREDDING...
                        </>
                    ) : (
                        <>
                            SAVE WORKOUT
                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default WorkoutForm;
