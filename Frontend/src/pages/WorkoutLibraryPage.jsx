import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Dumbbell,
    CheckCircle2,
    Plus,
    Info,
    AlertCircle,
    Loader2,
    TrendingUp,
    Library
} from 'lucide-react';


import LibraryBadge from '../components/library/LibraryBadge';
import ExerciseCard from '../components/library/ExerciseCard';




import LibraryFilters from '../components/library/LibraryFilters';

const WorkoutLibraryPage = () => {
    const navigate = useNavigate();
    // State for exercises and pagination
    const [exercises, setExercises] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for filters
    const [filters, setFilters] = useState({
        search: '',
        muscleGroup: '',
        equipment: '',
        difficulty: ''
    });

    // Local state for "selected exercises"
    const [selectedExercises, setSelectedExercises] = useState([]);

    // Debounced search term
    const [searchTerm, setSearchTerm] = useState('');

    // Sync search input with debounced term
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
            setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch exercises from API
    const fetchExercises = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page: pagination.page,
                limit: 12,
                search: filters.search,
                muscleGroup: filters.muscleGroup,
                equipment: filters.equipment,
                difficulty: filters.difficulty
            };

            // Remove empty strings from params
            Object.keys(params).forEach(key => {
                if (params[key] === '') delete params[key];
            });

            const response = await api.get('/exercises', { params });
            console.log("Exercises from API:", response.data.exercises);
            setExercises(response.data.exercises);
            setPagination(prev => ({
                ...prev,
                totalPages: response.data.pagination.totalPages,
                total: response.data.pagination.total
            }));
        } catch (err) {
            console.error('Error fetching exercises:', err);
            setError(err.response?.data?.message || 'Failed to load exercises. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [pagination.page, filters]);

    useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);

    // Toggle exercise selection
    const toggleSelection = (exercise) => {
        setSelectedExercises(prev => {
            const isSelected = prev.find(e => e.id === exercise.id);
            if (isSelected) {
                return prev.filter(e => e.id !== exercise.id);
            } else {
                return [...prev, exercise];
            }
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white mb-2 flex items-center gap-3">
                    Workout <span className="text-orange-500">Library</span>
                    <LibraryBadge count={pagination.total} />
                </h1>
                <p className="text-neutral-500 text-lg font-medium">
                    Explore and select exercises to build your perfect workout plan.
                </p>
            </div>

            {/* Filter UI */}
            <LibraryFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                onFilterChange={handleFilterChange}
            />


            {/* Exercise Grid or Error/Empty State */}
            <div className="min-h-96 relative">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 gap-4"
                        >
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                            <p className="text-neutral-500 font-medium">Fetching exercises...</p>
                        </motion.div>
                    ) : error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-red-50 border border-red-100 p-8 rounded-4xl flex flex-col items-center text-center gap-4"
                        >
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <div>
                                <h3 className="text-xl font-bold text-red-950 mb-1">Something went wrong</h3>
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                            <button
                                onClick={fetchExercises}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    ) : exercises.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-neutral-100/50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 p-12 rounded-4xl flex flex-col items-center text-center gap-4"
                        >
                            <div className="w-20 h-20 bg-neutral-200/50 rounded-full flex items-center justify-center mb-2">
                                <Search className="w-10 h-10 text-neutral-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-black dark:text-white mb-1">No exercises found</h3>
                                <p className="text-neutral-500 font-medium">Try adjusting your filters or search term to widen your search.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setFilters({ search: '', muscleGroup: '', equipment: '', difficulty: '' });
                                    setSearchTerm('');
                                }}
                                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {exercises.map((exercise) => (
                                <ExerciseCard
                                    key={exercise.id}
                                    exercise={exercise}
                                    isSelected={selectedExercises.some(e => e.id === exercise.id)}
                                    onSelect={() => toggleSelection(exercise)}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            {!isLoading && !error && exercises.length > 0 && (
                <div className="flex items-center justify-between bg-white dark:bg-neutral-900 px-8 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                    <p className="text-neutral-500 font-medium">
                        Showing <span className="text-black dark:text-white font-bold">{exercises.length}</span> of <span className="text-black dark:text-white font-bold">{pagination.total}</span> exercises
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                let pageNum = pagination.page;
                                if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                } else {
                                    // Complex pagination logic could go here, keeping it simple for now
                                    if (pagination.page <= 3) pageNum = i + 1;
                                    else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                                    else pageNum = pagination.page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${pagination.page === pageNum
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Selection Summary Floating Bar */}
            <AnimatePresence>
                {selectedExercises.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[min(90vw,600px)]"
                    >
                        <div className="bg-black text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                    <Dumbbell className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{selectedExercises.length} Exercises Selected</h4>
                                    <p className="text-neutral-400 text-sm font-medium">Add them to your workout plan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedExercises([])}
                                    className="px-4 py-2 text-neutral-400 hover:text-white font-bold transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => navigate('/plan-builder', { state: { selectedExercises } })}
                                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkoutLibraryPage;
