import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Dumbbell, ClipboardList, TrendingUp, Library, Zap, Target, Activity } from 'lucide-react';
import ProgressOverview from '../components/dashboard/ProgressOverview';
import WorkoutCalendar from '../components/dashboard/WorkoutCalendar';

const API_BASE_URL = 'http://localhost:3000';

/**
 * Dashboard Component
 * Manages core fitness data: weekly summary, streaks, and monthly heatmap.
 */
const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [streak, setStreak] = useState(null);
    const [monthlyLogs, setMonthlyLogs] = useState([]);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const [progressError, setProgressError] = useState(null);

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }, []);

    /**
     * Fetch core dashboard data
     */
    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoadingProgress(true);
            setProgressError(null);

            // Get month boundaries for heatmap (using local time)
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const formatDate = (d) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const [summaryRes, streakRes, logsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/progress/summary`, { headers: getAuthHeaders() }),
                axios.get(`${API_BASE_URL}/progress/streak`, { headers: getAuthHeaders() }),
                axios.get(`${API_BASE_URL}/workouts/logs`, {
                    headers: getAuthHeaders(),
                    params: {
                        from: formatDate(firstDay),
                        to: formatDate(lastDay),
                        limit: 100
                    }
                }),
            ]);

            setSummary(summaryRes.data);
            setStreak(streakRes.data);
            setMonthlyLogs(logsRes.data.data || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setProgressError("Failed to load progress data.");
        } finally {
            setIsLoadingProgress(false);
        }
    }, [getAuthHeaders]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Derived stats for "small outlines"
    const totalVolume = monthlyLogs.reduce((acc, log) => {
        const logVol = log.performedExercises?.reduce((exAcc, ex) => {
            const exVol = ex.sets?.reduce((sAcc, s) => sAcc + (s.reps * s.weight), 0) || 0;
            return exAcc + exVol;
        }, 0) || 0;
        return acc + logVol;
    }, 0);

    const completedThisMonth = monthlyLogs.filter(l => l.status === 'completed').length;

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Content */}
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 text-black uppercase">
                    Your Training <span className="text-orange-500">Command Center</span>
                </h1>
                <p className="text-neutral-500 text-lg max-w-2xl font-medium">
                    Analyze your consistency, track your streak, and push your limits daily.
                </p>
            </div>

            {/* High-Level Overview Cards */}
            <ProgressOverview
                summary={summary}
                streak={streak}
                isLoading={isLoadingProgress}
                error={progressError}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Calendar Section (2/3) */}
                <div className="xl:col-span-2">
                    <WorkoutCalendar logs={monthlyLogs} currentStreak={streak?.currentStreak || 0} />
                </div>

                {/* Small Outlines of Progress (1/3) */}
                <div className="space-y-6">
                    <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="w-24 h-24" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2">Monthly Volume</p>
                        <h4 className="text-4xl font-black mb-1">{totalVolume.toLocaleString()}</h4>
                        <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Total Kilograms Moved</p>
                    </div>

                    <div className="bg-white border border-neutral-200 rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">Completion Rate</p>
                        <div className="flex items-end gap-3 mb-1">
                            <h4 className="text-4xl font-black">{completedThisMonth}</h4>
                            <p className="text-neutral-400 text-sm font-bold mb-1.5 uppercase tracking-widest">Sessions</p>
                        </div>
                        <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Recorded this month</p>
                        <div className="absolute bottom-0 right-0 p-6">
                            <Target className="w-12 h-12 text-neutral-100" />
                        </div>
                    </div>

                    <Link to="/progress" className="block group">
                        <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white hover:bg-black transition-all duration-500 shadow-xl shadow-orange-200 hover:shadow-neutral-200 flex items-center justify-between">
                            <div>
                                <h4 className="text-xl font-black uppercase tracking-tight">Full Insights</h4>
                                <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Detailed Performance</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                                <Zap className="w-6 h-6 fill-white" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Grid Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { to: "/workout-plans", icon: Dumbbell, title: "Plans", desc: "Manage routines" },
                    { to: "/workout-logging", icon: ClipboardList, title: "Logs", desc: "Track sessions" },
                    { to: "/progress", icon: TrendingUp, title: "Analytics", desc: "View gains" },
                    { to: "/workout-library", icon: Library, title: "Library", desc: "Browse exercises" }
                ].map((item, idx) => (
                    <Link key={idx} to={item.to} className="group">
                        <div className="bg-white border border-neutral-200 p-6 rounded-[2rem] hover:border-orange-500/50 hover:bg-orange-50/50 transition-all duration-300 h-full shadow-sm">
                            <div className="w-12 h-12 bg-orange-500/5 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <item.icon className="w-6 h-6 text-orange-500" />
                            </div>
                            <h3 className="text-lg font-bold text-black">{item.title}</h3>
                            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-1">
                                {item.desc}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default DashboardPage;
