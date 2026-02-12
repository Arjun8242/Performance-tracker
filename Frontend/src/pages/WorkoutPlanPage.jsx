import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Plus, Dumbbell, AlertCircle, Loader2, X,
    ChevronRight, ArrowLeft, Trophy, Calendar, Zap,
    Star, Info, Filter, CheckCircle2
} from 'lucide-react';

import PlanBuilderHeader from '../components/workout/PlanBuilderHeader';
import WorkoutDayCard from '../components/workout/WorkoutDayCard';
import PlanBuilderSaveBar from '../components/workout/PlanBuilderSaveBar';
import ErrorMessage from '../components/common/ErrorMessage';
import ExerciseSearchModal from '../components/workout/ExerciseSearchModal';

const API_BASE_URL = 'http://localhost:3000';

const WorkoutPlanPage = () => {
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [originalPlan, setOriginalPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Search Modal State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeDayIndex, setActiveDayIndex] = useState(null);

    const authHeaders = useMemo(() => {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    const fetchPlan = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/workouts/plan`, {
                headers: authHeaders
            });
            if (res.data) {
                setPlan(res.data);
                setOriginalPlan(JSON.parse(JSON.stringify(res.data)));
            }
        } catch (err) {
            if (err.response?.status !== 404) {
                setError('Failed to fetch workout plan. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [authHeaders]);

    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    const addExerciseToDay = (exercise) => {
        if (activeDayIndex === null) return;

        setPlan(prev => {
            const newWorkouts = prev.workouts.map((workout, idx) => {
                if (idx === activeDayIndex) {
                    return {
                        ...workout,
                        exercises: [
                            ...workout.exercises,
                            {
                                exerciseId: exercise.id || exercise._id,
                                name: exercise.name,
                                sets: 3,
                                reps: 10,
                                weight: 0
                            }
                        ]
                    };
                }
                return workout;
            });
            return { ...prev, workouts: newWorkouts };
        });
        setIsSearchOpen(false);
    };

    const handleUpdateDay = (index, field, value) => {
        setPlan(prev => {
            const newWorkouts = [...prev.workouts];
            // If index is null, it means we are updating the plan's name
            if (index === null && field === 'name') {
                return { ...prev, name: value };
            }
            newWorkouts[index] = { ...newWorkouts[index], [field]: value };
            return { ...prev, workouts: newWorkouts };
        });
        // Clear specific error when user types
        if (validationErrors.workouts?.[index]?.[field]) {
            const newErrors = { ...validationErrors };
            delete newErrors.workouts[index][field];
            setValidationErrors(newErrors);
        }
        if (field === 'name' && validationErrors.name) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.name;
                return newErrors;
            });
        }
    };

    const handleUpdateExercise = (dayIndex, exIndex, field, value) => {
        setPlan(prev => {
            const newWorkouts = [...prev.workouts];
            const newExercises = [...newWorkouts[dayIndex].exercises];
            newExercises[exIndex] = { ...newExercises[exIndex], [field]: value };
            newWorkouts[dayIndex] = { ...newWorkouts[dayIndex], exercises: newExercises };
            return { ...prev, workouts: newWorkouts };
        });
        // Clear specific error
        if (validationErrors.workouts?.[dayIndex]?.exercises?.[exIndex]?.[field]) {
            setValidationErrors(prev => {
                const newErrors = JSON.parse(JSON.stringify(prev));
                delete newErrors.workouts[dayIndex].exercises[exIndex][field];
                return newErrors;
            });
        }
    };

    const handleRemoveDay = (index) => {
        setPlan(prev => ({
            ...prev,
            workouts: prev.workouts.filter((_, i) => i !== index)
        }));
    };

    const handleRemoveExercise = (dayIndex, exIndex) => {
        setPlan(prev => {
            const newWorkouts = [...prev.workouts];
            newWorkouts[dayIndex].exercises = newWorkouts[dayIndex].exercises.filter((_, i) => i !== exIndex);
            return { ...prev, workouts: newWorkouts };
        });
    };

    const handleAddDay = () => {
        setPlan(prev => ({
            ...prev,
            workouts: [
                ...prev.workouts,
                {
                    day: 'monday',
                    name: `Session ${prev.workouts.length + 1}`,
                    exercises: []
                }
            ]
        }));
    };

    const validatePlan = () => {
        const errors = { workouts: [] };
        let hasErrors = false;

        if (!plan.name.trim()) {
            errors.name = "Plan name is required";
            hasErrors = true;
        }

        if (plan.workouts.length === 0) {
            errors.general = "At least one workout day is required";
            hasErrors = true;
        }

        plan.workouts.forEach((workout, wIdx) => {
            const dayErrors = { exercises: [] };
            if (!workout.name.trim()) {
                dayErrors.name = "Required";
                hasErrors = true;
            }
            if (workout.exercises.length === 0) {
                dayErrors.general = "Add at least one exercise";
                hasErrors = true;
            }

            workout.exercises.forEach((ex, eIdx) => {
                const exErrors = {};
                if (ex.sets <= 0) { exErrors.sets = true; hasErrors = true; }
                if (ex.reps <= 0) { exErrors.reps = true; hasErrors = true; }
                if (ex.weight < 0) { exErrors.weight = true; hasErrors = true; }
                dayErrors.exercises[eIdx] = exErrors;
            });
            errors.workouts[wIdx] = dayErrors;
        });

        setValidationErrors(hasErrors ? errors : {});
        return !hasErrors;
    };

    const handleSave = async () => {
        if (!validatePlan()) {
            setError("Please fix the highlighted errors before saving.");
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            const payload = {
                name: plan.name,
                workouts: plan.workouts.map(w => ({
                    day: w.day,
                    name: w.name,
                    exercises: w.exercises.map(ex => ({
                        exerciseId: ex.exerciseId?._id || ex.exerciseId,
                        sets: Number(ex.sets),
                        reps: Number(ex.reps),
                        weight: Number(ex.weight)
                    }))
                }))
            };

            await axios.put(`${API_BASE_URL}/workouts/plan`, payload, {
                headers: authHeaders
            });

            setOriginalPlan(JSON.parse(JSON.stringify(plan)));
            setIsEditing(false);
            setValidationErrors({});
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update plan.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setPlan(JSON.parse(JSON.stringify(originalPlan)));
        setIsEditing(false);
        setValidationErrors({});
        setError(null);
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete entire workout plan?')) return;
        setIsSaving(true);
        try {
            await axios.delete(`${API_BASE_URL}/workouts/plan`, { headers: authHeaders });
            setPlan(null);
            setOriginalPlan(null);
            setIsEditing(false);
        } catch (err) { setError('Failed to delete plan.'); }
        finally { setIsSaving(false); }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
                <div className="relative">
                    <div className="w-24 h-24 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin" />
                    <Dumbbell className="w-10 h-10 text-orange-500 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-center">
                    <p className="text-2xl font-black text-black uppercase tracking-tighter">Syncing Stats</p>
                    <p className="text-neutral-500 font-medium">Preparing your elite routine...</p>
                </div>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="max-w-4xl mx-auto py-20 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8 bg-white border border-neutral-100 p-16 rounded-[4rem] shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Trophy className="w-64 h-64 text-orange-500" />
                    </div>

                    <div className="w-24 h-24 bg-orange-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-orange-500/20">
                        <Zap className="w-12 h-12" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-black tracking-tighter uppercase">No Active Protocol</h1>
                        <p className="text-neutral-500 text-xl max-w-lg mx-auto leading-relaxed">
                            Your training evolution begins here. Start by building a protocol tailored to your physical peak.
                        </p>
                    </div>

                    <Link
                        to="/workout-library"
                        className="inline-flex items-center gap-4 px-12 py-6 bg-black text-white rounded-[2.5rem] font-black uppercase text-sm tracking-widest hover:bg-orange-500 transition-all shadow-2xl active:scale-95 group"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        Initialize Plan
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={`max-w-5xl mx-auto space-y-16 pb-40 px-4 transition-all duration-500 ${isEditing ? 'pt-8' : ''}`}>
            {/* Context Header */}
            <PlanBuilderHeader
                planName={plan.name}
                onNameChange={(name) => handleUpdateDay(null, 'name', name)} // Note: name is on plan, handled separately
                onAddDay={handleAddDay}
                isEditing={isEditing}
                onToggleEdit={() => setIsEditing(true)}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={handleDelete}
                isSaving={isSaving}
                backPath="/dashboard"
                backLabel="Back to Dashboard"
                nameError={validationErrors.name}
            />

            <ErrorMessage error={error} onClose={() => setError(null)} />

            {/* Quick Stats Grid */}
            {!isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Calendar, label: "Weekly Schedule", value: `${plan.workouts.length} Days`, color: "bg-blue-50 text-blue-600" },
                        { icon: Zap, label: "Total Volume", value: `${plan.workouts.reduce((acc, w) => acc + w.exercises.length, 0)} Exercises`, color: "bg-orange-50 text-orange-600" },
                        { icon: Star, label: "Current Focus", value: plan.name, color: "bg-purple-50 text-purple-600" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{stat.label}</p>
                                <p className="text-xl font-black text-black">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Plan Details Grid */}
            <div className="grid grid-cols-1 gap-10">
                <AnimatePresence mode="popLayout">
                    {plan.workouts.map((workout, winx) => (
                        <WorkoutDayCard
                            key={winx}
                            workout={workout}
                            readOnly={!isEditing}
                            errors={validationErrors.workouts?.[winx] || {}}
                            onUpdateDay={(field, value) => handleUpdateDay(winx, field, value)}
                            onRemoveDay={() => handleRemoveDay(winx)}
                            onUpdateExercise={(exIndex, field, value) => handleUpdateExercise(winx, exIndex, field, value)}
                            onRemoveExercise={(exIndex) => handleRemoveExercise(winx, exIndex)}
                            onAddExercise={() => {
                                setActiveDayIndex(winx);
                                setIsSearchOpen(true);
                            }}
                        />
                    ))}
                </AnimatePresence>

                {plan.workouts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center border-4 border-dashed border-neutral-100 rounded-[4rem] bg-neutral-50/50 space-y-4"
                    >
                        <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10 text-neutral-400" />
                        </div>
                        <h3 className="text-2xl font-black text-black uppercase tracking-tight">System Purged</h3>
                        <p className="text-neutral-500 font-medium">Initialize a new training session to proceed.</p>
                    </motion.div>
                )}
            </div>

            {isEditing && (
                <PlanBuilderSaveBar
                    workoutCount={plan.workouts.length}
                    exerciseCount={plan.workouts.reduce((acc, w) => acc + w.exercises.length, 0)}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isSaving={isSaving}
                />
            )}

            {/* Premium Quick Search Modal Componentized */}
            <ExerciseSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectExercise={addExerciseToDay}
            />
        </div>
    );
};

export default WorkoutPlanPage;
