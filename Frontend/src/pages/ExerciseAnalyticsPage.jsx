import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import {
    ChevronLeft,
    TrendingUp,
    Dumbbell,
    Calendar,
    Trophy,
    Activity,
    Info,
    Loader2,
    AlertCircle,
    ArrowUpRight,
    Weight,
    Hash
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = 'http://localhost:3000';

const MetricCard = ({ title, value, unit, trend, suffix, icon: Icon, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between"
    >
        <div>
            <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center mb-6 text-neutral-400">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-black">{value}</span>
                {unit && <span className="text-neutral-400 font-bold uppercase tracking-widest text-xs">{unit}</span>}
            </div>
        </div>
        {trend !== null && trend !== undefined ? (
            <div className={`mt-6 flex items-center gap-2 font-black text-xs uppercase tracking-widest ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-90" />}
                {trend > 0 ? '+' : ''}{trend}% {suffix}
            </div>
        ) : (
            <div className="mt-6 text-neutral-300 font-bold text-[10px] uppercase tracking-widest italic">
                Insufficient historical data
            </div>
        )}
    </motion.div>
);

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
    <div className="flex items-center justify-between mb-8">
        <div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight">{title} <span className="text-orange-500">{subtitle}</span></h3>
            <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mt-1">Calculation based on verified logs</p>
        </div>
        {Icon && <Icon className="w-6 h-6 text-neutral-200" />}
    </div>
);

const ExerciseAnalyticsPage = () => {
    const { exerciseId } = useParams();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const authHeaders = useMemo(() => {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await axios.get(`${API_BASE_URL}/progress/exercise/${exerciseId}`, {
                    headers: authHeaders
                });
                setAnalytics(res.data);
            } catch (err) {
                console.error('Error fetching analytics:', err);
                if (err.response?.status === 404) {
                    setError('No data found for this exercise. Start logging to see analytics!');
                } else {
                    setError('Failed to load analytics. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [exerciseId, authHeaders]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin" strokeWidth={3} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-black" />
                    </div>
                </div>
                <p className="font-black text-black uppercase tracking-[0.2em] text-xs">Computing performance intelligence</p>
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-6 text-center">
                <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                    <Activity className="w-12 h-12 text-orange-500" />
                </div>
                <h2 className="text-4xl font-black text-black mb-4 uppercase tracking-tighter italic">
                    Analytics <span className="text-orange-500">Locked</span>
                </h2>
                <p className="text-neutral-400 font-bold mb-10 text-lg leading-relaxed">
                    {error || "Start logging this exercise to unlock performance intelligence."}
                </p>
                <button
                    onClick={() => navigate('/workout-logging')}
                    className="px-10 py-5 bg-black text-white rounded-3xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-2xl active:scale-95"
                >
                    Initialize First Log
                </button>
            </div>
        );
    }

    const { exercise, stats, trends, prHistory, insights } = analytics;
    const { percentageChanges } = stats;

    // Filter trends for strength progression chart (last 8 points)
    const strengthTrendData = trends.e1RMOverTime.slice(-8);
    const volumeTrendData = trends.volumeOverTime;

    return (
        <div className="pb-24 space-y-12">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-neutral-400 hover:text-black font-black text-[10px] uppercase tracking-widest mb-6 transition-colors group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Library
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-4 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            {exercise.muscleGroup}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Feed</span>
                        </div>
                    </div>
                    <h1 className="text-6xl font-black text-black tracking-tighter uppercase leading-[0.9] italic">
                        {exercise.name} <br />
                        <span className="text-orange-500 not-italic">Analytics</span>
                    </h1>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="bg-white border border-neutral-100 p-6 rounded-[2rem] shadow-sm flex flex-col justify-center min-w-[160px]">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Lifetime Volume</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-black">{(stats.lifetimeVolume / 1000).toFixed(1)}k</span>
                            <span className="text-xs font-black text-neutral-300 uppercase">kg</span>
                        </div>
                    </div>
                    <div className="bg-white border border-neutral-100 p-6 rounded-[2rem] shadow-sm flex flex-col justify-center min-w-[160px]">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Total Sessions</span>
                        <span className="text-3xl font-black text-black">{stats.totalSessions}</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group lg:col-span-1"
                >
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                            <Trophy className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Max Calculated 1RM</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black">{stats.bestSet.estimated1RM}</span>
                            <span className="text-orange-500 font-black uppercase tracking-widest text-sm">kg</span>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-white/40 font-black uppercase tracking-widest text-[10px] mb-1">Heavy Set Reference</p>
                            <p className="text-white font-bold text-sm">
                                {stats.bestSet.weight}kg × {stats.bestSet.reps} reps
                            </p>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700" />
                </motion.div>

                <MetricCard
                    title="Strength Velocity"
                    value={stats.bestSet.estimated1RM}
                    unit="kg"
                    trend={percentageChanges.e1RM}
                    suffix="vs prev 4w"
                    icon={TrendingUp}
                    delay={0.1}
                />

                <MetricCard
                    title="Volume Output"
                    value={stats.averageVolumePerSession}
                    unit="kg/sess"
                    trend={percentageChanges.volume}
                    suffix="vs prev 4w"
                    icon={Weight}
                    delay={0.2}
                />

                <MetricCard
                    title="Training Density"
                    value={stats.frequency.last30Days}
                    unit="sess/30d"
                    trend={percentageChanges.frequency}
                    suffix="frequency"
                    icon={Calendar}
                    delay={0.3}
                />
            </div>

            {/* Middle Section: Charts & Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Insights Panel */}
                <div className="xl:col-span-1 space-y-8">
                    <div className="bg-orange-500 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden h-full">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight italic">Automated Insights</h3>
                            </div>

                            <div className="space-y-6">
                                {insights.length > 0 ? insights.map((insight, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        className="flex gap-4"
                                    >
                                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 shrink-0" />
                                        <p className="text-sm font-black uppercase tracking-wide leading-relaxed opacity-90 italic">
                                            {insight}
                                        </p>
                                    </motion.div>
                                )) : (
                                    <p className="text-sm font-black uppercase tracking-widest text-white/50 italic">
                                        Calculating trends... Log more sessions to see insights.
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2" />
                    </div>
                </div>

                {/* Strength Chart */}
                <div className="xl:col-span-2 bg-white border border-neutral-100 p-10 rounded-[3.5rem] shadow-sm">
                    <SectionHeader title="Strength" subtitle="Progression" icon={TrendingUp} />
                    <div className="h-[300px] w-full mt-6">
                        {strengthTrendData.length >= 3 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={strengthTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="1 4" vertical={false} stroke="#e5e5e5" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(str) => {
                                            const date = new Date(str);
                                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        }}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 900 }}
                                        domain={['dataMin - 5', 'dataMax + 5']}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px' }}
                                        cursor={{ stroke: '#f97316', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    />
                                    <Line
                                        type="linear"
                                        dataKey="value"
                                        name="E1RM"
                                        stroke="#000000"
                                        strokeWidth={6}
                                        dot={{ fill: '#f97316', strokeWidth: 3, stroke: '#ffffff', r: 8 }}
                                        activeDot={{ r: 10, strokeWidth: 0, fill: '#000000' }}
                                        isAnimationActive={true}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-4 bg-neutral-50/50 rounded-[2.5rem] border border-dashed border-neutral-200">
                                <AlertCircle className="w-10 h-10 text-neutral-300" />
                                <p className="text-neutral-400 font-black uppercase tracking-widest text-xs">Insufficient data for progression mapping</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Volume & PR History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Volume Chart */}
                <div className="bg-white border border-neutral-100 p-10 rounded-[3.5rem] shadow-sm">
                    <SectionHeader title="Volume" subtitle="Distribution" icon={Weight} />
                    <div className="h-[300px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={volumeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="1 4" vertical={false} stroke="#e5e5e5" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 900 }}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#a3a3a3', fontSize: 10, fontWeight: 900 }}
                                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px' }}
                                />
                                <Area
                                    type="linear"
                                    dataKey="volume"
                                    name="Volume"
                                    stroke="#f97316"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorVolume)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PR History Timeline */}
                <div className="bg-white border border-neutral-100 p-10 rounded-[3.5rem] shadow-sm">
                    <SectionHeader title="Personal" subtitle="Records" icon={Trophy} />
                    <div className="mt-6 space-y-4">
                        {prHistory.length > 0 ? prHistory.map((pr, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="flex items-center justify-between p-5 bg-neutral-50 rounded-3xl border border-neutral-100 group hover:border-orange-500 hover:bg-white transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-neutral-100 group-hover:bg-orange-50 transition-colors">
                                        <span className="text-orange-500 font-black text-xs">{idx === 0 ? 'NEW' : idx + 1}</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                            {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-sm font-black text-black uppercase">
                                            {pr.weight}kg × {pr.reps} reps
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Calculated E1RM</p>
                                    <p className="text-xl font-black text-orange-500">{pr.e1RM}<span className="text-[10px] ml-0.5">KG</span></p>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                                <Activity className="w-12 h-12 text-neutral-100" />
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm italic">Initialize baseline data to track PRs</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Scientific Footer */}
            <div className="bg-neutral-900 text-white p-10 rounded-[3.5rem] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                    <Info className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                    <h4 className="text-lg font-black uppercase tracking-tight mb-2 italic">Scientific Methodology</h4>
                    <p className="text-sm font-bold text-neutral-500 leading-relaxed max-w-2xl">
                        Calculations use the <span className="text-white">Epley Formula</span> for E1RM: Weight × (1 + Reps/30).
                        Volume represents the total load moved (Sum of weight × reps).
                        Periodic comparisons evaluate the current 4-week moving average against the preceding 4-week baseline to identify trends and plateaus.
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Activity className="w-32 h-32" />
                </div>
            </div>
        </div>
    );
};

export default ExerciseAnalyticsPage;
