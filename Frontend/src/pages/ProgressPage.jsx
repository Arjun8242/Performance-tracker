import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { TrendingUp, Trophy, Dumbbell } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

const ProgressPage = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(30); // days
    const [selectedExerciseKey, setSelectedExerciseKey] = useState('');

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

            const allLogs = [];
            let page = 1;
            let totalPages = 1;

            while (page <= totalPages) {
                const res = await axios.get(`${API_BASE_URL}/workouts/logs`, {
                    headers: getAuthHeaders(),
                    params: { from, to, page, limit: 100 }
                });

                const pageData = res?.data?.data || [];
                allLogs.push(...pageData);
                totalPages = Number(res?.data?.totalPages) || 1;
                page += 1;
            }

            setLogs(allLogs);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load strength data.');
        } finally {
            setIsLoading(false);
        }
    }, [getAuthHeaders, timeRange]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const resolveExercise = useCallback((exercise) => {
        const raw = exercise?.exerciseId;
        const id = typeof raw === 'string' ? raw : raw?._id || raw?.id || '';
        const fallbackName = typeof exercise?.name === 'string' ? exercise.name : '';
        const resolvedName = typeof raw === 'object' ? (raw?.name || fallbackName) : fallbackName;
        const name = resolvedName?.trim() || (id ? `Exercise ${id.slice(-4).toUpperCase()}` : '');

        if (!id && !name) return null;

        return {
            key: id || name.toLowerCase(),
            id,
            name
        };
    }, []);

    const exerciseOptions = useMemo(() => {
        const map = new Map();

        logs.forEach((log) => {
            if (log?.status !== 'completed') return;

            (log?.performedExercises || []).forEach((exercise) => {
                const resolved = resolveExercise(exercise);
                if (!resolved) return;

                const existing = map.get(resolved.key);
                if (!existing) {
                    map.set(resolved.key, { ...resolved, sessions: 1 });
                    return;
                }

                existing.sessions += 1;
                if (!existing.id && resolved.id) existing.id = resolved.id;
                if (existing.name.startsWith('Exercise ') && resolved.name && !resolved.name.startsWith('Exercise ')) {
                    existing.name = resolved.name;
                }
            });
        });

        return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
    }, [logs, resolveExercise]);

    useEffect(() => {
        if (!exerciseOptions.length) {
            if (selectedExerciseKey) setSelectedExerciseKey('');
            return;
        }

        const exists = exerciseOptions.some((exercise) => exercise.key === selectedExerciseKey);
        if (!exists) {
            setSelectedExerciseKey(exerciseOptions[0].key);
        }
    }, [exerciseOptions, selectedExerciseKey]);

    const stats = useMemo(() => {
        if (!logs.length || !selectedExerciseKey) return null;

        const epley1RM = (weight, reps) => weight * (1 + reps / 30);
        const sessionBestTrend = [];
        const exerciseFrequency = new Map();
        let completedSessions = 0;

        logs.forEach((log) => {
            if (log?.status !== 'completed') return;
            completedSessions += 1;

            const performed = log?.performedExercises || [];
            const sessionUniqueExercises = new Set();
            let sessionBest = 0;

            performed.forEach((exercise) => {
                const resolved = resolveExercise(exercise);

                if (resolved) {
                    sessionUniqueExercises.add(resolved.key);
                }

                if (!resolved || resolved.key !== selectedExerciseKey) return;

                (exercise?.sets || []).forEach((set) => {
                    const weight = Number(set?.weight);
                    const reps = Number(set?.reps);
                    if (!Number.isFinite(weight) || !Number.isFinite(reps)) return;
                    if (weight <= 0 || reps <= 0) return;

                    const estimate = epley1RM(weight, reps);
                    if (Number.isFinite(estimate) && estimate > sessionBest) {
                        sessionBest = estimate;
                    }
                });
            });

            sessionUniqueExercises.forEach((key) => {
                exerciseFrequency.set(key, (exerciseFrequency.get(key) || 0) + 1);
            });

            if (sessionBest > 0) {
                const d = new Date(log.date);
                const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
                sessionBestTrend.push({
                    isoDate: d.toISOString(),
                    date: label,
                    estimated1RM: Number(sessionBest.toFixed(1))
                });
            }
        });

        sessionBestTrend.sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate));

        const byBestDesc = [...sessionBestTrend].sort((a, b) => b.estimated1RM - a.estimated1RM);
        const currentBest = byBestDesc[0]?.estimated1RM || 0;
        const previousBest = byBestDesc[1]?.estimated1RM || 0;
        const first = sessionBestTrend[0]?.estimated1RM || 0;
        const latest = sessionBestTrend[sessionBestTrend.length - 1]?.estimated1RM || 0;
        const percentIncrease = first > 0
            ? Number((((latest - first) / first) * 100).toFixed(1))
            : 0;

        const selectedExercise = exerciseOptions.find((option) => option.key === selectedExerciseKey);

        const topExercises = exerciseOptions
            .map((exercise) => ({
                key: exercise.key,
                name: exercise.name,
                sessions: exerciseFrequency.get(exercise.key) || 0
            }))
            .filter((item) => item.sessions > 0)
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 5);

        return {
            selectedExerciseName: selectedExercise?.name || 'Selected exercise',
            completedSessions,
            sessionsTracked: sessionBestTrend.length,
            currentBest,
            previousBest,
            percentIncrease,
            hasEnoughTrendForChange: sessionBestTrend.length >= 2,
            trend: sessionBestTrend,
            topExercises
        };
    }, [logs, selectedExerciseKey, resolveExercise, exerciseOptions]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-neutral-400 font-black uppercase tracking-widest text-xs animate-pulse">Running Calculations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto py-16">
                <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-red-700">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Analytics unavailable</h2>
                    <p className="text-sm font-bold uppercase tracking-wider">{error}</p>
                </div>
            </div>
        );
    }

    if (!logs.length) {
        return (
            <div className="max-w-6xl mx-auto py-16">
                <div className="bg-white border border-neutral-200 rounded-3xl p-10">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-3">No workout logs in this range</h2>
                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider">
                        Log completed sessions to start tracking strength progression.
                    </p>
                </div>
            </div>
        );
    }

    if (!exerciseOptions.length) {
        return (
            <div className="max-w-6xl mx-auto py-16">
                <div className="bg-white border border-neutral-200 rounded-3xl p-10">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-3">No completed exercise data</h2>
                    <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider">
                        Complete at least one exercise set to see estimated 1RM analytics.
                    </p>
                </div>
            </div>
        );
    }

    const max1RM = stats?.trend?.length ? Math.max(...stats.trend.map((item) => item.estimated1RM)) || 1 : 1;

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24 font-['Poppins']">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black text-black tracking-tighter uppercase leading-none">
                        Strength <span className="text-orange-500">Progression</span>
                    </h1>
                    <p className="text-neutral-400 text-sm font-bold uppercase tracking-[0.2em] mt-3">
                        Estimated 1RM trends that reflect real strength adaptation.
                    </p>
                </div>

                <div className="flex items-center bg-white border border-neutral-200 p-1.5 rounded-2xl shadow-sm">
                    {[30, 60, 90].map((days) => (
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

            <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Exercise selector</p>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{stats?.selectedExerciseName}</h3>
                </div>
                <select
                    value={selectedExerciseKey}
                    onChange={(e) => setSelectedExerciseKey(e.target.value)}
                    className="w-full md:w-80 px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                >
                    {exerciseOptions.map((exercise) => (
                        <option key={exercise.key} value={exercise.key}>
                            {exercise.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <Trophy className="w-16 h-16" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2">Current Best e1RM</p>
                    <h3 className="text-4xl font-black mb-1">{stats?.currentBest ? stats.currentBest.toFixed(1) : '0.0'}</h3>
                    <p className="text-neutral-500 text-[10px] font-black uppercase">Kilograms</p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Previous Best e1RM</p>
                    <h3 className="text-4xl font-black mb-1">{stats?.previousBest ? stats.previousBest.toFixed(1) : '0.0'}</h3>
                    <p className="text-neutral-400 text-[10px] font-black uppercase">
                        {stats?.previousBest ? 'Prior peak session' : 'Need 2+ tracked sessions'}
                    </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">% Change in Range</p>
                    <h3 className="text-4xl font-black mb-1">
                        {stats?.hasEnoughTrendForChange ? `${stats.percentIncrease > 0 ? '+' : ''}${stats.percentIncrease}%` : 'N/A'}
                    </h3>
                    <p className="text-neutral-400 text-[10px] font-black uppercase">First session vs latest</p>
                </div>

                <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Sessions Tracked</p>
                    <h3 className="text-4xl font-black mb-1">{stats?.sessionsTracked || 0}</h3>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">with measurable sets</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-neutral-200 rounded-[3rem] p-10">
                    <div className="flex items-center justify-between mb-10">
                        <h4 className="text-xl font-black uppercase tracking-tight">Estimated 1RM Trend</h4>
                        <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-orange-100">Live Feed</span>
                    </div>

                    <div className="flex items-end gap-3 h-48 mb-8">
                        {stats?.trend?.length ? stats.trend.slice(-12).map((item, i) => {
                            const height = (item.estimated1RM / max1RM) * 100;
                            return (
                                <div key={`${item.isoDate}-${i}`} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full h-40 flex items-end">
                                        <div
                                            className="w-full min-h-[2px] bg-neutral-400 rounded-t-xl group-hover:bg-orange-500 transition-colors duration-500"
                                            style={{ height: `${height}%` }}
                                        />
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {item.estimated1RM.toFixed(1)} KG
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-neutral-300 uppercase tracking-tighter truncate w-full text-center">
                                        {item.date}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs font-black uppercase tracking-widest">
                                Not enough sessions for this exercise
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-neutral-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h4 className="text-xl font-black uppercase tracking-tight">Strength Snapshot</h4>
                        <Trophy className="w-6 h-6 text-orange-500" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 rotate-12 group-hover:rotate-0 transition-transform">
                                    <Dumbbell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Exercise</p>
                                    <p className="text-sm font-black uppercase">{stats?.selectedExerciseName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-orange-500">
                                    {stats?.currentBest ? stats.currentBest.toFixed(1) : '0.0'}
                                    <span className="text-[10px] text-white/50 ml-1">KG</span>
                                </p>
                                <div className="flex items-center gap-1 justify-end text-[8px] font-black text-emerald-400 uppercase tracking-widest">
                                    <TrendingUp className="w-3 h-3" /> Best Estimated 1RM
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2">Range summary</p>
                            <p className="text-sm font-black uppercase text-white/90">
                                {stats?.completedSessions || 0} total completed sessions in this range
                            </p>
                            <p className="text-sm font-black uppercase text-white/90">
                                {stats?.sessionsTracked || 0} sessions included this exercise
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {stats?.topExercises?.length ? (
                <div className="bg-white border border-neutral-200 rounded-[3rem] p-10">
                    <h4 className="text-xl font-black uppercase tracking-tight mb-8">Training Balance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {stats.topExercises.map((item, i) => (
                            <div key={item.key} className="bg-neutral-50 border border-neutral-100 rounded-3xl p-6 hover:border-orange-500/30 transition-all duration-500 group">
                                <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center mb-4 text-xs font-black text-neutral-400 group-hover:text-orange-500 group-hover:border-orange-500 transition-all">
                                    #{i + 1}
                                </div>
                                <h5 className="text-xs font-black uppercase tracking-tight mb-1 truncate">{item.name}</h5>
                                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                    <span className="text-black font-black text-lg">{item.sessions}</span> Sessions
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default ProgressPage;
