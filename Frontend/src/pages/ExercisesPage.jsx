import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Dumbbell,
    TrendingUp,
    ChevronRight,
    Activity,
    Trophy,
    Weight,
    Loader2,
    Search,
    Filter,
    ArrowUpRight,
    LayoutGrid,
    List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://localhost:3000';

const ExercisesPage = () => {
    const navigate = useNavigate();
    const [exercises, setExercises] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPerformedExercises = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await axios.get(`${API_BASE_URL}/progress/exercises`);
                setExercises(res.data);
            } catch (err) {
                console.error('Error fetching performed exercises:', err);
                setError('Failed to load exercises. Play hard, log first!');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPerformedExercises();
    }, []);

    const globalStats = useMemo(() => {
        return exercises.reduce((acc, ex) => ({
            totalVolume: acc.totalVolume + ex.lifetimeVolume,
            totalSessions: acc.totalSessions + ex.totalSessions
        }), { totalVolume: 0, totalSessions: 0 });
    }, [exercises]);

    const filteredExercises = useMemo(() => {
        return exercises.filter(ex =>
            ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [exercises, searchTerm]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="font-black text-neutral-400 uppercase tracking-widest text-xs">Cataloging your gains...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-black dark:text-white tracking-tight uppercase leading-tight">
                        My <span className="text-orange-500">Exercises</span>
                    </h1>
                    <p className="text-neutral-500 font-bold text-lg mt-2">
                        Your personal inventory of performance and power.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-3xl shadow-sm flex flex-col justify-center min-w-35">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Global Volume</span>
                        <span className="text-2xl font-black text-black dark:text-white">{(globalStats.totalVolume / 1000).toFixed(1)}k <span className="text-xs text-neutral-400">kg</span></span>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-4 rounded-3xl shadow-sm flex flex-col justify-center min-w-35">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Global Sessions</span>
                        <span className="text-2xl font-black text-black dark:text-white">{globalStats.totalSessions}</span>
                    </div>
                    <div className="relative group ml-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find exercise..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 pl-11 pr-6 py-3 rounded-2xl text-sm font-bold text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 w-60 transition-all"
                        />
                    </div>
                </div>
            </div>

            {error || exercises.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[3rem] p-16 text-center max-w-2xl mx-auto shadow-sm">
                    <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <Dumbbell className="w-10 h-10 text-orange-500" />
                    </div>
                    <h2 className="text-3xl font-black text-black dark:text-white mb-4 uppercase">No logs detected</h2>
                    <p className="text-neutral-500 font-bold mb-8 text-lg">
                        {error || "You haven't logged any exercises yet. Start a workout to see your intelligence here!"}
                    </p>
                    <button
                        onClick={() => navigate('/workout-logging')}
                        className="px-10 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl active:scale-95"
                    >
                        Start First Session
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredExercises.map((ex, idx) => (
                            <motion.div
                                key={ex.exerciseId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/exercise/${ex.exerciseId}`)}
                                className="group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] p-8 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer transition-all duration-500 relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-500 scale-100">
                                            <Dumbbell className="w-7 h-7 text-neutral-300 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-500/5 px-2 py-0.5 rounded-md border border-orange-500/10">
                                                {ex.muscleGroup}
                                            </span>
                                            <p className="text-neutral-400 text-[8px] font-black uppercase tracking-[0.2em] mt-2">
                                                Last: {new Date(ex.lastPerformed).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-black dark:text-white group-hover:text-orange-600 transition-colors uppercase leading-tight mb-6">
                                        {ex.name}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-neutral-50 rounded-2xl p-4 group-hover:bg-white border border-transparent group-hover:border-neutral-100 transition-all">
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Max E1RM</p>
                                            <p className="text-xl font-black text-black dark:text-white">{ex.bestE1RM}<span className="text-[10px] ml-1">kg</span></p>
                                        </div>
                                        <div className="bg-neutral-50 rounded-2xl p-4 group-hover:bg-white border border-transparent group-hover:border-neutral-100 transition-all">
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Volume</p>
                                            <p className="text-xl font-black text-black dark:text-white">{(ex.lifetimeVolume / 1000).toFixed(1)}k<span className="text-[10px] ml-1">kg</span></p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="w-3 h-3 text-orange-500" />
                                            {ex.totalSessions} Sessions
                                        </span>
                                        <div className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all">
                                            <ChevronRight className="w-4 h-4 group-hover:text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/0 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-orange-500/5 transition-all duration-700" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ExercisesPage;
