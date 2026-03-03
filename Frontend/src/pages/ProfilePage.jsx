import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import {
    User,
    Flame,
    Target,
    PieChart,
    Scale,
    Check,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Camera,
    Moon,
    Sun,
    Activity
} from 'lucide-react';

// Importing avatar assets
import male1 from '../assets/male1.png';
import male2 from '../assets/male2.jpg';
import female1 from '../assets/female1.jpg';
import female2 from '../assets/female2.jpg';



const AVATARS = [
    { id: 'male_1', src: male1, label: 'Toji' },
    { id: 'male_2', src: male2, label: 'Bruce' },
    { id: 'female_1', src: female1, label: 'Maki' },
    { id: 'female_2', src: female2, label: 'Yuki' },
];

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [nutrition, setNutrition] = useState({
        calories: 0,
        protein: 0
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setUser(res.data);
                if (res.data.nutritionProfile) {
                    setNutrition(res.data.nutritionProfile);
                }
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleUpdateNutrition = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put('/users/nutrition', { nutritionProfile: nutrition });
            setSuccessMessage('Nutrition targets updated!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateAvatar = async (avatarId) => {
        setIsSaving(true);
        try {
            await api.put('/users/avatar', { avatar: avatarId });
            setUser(prev => ({ ...prev, avatar: avatarId }));
            setSuccessMessage('Avatar updated!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleTheme = async () => {
        const newTheme = user?.theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);
        setUser(prev => ({ ...prev, theme: newTheme }));

        try {
            await api.put('/users/theme', { theme: newTheme });
        } catch (error) {
            console.error('Failed to update theme on server:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            </div>
        );
    }

    const currentAvatarSrc = AVATARS.find(a => a.id === user?.avatar)?.src || null;

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-black dark:text-white uppercase tracking-tight mb-2">Athlete Profile</h1>
                    <p className="text-neutral-500 text-sm uppercase tracking-widest font-bold">Manage your physique and performance settings</p>
                </div>

                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:border-orange-500 transition-all font-bold uppercase tracking-widest text-[10px]"
                >
                    {user?.theme === 'dark' ? (
                        <>
                            <Sun className="w-4 h-4 text-orange-500" />
                            Switch to Light
                        </>
                    ) : (
                        <>
                            <Moon className="w-4 h-4 text-neutral-500" />
                            Switch to Dark
                        </>
                    )}
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Left: Avatar Selection */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="relative">
                        <div className="aspect-square rounded-[2.5rem] bg-neutral-100 dark:bg-neutral-800 overflow-hidden border-4 border-white dark:border-neutral-900 shadow-2xl">
                            {currentAvatarSrc ? (
                                <img src={currentAvatarSrc} alt="Current Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-20 h-20 text-neutral-300" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white p-4 rounded-2xl shadow-xl">
                            <Camera className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">Change Avatar</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const currentIndex = AVATARS.findIndex(a => a.id === user?.avatar);
                                        const newIndex = currentIndex <= 0 ? AVATARS.length - 1 : currentIndex - 1;
                                        handleUpdateAvatar(AVATARS[newIndex].id);
                                    }}
                                    className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        const currentIndex = AVATARS.findIndex(a => a.id === user?.avatar);
                                        const newIndex = currentIndex >= AVATARS.length - 1 ? 0 : currentIndex + 1;
                                        handleUpdateAvatar(AVATARS[newIndex].id);
                                    }}
                                    className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 overflow-x-auto py-4 scrollbar-hide">
                            {AVATARS.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    onClick={() => handleUpdateAvatar(avatar.id)}
                                    className={`
                                        relative flex-shrink-0 w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all
                                        ${user?.avatar === avatar.id ? 'border-orange-500 scale-[1.05] ring-4 ring-orange-500/10' : 'border-transparent opacity-40 hover:opacity-100'}
                                    `}
                                >
                                    <img src={avatar.src} alt={avatar.label} className="w-full h-full object-cover" />
                                    {user?.avatar === avatar.id && (
                                        <div className="absolute inset-0 bg-orange-500/10 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-orange-500" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Nutrition Info */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-neutral-900 p-10 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm"
                    >
                        <form onSubmit={handleUpdateNutrition} className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-black dark:text-white uppercase tracking-tight">Nutrition Targets</h3>
                                {successMessage && (
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                        {successMessage}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                        <label className="flex items-center gap-2">
                                            <Flame className="w-4 h-4 text-orange-500" />
                                            Daily Calories
                                        </label>
                                        <span className="text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 px-4 py-1.5 rounded-full text-xs">{nutrition.calories} KCAL</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1000"
                                        max="5000"
                                        step="50"
                                        value={nutrition.calories}
                                        onChange={(e) => setNutrition({ ...nutrition, calories: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center block">Protein (g)</label>
                                        <input
                                            type="number"
                                            value={nutrition.protein}
                                            onChange={(e) => setNutrition({ ...nutrition, protein: parseInt(e.target.value) || 0 })}
                                            className="w-full text-center py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl font-black text-xl focus:outline-none focus:border-orange-500 dark:text-white transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 text-center block">Daily Goal</label>
                                        <div className="w-full text-center py-4 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 rounded-2xl font-black text-xl text-orange-500 transition-colors">
                                            {nutrition.calories} KCAL
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-black dark:bg-orange-500 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                            </button>
                        </form>
                    </motion.div>

                    {/* Stats Card */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Fitness Level</p>
                                <p className="font-bold text-black dark:text-white uppercase">{user?.fitnessLevel || 'Beginner'}</p>
                            </div>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Main Goal</p>
                                <p className="font-bold text-black dark:text-white uppercase">{user?.goal?.replace('_', ' ') || 'None'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
