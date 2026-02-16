import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Activity, Target, Zap,
    Calendar, Trophy, Dumbbell, ArrowUpRight,
    ArrowRight, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

const ProgressPage = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(30); // days

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    const fetchLogs = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const formatDate = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const to = formatDate(new Date());
            const from = formatDate(new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000));

            const res = await axios.get(`${API_BASE_URL}/workouts/logs`, {
                headers: getAuthHeaders(),
                params: { from, to, limit: 100 }
            });

            setLogs(res.data.data || []);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError("Failed to load performance data.");
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, timeRange]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // --- Analytics Logic ---

    const stats = useMemo(() => {
        if (!logs.length) return null;

        let totalWeight = 0;
        let totalReps = 0;
        let exerciseFrequency = {};
        let prs = {}; // Max weight per exercise

        logs.forEach(log => {
            log.performedExercises?.forEach(ex => {
                const name = ex.exerciseId?.name || ex.name;
                exerciseFrequency[name] = (exerciseFrequency[name] || 0) + 1;

                ex.sets?.forEach(set => {
                    const weight = Number(set.weight) || 0;
                    const reps = Number(set.reps) || 0;
                    totalWeight += weight * reps;
                    totalReps += reps;

                    if (!prs[name] || weight > prs[name]) {
                        prs[name] = weight;
                    }
                });
            });
        });

        // Volume per log for trend
        const volumeTrend = logs.map(log => {
            const vol = log.performedExercises?.reduce((acc, ex) => {
                return acc + (ex.sets?.reduce((sAcc, s) => sAcc + (s.reps * s.weight), 0) || 0);
            }, 0) || 0;
            return { date: new Date(log.date).toLocaleDateString(), volume: vol };
        }).reverse();

        return {
            totalWeight,
            totalReps,
            completedSessions: logs.filter(l => l.status === 'completed').length,
            topExercises: Object.entries(exerciseFrequency)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5),
            prs: Object.entries(prs)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5),
            volumeTrend
        };
    }, [logs]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-neutral-400 font-black uppercase tracking-widest text-xs animate-pulse">Running Calculations...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24 font-['Poppins']">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">
                        Performance <span className="text-orange-500">Analytics</span>
                    </h1>
                    <p className="text-neutral-400 text-sm font-bold uppercase tracking-[0.2em] mt-3">
                        Scientific breakthroughs in your physical evolution.
                    </p>
                </div>

                <div className="flex items-center bg-white border border-neutral-200 p-1.5 rounded-2xl shadow-sm">
                    {[30, 60, 90].map(days => (
                        <button
                            key={days}
                            onClick={() => setTimeRange(days)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeRange === days ? 'bg-black text-white shadow-lg' : 'text-neutral-400 hover:text-black'}`}
                        >
                            {days}D
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <Activity className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">Total Volume</p>
                    <h3 className="text-4xl font-black mb-1">{stats?.totalWeight.toLocaleString()}</h3>
                    <p className="text-neutral-500 text-[10px] font-black uppercase">Kilograms Moved</p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Total Reps</p>
                    <h3 className="text-4xl font-black mb-1">{stats?.totalReps.toLocaleString()}</h3>
                    <p className="text-neutral-400 text-[10px] font-black uppercase">Locked-in reps</p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Sessions</p>
                    <h3 className="text-4xl font-black mb-1">{stats?.completedSessions}</h3>
                    <p className="text-neutral-400 text-[10px] font-black uppercase">Completed workouts</p>
                </div>

                <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Efficiency</p>
                    <h3 className="text-4xl font-black mb-1">98%</h3>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-white" /> Optimal Pace
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Volume Trend Visualizer */}
                <div className="bg-white border border-neutral-200 rounded-[3rem] p-10">
                    <div className="flex items-center justify-between mb-10">
                        <h4 className="text-xl font-black uppercase tracking-tight">Volume Trend</h4>
                        <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-orange-100">Live Feed</span>
                    </div>

                    <div className="flex items-end gap-3 h-48 mb-8">
                        {stats?.volumeTrend.slice(-12).map((item, i) => {
                            const maxVol = Math.max(...stats.volumeTrend.map(v => v.volume)) || 1;
                            const height = (item.volume / maxVol) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${height}%` }}
                                            transition={{ duration: 1, delay: i * 0.05 }}
                                            className="w-full bg-neutral-100 rounded-t-xl group-hover:bg-orange-500 transition-colors duration-500"
                                        />
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {item.volume.toLocaleString()} KG
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter truncate w-full text-center">
                                        {item.date.split('/')[1]}/{item.date.split('/')[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Personal Records */}
                <div className="bg-neutral-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h4 className="text-xl font-black uppercase tracking-tight">Personal Records</h4>
                        <Trophy className="w-6 h-6 text-orange-500" />
                    </div>

                    <div className="space-y-6">
                        {stats?.prs.map(([name, weight], i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 rotate-12 group-hover:rotate-0 transition-transform">
                                        <Dumbbell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Exercise</p>
                                        <p className="text-sm font-black uppercase">{name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-orange-500">{weight}<span className="text-[10px] text-white/50 ml-1">KG</span></p>
                                    <div className="flex items-center gap-1 justify-end text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                                        <ArrowUpRight className="w-3 h-3" /> Peak
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Exercises Heat Map Outline */}
            <div className="bg-white border border-neutral-200 rounded-[3rem] p-10">
                <h4 className="text-xl font-black uppercase tracking-tight mb-8">Frequency Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {stats?.topExercises.map(([name, count], i) => (
                        <div key={i} className="bg-neutral-50 border border-neutral-100 rounded-3xl p-6 hover:border-orange-500/30 transition-all duration-500 group">
                            <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center mb-4 text-xs font-black text-neutral-400 group-hover:text-orange-500 group-hover:border-orange-500 transition-all">
                                #{i + 1}
                            </div>
                            <h5 className="text-xs font-black uppercase tracking-tight mb-1 truncate">{name}</h5>
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                <span className="text-black font-black text-lg">{count}</span> Sessions
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProgressPage;

