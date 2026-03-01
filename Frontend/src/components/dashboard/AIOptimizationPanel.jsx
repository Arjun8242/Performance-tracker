import React, { useState } from 'react';
import { Sparkles, Brain, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const AIOptimizationPanel = ({ performance, onOptimize, userGoal = 'hypertrophy' }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [error, setError] = useState(null);

    const handleOptimize = async () => {
        try {
            setIsOptimizing(true);
            setError(null);
            const response = await axios.post(
                `${API_BASE_URL}/ai/adjust-plan`,
                { goal: userGoal || 'hypertrophy', strictMode: true }
            );
            onOptimize(response.data);
        } catch (err) {
            console.error('Adjustment Error:', err);
            setError(err.response?.data?.message || 'Failed to generate optimization plan.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const weakMuscles = performance?.weakMuscleGroups || [];

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">AI Engine</p>
                    <h3 className="text-2xl font-black text-black dark:text-white">Plan Optimization</h3>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-orange-500" />
                </div>
            </div>

            {weakMuscles.length > 0 ? (
                <div className="mb-8 space-y-4">
                    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-100 dark:border-red-500/20">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-bold text-red-900 dark:text-red-400 uppercase tracking-tight mb-1">Imbalance Detected</p>
                            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">
                                Your <span className="font-bold">{weakMuscles.join(', ')}</span> weekly volume is below optimal targets.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-neutral-500 text-sm font-medium mb-8 leading-relaxed">
                    Your current muscle distribution looks balanced. AI can still suggest fine-tuning for your hypertrophy goal.
                </p>
            )}

            <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="w-full bg-black dark:bg-white text-white dark:text-black rounded-2xl py-4 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-orange-600 dark:hover:bg-orange-500 dark:hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                {isOptimizing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Data...
                    </>
                ) : (
                    <>
                        Optimize My Plan
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            {error && (
                <p className="mt-4 text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    {error}
                </p>
            )}
        </div>
    );
};

export default AIOptimizationPanel;
