import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import {
    Zap,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    Loader2,
    Sparkles,
    Brain,
    Clock
} from 'lucide-react';



const AIPerformanceCard = () => {
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [, setError] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastAnalysisAt, setLastAnalysisAt] = useState(null);
    const [isCached, setIsCached] = useState(false);
    const [cacheCountdown, setCacheCountdown] = useState(null);

    // Compute human-readable time since last analysis
    const getTimeSinceAnalysis = (timestamp) => {
        if (!timestamp) return null;
        const now = new Date();
        const lastTime = new Date(timestamp);
        const diffMs = now - lastTime;

        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffSeconds < 60) return 'Updated just now';
        if (diffMinutes < 60) return `Updated ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `Updated ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    // Calculate remaining time until cache expires
    const getTimeUntilRefresh = (timestamp) => {
        if (!timestamp) return null;
        const now = new Date();
        const lastTime = new Date(timestamp);
        const cacheExpireAt = new Date(lastTime.getTime() + 24 * 60 * 60 * 1000); // 24h from last analysis
        const remainingMs = cacheExpireAt - now;

        if (remainingMs <= 0) return null;

        const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${remainingHours}h ${remainingMinutes}m`;
    };

    const fetchAnalysis = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setIsAnalyzing(true);
            else setIsLoading(true);

            setError(null);

            const res = await api.post('/ai/analyze', {});
            setAnalysis(res.data);
            setLastAnalysisAt(res.data.lastAnalysisAt);
            setIsCached(res.data.cached || false);

            // Update countdown if cached
            if (res.data.cached) {
                setCacheCountdown(getTimeUntilRefresh(res.data.lastAnalysisAt));
            } else {
                setCacheCountdown(null);
            }
        } catch (err) {
            console.error('AI Analysis Error:', err);
            if (err.response?.status === 429) {
                // If rate limited, try to just get the context (raw data) to show something
                try {
                    const contextRes = await api.get('/ai/context');
                    setAnalysis({ context: contextRes.data, isRateLimited: true });
                } catch {
                    setError("Unable to load performance data.");
                }
            } else {
                setError("AI Coach is currently offline.");
            }
        } finally {
            setIsLoading(false);
            setIsAnalyzing(false);
        }
    }, []);

    // Update countdown timer every minute
    useEffect(() => {
        if (!isCached || !lastAnalysisAt) return;

        const timer = setInterval(() => {
            setCacheCountdown(getTimeUntilRefresh(lastAnalysisAt));
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [isCached, lastAnalysisAt]);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 h-125 flex flex-col items-center justify-center space-y-4 shadow-sm transition-colors">
                <div className="w-16 h-16 bg-orange-500/5 rounded-2xl flex items-center justify-center animate-pulse">
                    <Brain className="w-8 h-8 text-orange-500/50" />
                </div>
                <div className="text-center">
                    <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">AI Coach</p>
                    <p className="text-black dark:text-white font-bold">Synchronizing Data...</p>
                </div>
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
            </div>
        );
    }

    const { summary, strengths, risks, recommendation, context, isRateLimited } = analysis || {};
    const timeSinceAnalysis = getTimeSinceAnalysis(lastAnalysisAt);
    const isButtonDisabled = isCached || isAnalyzing || isRateLimited;

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all">
            {/* Header */}
            <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Pro Analysis</p>
                        <h3 className="text-lg font-black text-black dark:text-white">AI PERFORMANCE</h3>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {timeSinceAnalysis && (
                        <div className="px-3 py-1.5 bg-orange-50 rounded-full flex items-center gap-1.5 border border-orange-100">
                            <Clock className="w-3 h-3 text-orange-500" />
                            <span className="text-[8px] font-black text-orange-600 uppercase tracking-tighter">{timeSinceAnalysis}</span>
                        </div>
                    )}
                    {isRateLimited && (
                        <div className="px-3 py-1.5 bg-neutral-100 rounded-full flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-tighter">Daily Limit Met</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="px-8 pb-8 flex-1 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Summary Quote */}
                <div className="relative">
                    <p className="text-neutral-600 font-medium leading-relaxed italic text-sm">
                        "{summary || "Analyzing your trajectory. Keep pushing the limits to generate deeper insights."}"
                    </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 p-4 rounded-3xl">
                        <p className="text-[8px] font-black uppercase tracking-widest text-orange-500 mb-1">Weekly Comp</p>
                        <p className="text-2xl font-black text-black dark:text-white">{context?.weeklyCompletion || 0}%</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-4 rounded-3xl">
                        <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400 mb-1">Current Streak</p>
                        <p className="text-2xl font-black text-black dark:text-white">{context?.streak || 0}</p>
                    </div>
                </div>

                {/* Strengths & Risks */}
                <div className="space-y-4">
                    {strengths?.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" /> Momentum
                            </p>
                            <div className="space-y-1.5">
                                {strengths.map((s, idx) => (
                                    <div key={idx} className="bg-emerald-50/50 text-emerald-900 px-4 py-2 rounded-2xl text-[11px] font-bold border border-emerald-100">
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {risks?.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Area of Concern
                            </p>
                            <div className="space-y-1.5">
                                {risks.map((r, idx) => (
                                    <div key={idx} className="bg-orange-50/50 text-orange-900 px-4 py-2 rounded-2xl text-[11px] font-bold border border-orange-100">
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Muscle Target Analysis */}
                {context?.weakMuscleGroups?.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Priority Targets</p>
                        <div className="flex flex-wrap gap-2">
                            {context.weakMuscleGroups.map((muscle, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                                    {muscle}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendation Box */}
                {recommendation && (
                    <div className="bg-black p-6 rounded-4xl text-white">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-500 mb-3">Coach's Directive</p>
                        <p className="text-xs font-bold leading-relaxed mb-4">
                            {recommendation}
                        </p>
                        <button
                            onClick={() => fetchAnalysis(true)}
                            disabled={isButtonDisabled}
                            title={isCached ? `Next refresh available in ${cacheCountdown}` : ''}
                            className="w-full py-3 bg-white text-black hover:bg-orange-500 hover:text-white transition-colors rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isAnalyzing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isCached ? (
                                <>Next refresh in {cacheCountdown}</>
                            ) : (
                                <>Recalculate Analysis <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIPerformanceCard;
