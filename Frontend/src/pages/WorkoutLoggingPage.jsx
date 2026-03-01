import React, { useEffect, useCallback, useReducer } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    History, Plus, CheckCircle2, AlertCircle, X, Loader2
} from 'lucide-react';

import WorkoutForm from '../components/workout/WorkoutForm';
import WorkoutHistory from '../components/workout/WorkoutHistory';
import ExerciseSearchModal from '../components/workout/ExerciseSearchModal';

const API_BASE_URL = 'http://localhost:3000';

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const initialState = {
    selectedWorkoutId: '',
    logDate: getLocalDateString(),
    status: 'completed',
    performedExercises: [],
    notes: '',
    isSubmitting: false,
    message: { type: '', text: '' },
    logs: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    filters: { from: '', to: '' },
    isLoading: false,
    isHistoryView: false,
    isSearchOpen: false,
    activePlan: null
};

function workoutReducer(state, action) {
    switch (action.type) {
        case 'SET_FILTERS':
            return {
                ...state,
                filters: { ...state.filters, ...action.payload }
            };
        case 'CLEAR_FILTERS':
            return {
                ...state,
                filters: { from: '', to: '' }
            };
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'SET_MESSAGE':
            return { ...state, message: action.payload };
        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.value };
        case 'SET_LOADING':
            return { ...state, isLoading: action.value };
        case 'SET_LOGS':
            return { ...state, logs: action.payload.logs, pagination: action.payload.pagination };
        case 'SET_ACTIVE_PLAN':
            return { ...state, activePlan: action.payload };
        case 'UPDATE_EXERCISE_SET': {
            const { exIdx, setIdx, field, value } = action.payload;
            const updated = [...state.performedExercises];
            const updatedSets = [...updated[exIdx].sets];
            updatedSets[setIdx] = { ...updatedSets[setIdx], [field]: value };
            updated[exIdx] = { ...updated[exIdx], sets: updatedSets };
            return { ...state, performedExercises: updated };
        }
        case 'ADD_SET': {
            const { exIdx } = action.payload;
            const updated = [...state.performedExercises];
            const lastSet = updated[exIdx].sets[updated[exIdx].sets.length - 1] || { reps: 1, weight: 0 };
            updated[exIdx] = {
                ...updated[exIdx],
                sets: [...updated[exIdx].sets, { ...lastSet }]
            };
            return { ...state, performedExercises: updated };
        }
        case 'REMOVE_SET': {
            const { exIdx, setIdx } = action.payload;
            const updated = [...state.performedExercises];
            if (updated[exIdx].sets.length > 1) {
                updated[exIdx] = {
                    ...updated[exIdx],
                    sets: updated[exIdx].sets.filter((_, i) => i !== setIdx)
                };
            }
            return { ...state, performedExercises: updated };
        }
        case 'REMOVE_EXERCISE':
            return {
                ...state,
                performedExercises: state.performedExercises.filter((_, i) => i !== action.index)
            };
        case 'ADD_EXERCISE':
            return {
                ...state,
                performedExercises: [...state.performedExercises, action.payload]
            };
        case 'RESET_FORM':
            return {
                ...state,
                selectedWorkoutId: '',
                status: 'completed',
                performedExercises: [],
                notes: '',
                message: { type: 'success', text: 'Workout logged successfully!' }
            };
        default:
            return state;
    }
}

const WorkoutLoggingPage = () => {
    const [state, dispatch] = useReducer(workoutReducer, initialState);

    const fetchActivePlan = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/workouts/plan`);
            dispatch({ type: 'SET_ACTIVE_PLAN', payload: res.data });
        } catch (err) {
            console.error('Error fetching active plan:', err);
        }
    }, []);

    const fetchLogs = useCallback(async (page = 1) => {
        dispatch({ type: 'SET_LOADING', value: true });
        try {
            const params = {
                page,
                limit: state.pagination.limit,
                from: state.filters.from || undefined,
                to: state.filters.to || undefined
            };
            const res = await axios.get(`${API_BASE_URL}/workouts/logs`, {
                params
            });
            dispatch({
                type: 'SET_LOGS',
                payload: {
                    logs: res.data.data,
                    pagination: {
                        page: res.data.page,
                        limit: res.data.limit,
                        total: res.data.total,
                        totalPages: res.data.totalPages
                    }
                }
            });
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            dispatch({ type: 'SET_LOADING', value: false });
        }
    }, [state.filters, state.pagination.limit]);

    useEffect(() => {
        fetchActivePlan();
        fetchLogs();
    }, [fetchActivePlan, fetchLogs]);

    const handleSelectExerciseFromSearch = (exercise) => {
        dispatch({
            type: 'ADD_EXERCISE',
            payload: {
                exerciseId: exercise.id || exercise._id,
                name: exercise.name,
                sets: [{ reps: 1, weight: 0 }]
            }
        });
        dispatch({ type: 'SET_FIELD', field: 'isSearchOpen', value: false });
    };

    return (
        <div className="min-h-screen pb-12 font-['Poppins']">
            {/* Header */}
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-black dark:text-white tracking-tight uppercase">
                        Workout <span className="text-orange-500">Logger</span>
                    </h1>
                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-widest mt-2">
                        Tracking consistency, one set at a time.
                    </p>
                </div>

                <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1.5 rounded-2xl shadow-sm">
                    <button
                        onClick={() => dispatch({ type: 'SET_FIELD', field: 'isHistoryView', value: false })}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!state.isHistoryView ? 'bg-black text-white shadow-lg' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}
                    >
                        <Plus className="w-4 h-4" />
                        Log Session
                    </button>
                    <button
                        onClick={() => dispatch({ type: 'SET_FIELD', field: 'isHistoryView', value: true })}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${state.isHistoryView ? 'bg-black text-white shadow-lg' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}
                    >
                        <History className="w-4 h-4" />
                        View History
                    </button>
                </div>
            </header>

            {/* Notifications */}
            <AnimatePresence>
                {state.message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border ${state.message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                            }`}
                    >
                        {state.message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {state.message.text}
                        <button onClick={() => dispatch({ type: 'SET_MESSAGE', payload: { type: '', text: '' } })} className="ml-4 opacity-50 hover:opacity-100">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto">
                {state.isHistoryView ? (
                    <WorkoutHistory
                        logs={state.logs}
                        pagination={state.pagination}
                        filters={state.filters}
                        isLoading={state.isLoading}
                        fetchLogs={fetchLogs}
                        onFilterChange={(payload) => dispatch({ type: 'SET_FILTERS', payload })}
                        onClearFilters={() => dispatch({ type: 'CLEAR_FILTERS' })}
                    />
                ) : (
                    <WorkoutForm
                        state={state}
                        dispatch={dispatch}
                        activePlan={state.activePlan}
                        onSuccess={() => {
                            dispatch({ type: 'RESET_FORM' });
                            fetchLogs();
                        }}
                        setIsSearchOpen={(val) => dispatch({ type: 'SET_FIELD', field: 'isSearchOpen', value: val })}
                    />
                )}
            </main>

            {/* Modal */}
            <ExerciseSearchModal
                isOpen={state.isSearchOpen}
                onClose={() => dispatch({ type: 'SET_FIELD', field: 'isSearchOpen', value: false })}
                onSelectExercise={handleSelectExerciseFromSearch}
            />
        </div>
    );
};

export default WorkoutLoggingPage;
