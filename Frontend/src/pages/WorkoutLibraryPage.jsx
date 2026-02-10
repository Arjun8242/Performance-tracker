import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
    TrendingUp
} from 'lucide-react';


const API_BASE_URL = 'http://localhost:3000';


const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core'];
const EQUIPMENTS = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const WorkoutLibraryPage = () => {
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

            const response = await axios.get(`${API_BASE_URL}/exercises`, { params });
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
                <h1 className="text-4xl font-extrabold tracking-tight text-black mb-2 flex items-center gap-3">
                    Workout <span className="text-orange-500">Library</span>
                    <LibraryBadge count={pagination.total} />
                </h1>
                <p className="text-neutral-500 text-lg font-medium">
                    Explore and select exercises to build your perfect workout plan.
                </p>
            </div>

            {/* Filter UI */}
            <div className="bg-white p-6 rounded-[2rem] border border-neutral-200 shadow-sm flex flex-wrap gap-4 items-end">
                {/* Search */}
                <div className="flex-1 min-w-[240px] space-y-2">
                    <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider ml-1">Search</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Muscle Group */}
                <div className="w-full sm:w-auto min-w-[160px] space-y-2">
                    <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider ml-1">Muscle Group</label>
                    <select
                        name="muscleGroup"
                        value={filters.muscleGroup}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium appearance-none cursor-pointer"
                    >
                        <option value="">All Muscles</option>
                        {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                    </select>
                </div>

                {/* Equipment */}
                <div className="w-full sm:w-auto min-w-[160px] space-y-2">
                    <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider ml-1">Equipment</label>
                    <select
                        name="equipment"
                        value={filters.equipment}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium appearance-none cursor-pointer"
                    >
                        <option value="">All Equipment</option>
                        {EQUIPMENTS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                    </select>
                </div>

                {/* Difficulty */}
                <div className="w-full sm:w-auto min-w-[160px] space-y-2">
                    <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider ml-1">Difficulty</label>
                    <select
                        name="difficulty"
                        value={filters.difficulty}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium appearance-none cursor-pointer"
                    >
                        <option value="">All Levels</option>
                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                    </select>
                </div>
            </div>

            {/* Exercise Grid or Error/Empty State */}
            <div className="min-h-[400px] relative">
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
                            className="bg-red-50 border border-red-100 p-8 rounded-[2rem] flex flex-col items-center text-center gap-4"
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
                            className="bg-neutral-100/50 border border-neutral-200 p-12 rounded-[2rem] flex flex-col items-center text-center gap-4"
                        >
                            <div className="w-20 h-20 bg-neutral-200/50 rounded-full flex items-center justify-center mb-2">
                                <Search className="w-10 h-10 text-neutral-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-black mb-1">No exercises found</h3>
                                <p className="text-neutral-500 font-medium">Try adjusting your filters or search term to widen your search.</p>
                            </div>
                            <button
                                onClick={() => {
                                    setFilters({ search: '', muscleGroup: '', equipment: '', difficulty: '' });
                                    setSearchTerm('');
                                }}
                                className="px-6 py-2 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors"
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
                <div className="flex items-center justify-between bg-white px-8 py-4 rounded-2xl border border-neutral-200 shadow-sm">
                    <p className="text-neutral-500 font-medium">
                        Showing <span className="text-black font-bold">{exercises.length}</span> of <span className="text-black font-bold">{pagination.total}</span> exercises
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
                                            : 'text-neutral-400 hover:text-black hover:bg-neutral-100'
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
                                <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95">
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

const LibraryBadge = ({ count }) => (
    <div className="px-3 py-1 bg-neutral-100 rounded-full text-neutral-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-neutral-200/50">
        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
        {count} Exercises Available
    </div>
);

const ExerciseCard = ({ exercise, isSelected, onSelect }) => {
    return (
        <motion.div
            layout
            whileHover={{ y: -5 }}
            className={`group relative bg-white rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${isSelected ? 'border-orange-500 shadow-xl shadow-orange-500/10' : 'border-neutral-100 hover:border-orange-500/30 shadow-sm'
                }`}
        >
            {/* Visual Header */}
            <div className={`h-32 p-6 flex items-start justify-between transition-colors ${isSelected ? 'bg-orange-50' : 'bg-neutral-50 group-hover:bg-orange-50/30'
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
                    <h3 className="text-lg font-bold text-black group-hover:text-orange-600 transition-colors line-clamp-1 capitalize">
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

                <button className="w-full mt-6 py-3 px-4 bg-neutral-50 group-hover:bg-black group-hover:text-white text-neutral-400 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" />
                    Details
                </button>
            </div>
        </motion.div>
    );
};

export default WorkoutLibraryPage;
