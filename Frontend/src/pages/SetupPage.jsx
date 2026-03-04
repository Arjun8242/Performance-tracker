import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Check,
    Activity,
    Flame,
    Target,
    Zap,
    Scale,
    PieChart,
    UserCircle2
} from 'lucide-react';

// Importing avatar assets
import male1 from '../assets/male1.png';
import male2 from '../assets/male2.jpg';
import female1 from '../assets/female1.jpg';
import female2 from '../assets/female2.jpg';



const AVATARS = [
    { id: 'male_1', gender: 'male', src: male1, label: 'Toji' },
    { id: 'male_2', gender: 'male', src: male2, label: 'Bruce' },
    { id: 'female_1', gender: 'female', src: female1, label: 'Maki' },
    { id: 'female_2', gender: 'female', src: female2, label: 'Yuki' },
];

const SetupPage = () => {
    const navigate = useNavigate();
    const { checkAuthStatus } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
    const [nutrition, setNutrition] = useState({
        calories: 2000,
        protein: 150
    });

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const res = await api.get('/users/profile');

                // If avatar and nutrition are already set, no need to be here
                if (res.data.avatar && res.data.nutritionProfile) {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Check setup failed:', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            }
        };

        checkSetup();
    }, [navigate]);

    const handleNutritionChange = (e) => {
        const { name, value } = e.target;
        setNutrition(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            // 1. Update Avatar
            await api.put('/users/avatar', { avatar: selectedAvatar });

            // 2. Update Nutrition
            await api.put('/users/nutrition', { nutritionProfile: nutrition });

            // 3. Refresh user state in AuthContext so layout sees updated avatar/nutrition
            await checkAuthStatus();

            // 4. Success -> Dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Setup failed:', error);
            alert('Failed to save settings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4 font-sans selection:bg-orange-500/30 overflow-hidden">
            <div className="max-w-4xl w-full bg-white dark:bg-neutral-900 rounded-[3rem] shadow-2xl border border-neutral-100 dark:border-neutral-800 relative">
                <div className="flex flex-col">

                    {/* Content Area */}
                    <div className="p-8 lg:p-12 flex-1 flex flex-col justify-center bg-white dark:bg-neutral-900 rounded-[3rem] relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px]" />

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-8 relative z-10 max-w-2xl mx-auto w-full text-center"
                                >
                                    <header>
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                <Activity className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="text-xl font-black uppercase tracking-tighter">AI-Fitness</span>
                                        </div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-black dark:text-white uppercase tracking-tight mb-2">Select Your Physique</h2>
                                        <p className="text-neutral-500 text-sm uppercase tracking-widest font-bold">Choose an avatar that best represents your goal</p>
                                    </header>

                                    <div className="relative flex items-center justify-center group px-4">
                                        <button
                                            onClick={() => {
                                                const currentIndex = AVATARS.findIndex(a => a.id === selectedAvatar);
                                                const newIndex = currentIndex <= 0 ? AVATARS.length - 1 : currentIndex - 1;
                                                setSelectedAvatar(AVATARS[newIndex].id);
                                            }}
                                            className="absolute left-0 lg:-left-12 z-20 p-5 bg-white shadow-2xl border border-neutral-100 rounded-full hover:bg-orange-500 hover:text-white transition-all active:scale-90"
                                        >
                                            <ChevronLeft className="w-7 h-7" />
                                        </button>

                                        <div className="w-full overflow-hidden flex justify-center py-6">
                                            <AnimatePresence mode="wait">
                                                {AVATARS.map((avatar) => selectedAvatar === avatar.id && (
                                                    <motion.div
                                                        key={avatar.id}
                                                        initial={{ opacity: 0, scale: 0.9, x: 100 }}
                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, x: -100 }}
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        className="w-full max-w-[320px]"
                                                    >
                                                        <div className="relative aspect-[3/4.5] rounded-[3.5rem] overflow-hidden border-[6px] border-orange-500 shadow-[0_32px_64px_-16px_rgba(249,115,22,0.3)]">
                                                            <img
                                                                src={avatar.src}
                                                                alt={avatar.label}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute top-6 right-6 bg-orange-500 text-white p-2.5 rounded-full shadow-lg">
                                                                <Check className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div className="absolute bottom-8 left-8 right-8 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-6 py-4 rounded-3xl text-sm font-black uppercase tracking-widest text-black dark:text-white text-center shadow-2xl border border-white/50 dark:border-neutral-700">
                                                                {avatar.label}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>

                                        <button
                                            onClick={() => {
                                                const currentIndex = AVATARS.findIndex(a => a.id === selectedAvatar);
                                                const newIndex = currentIndex >= AVATARS.length - 1 ? 0 : currentIndex + 1;
                                                setSelectedAvatar(AVATARS[newIndex].id);
                                            }}
                                            className="absolute right-0 lg:-right-12 z-20 p-5 bg-white shadow-2xl border border-neutral-100 rounded-full hover:bg-orange-500 hover:text-white transition-all active:scale-90"
                                        >
                                            <ChevronRight className="w-7 h-7" />
                                        </button>
                                    </div>



                                    <button
                                        disabled={!selectedAvatar}
                                        onClick={() => setStep(2)}
                                        className="w-full bg-black text-white font-black py-5 rounded-[1.25rem] shadow-xl hover:bg-orange-500 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs disabled:opacity-30 disabled:cursor-not-allowed group mt-4"
                                    >
                                        Continue to Nutrition
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6 relative z-10 max-w-2xl mx-auto w-full text-center"
                                >
                                    <header>
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                                                <Target className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <span className="text-xl font-black uppercase tracking-tighter">AI-Fitness</span>
                                        </div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-black dark:text-white uppercase tracking-tight mb-2">Nutrition Targets</h2>
                                        <p className="text-neutral-500 text-sm uppercase tracking-widest font-bold">Set your calories and protein goals</p>
                                    </header>

                                    <div className="space-y-8">
                                        {/* Calories */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                <label className="flex items-center gap-2">
                                                    <Flame className="w-4 h-4 text-orange-500" />
                                                    Daily Calories
                                                </label>
                                                <div className="flex items-end gap-2 text-black dark:text-white">
                                                    <span className="text-3xl font-black">{nutrition.calories}</span>
                                                    <span className="text-[10px] pb-1.5 uppercase opacity-40">kcal</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                name="calories"
                                                min="1000"
                                                max="5000"
                                                step="50"
                                                value={nutrition.calories}
                                                onChange={handleNutritionChange}
                                                className="w-full h-3 bg-neutral-100 rounded-full appearance-none cursor-pointer accent-orange-500"
                                            />
                                        </div>

                                        {/* Protein */}
                                        <div className="bg-neutral-50 rounded-4xl p-8 border border-neutral-100">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-orange-500" />
                                                    Daily Protein Goal
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setNutrition(prev => ({ ...prev, protein: Math.max(0, prev.protein - 5) }))}
                                                        className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all active:scale-90"
                                                    >
                                                        <ChevronLeft className="w-6 h-6" />
                                                    </button>

                                                    <div className="flex flex-col items-center min-w-30">
                                                        <input
                                                            type="number"
                                                            name="protein"
                                                            value={nutrition.protein}
                                                            onChange={handleNutritionChange}
                                                            className="w-full text-center bg-transparent font-black text-5xl focus:outline-none"
                                                        />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-2">Grams</span>
                                                    </div>

                                                    <button
                                                        onClick={() => setNutrition(prev => ({ ...prev, protein: prev.protein + 5 }))}
                                                        className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all active:scale-90"
                                                    >
                                                        <ChevronRight className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-orange-500/5 p-4 rounded-2xl flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                                                    <Flame className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total</p>
                                                    <p className="font-bold text-sm">{nutrition.calories} KCAL</p>
                                                </div>
                                            </div>
                                            <div className="bg-orange-500/5 p-4 rounded-2xl flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                                                    <Target className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Protein</p>
                                                    <p className="font-bold text-sm">{nutrition.protein}G / DAY</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-12 w-full max-w-md mx-auto">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="px-10 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-black py-5 rounded-2xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                            Back
                                        </button>
                                        <button
                                            onClick={handleComplete}
                                            disabled={isLoading}
                                            className="flex-1 bg-black text-white font-black py-5 rounded-2xl shadow-xl hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs group"
                                        >
                                            {isLoading ? 'Finalizing Profile...' : 'Complete Setup'}
                                            {!isLoading && <Check className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupPage;
