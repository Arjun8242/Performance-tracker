import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

import PlanBuilderHeader from '../components/workout/PlanBuilderHeader';
import PlanBuilderSaveBar from '../components/workout/PlanBuilderSaveBar';
import ErrorMessage from '../components/common/ErrorMessage';
import WorkoutDayCard from '../components/workout/WorkoutDayCard';
import PlanBuilderEmptyState from '../components/workout/PlanBuilderEmptyState';
import ExerciseSearchModal from '../components/workout/ExerciseSearchModal';

const API_BASE_URL = 'http://localhost:3000';

const PlanBuilderPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedExercises } = location.state || {};

    const [planDraft, setPlanDraft] = useState({
        name: '',
        workouts: []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    // Exercise search modal state
    const [exerciseSearchOpen, setExerciseSearchOpen] = useState(false);
    const [exerciseSearchDayIndex, setExerciseSearchDayIndex] = useState(null);

    // Redirect if no exercises selected
    useEffect(() => {
        if (!selectedExercises || selectedExercises.length === 0) {
            navigate('/workout-library');
        }
    }, [selectedExercises, navigate]);

    if (!selectedExercises || selectedExercises.length === 0) return null;

    const handleAddDay = () => {
        setPlanDraft(prev => ({
            ...prev,
            workouts: [
                ...prev.workouts,
                {
                    day: 'monday',
                    name: `Session ${prev.workouts.length + 1}`,
                    exercises: selectedExercises.map(ex => ({
                        exerciseId: ex.id,
                        name: ex.name, // Local display only
                        sets: 3,
                        reps: 10,
                        weight: 0
                    }))
                }
            ]
        }));
    };

    const handleRemoveDay = (index) => {
        setPlanDraft(prev => ({
            ...prev,
            workouts: prev.workouts.filter((_, i) => i !== index)
        }));
    };

    const handleUpdateDay = (index, field, value) => {
        setPlanDraft(prev => {
            const newWorkouts = [...prev.workouts];
            newWorkouts[index] = { ...newWorkouts[index], [field]: value };
            return { ...prev, workouts: newWorkouts };
        });
    };

    const handleUpdateExercise = (dayIndex, exIndex, field, value) => {
        setPlanDraft(prev => {
            const newWorkouts = [...prev.workouts];
            const newExercises = [...newWorkouts[dayIndex].exercises];
            newExercises[exIndex] = { ...newExercises[exIndex], [field]: value };
            newWorkouts[dayIndex] = { ...newWorkouts[dayIndex], exercises: newExercises };
            return { ...prev, workouts: newWorkouts };
        });
    };

    const handleRemoveExercise = (dayIndex, exIndex) => {
        setPlanDraft(prev => {
            const newWorkouts = [...prev.workouts];
            newWorkouts[dayIndex].exercises = newWorkouts[dayIndex].exercises.filter((_, i) => i !== exIndex);
            return { ...prev, workouts: newWorkouts };
        });
    };

    const openExerciseSearchForDay = (dayIndex) => {
        setExerciseSearchDayIndex(dayIndex);
        setExerciseSearchOpen(true);
    };

    const handleAddExercise = (dayIndex, exercise) => {
        setPlanDraft(prev => {
            const newWorkouts = [...prev.workouts];
            newWorkouts[dayIndex] = {
                ...newWorkouts[dayIndex],
                exercises: [
                    ...newWorkouts[dayIndex].exercises,
                    {
                        exerciseId: exercise.id || exercise._id,
                        name: exercise.name,
                        sets: 3,
                        reps: 10,
                        weight: 0
                    }
                ]
            };
            return { ...prev, workouts: newWorkouts };
        });
    };

    const handleSelectExercise = (exercise) => {
        if (exerciseSearchDayIndex !== null) {
            handleAddExercise(exerciseSearchDayIndex, exercise);
        }
        setExerciseSearchOpen(false);
        setExerciseSearchDayIndex(null);
    };

    const validatePlan = () => {
        if (!planDraft.name.trim()) return "Plan name is required";
        if (planDraft.workouts.length === 0) return "At least one workout day is required";
        for (const workout of planDraft.workouts) {
            if (!workout.name.trim()) return "Workout name is required for all days";
            if (workout.exercises.length === 0) return `Workout "${workout.name}" needs at least one exercise`;
            for (const ex of workout.exercises) {
                if (ex.sets <= 0 || ex.reps <= 0) return `Sets and reps must be greater than 0 for all exercises`;
            }
        }
        return null;
    };

    const handleSave = async () => {
        const validationError = validatePlan();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                name: planDraft.name,
                workouts: planDraft.workouts.map(w => ({
                    day: w.day,
                    name: w.name,
                    exercises: w.exercises.map(ex => ({
                        exerciseId: ex.exerciseId,
                        sets: Number(ex.sets),
                        reps: Number(ex.reps),
                        weight: Number(ex.weight)
                    }))
                }))
            };

            await axios.post(`${API_BASE_URL}/workouts/plan`, payload);

            navigate('/dashboard');
        } catch (err) {
            console.error('Save error:', err);
            const msg = err.response?.data?.message || 'Failed to save workout plan. Please try again.';
            setError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-24">
            <PlanBuilderHeader
                planName={planDraft.name}
                onNameChange={(name) => setPlanDraft(prev => ({ ...prev, name }))}
                onAddDay={handleAddDay}
            />

            <hr className="border-neutral-200" />

            <ErrorMessage error={error} onClose={() => setError(null)} />

            {/* Workouts List */}
            <div className="space-y-8">
                <AnimatePresence initial={false}>
                    {planDraft.workouts.length === 0 ? (
                        <PlanBuilderEmptyState />
                    ) : (
                        planDraft.workouts.map((workout, winx) => (
                            <WorkoutDayCard
                                key={winx}
                                workout={workout}
                                onUpdateDay={(field, value) => handleUpdateDay(winx, field, value)}
                                onRemoveDay={() => handleRemoveDay(winx)}
                                onUpdateExercise={(exIndex, field, value) => handleUpdateExercise(winx, exIndex, field, value)}
                                onRemoveExercise={(exIndex) => handleRemoveExercise(winx, exIndex)}
                                onAddExercise={() => openExerciseSearchForDay(winx)}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            <PlanBuilderSaveBar
                workoutCount={planDraft.workouts.length}
                exerciseCount={planDraft.workouts.reduce((acc, w) => acc + w.exercises.length, 0)}
                onSave={handleSave}
                isSaving={isSaving}
            />

            <ExerciseSearchModal
                isOpen={exerciseSearchOpen}
                onClose={() => {
                    setExerciseSearchOpen(false);
                    setExerciseSearchDayIndex(null);
                }}
                onSelectExercise={handleSelectExercise}
            />
        </div>
    );
};

export default PlanBuilderPage;
