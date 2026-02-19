import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, User, Loader2, ArrowRight, Activity,
    Target, Zap, ChevronRight, Eye, EyeOff, ClipboardList, Smile, Cpu,
    Dumbbell, Trophy, Flame, ShieldCheck
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000';

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine initial mode based on URL or default to login
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        goal: 'muscle_gain',
        fitnessLevel: 'beginner'
    });

    useEffect(() => {
        setIsLogin(location.pathname === '/login');
        setError('');
    }, [location.pathname]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const storeTokenAndGo = (token) => {
        // TODO: for now i m storing token on local 
        // when i will be about to deploy i will save on cookies
        localStorage.setItem('auth_token', token);
        navigate('/dashboard');
    };

    const attemptLogin = async (email, password) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
            if (res.data?.token) {
                storeTokenAndGo(res.data.token);
                return true;
            }
        } catch {
            return false;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Backend Sync Check:
        // Signup expects: name, email, password (min 8), goal, fitnessLevel
        // Login expects: email, password

        try {
            if (isLogin) {
                const res = await axios.post(`${API_BASE_URL}/auth/login`, {
                    email: formData.email,
                    password: formData.password
                });
                if (res.data?.token) storeTokenAndGo(res.data.token);
            } else {
                // Frontend check to match backend 8 char requirement
                if (formData.password.length < 8) {
                    throw new Error('Password must be at least 8 characters long');
                }

                const res = await axios.post(`${API_BASE_URL}/auth/signup`, formData);
                if (res.data?.token) {
                    storeTokenAndGo(res.data.token);
                }
            }
        } catch (err) {
            if (!isLogin && err.response?.status === 409) {
                // If user exists on signup, log them in
                const loginSuccess = await attemptLogin(formData.email, formData.password);
                if (!loginSuccess) {
                    setError('Account exists, but password mismatch.');
                }
            } else {
                setError(err.response?.data?.message || err.message || 'Authentication failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        navigate(isLogin ? '/signup' : '/login');
    };

    return (
        <div className="fixed inset-0 min-h-screen max-h-screen bg-neutral-50 text-black flex items-center justify-center p-4 md:p-8 font-['Poppins'] selection:bg-orange-500 selection:text-white overflow-hidden">
            {/* Minimalist Background Elements */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] border-[1px] border-orange-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] border-[1px] border-orange-500/5 rounded-full blur-2xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl grid lg:grid-cols-2 bg-white border border-neutral-200 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden z-10"
            >
                {/* Left Side: Brand & Visuals (White/Black/Orange) */}
                <div className="hidden lg:flex p-16 flex-col justify-between relative bg-neutral-50 border-r border-neutral-200 text-black overflow-hidden">
                    {/* Subtle texture/pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none text-neutral-900">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                    </div>

                    <div className="relative z-10">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ duration: 0.3 }}
                            className="w-16 h-16 bg-white border border-neutral-200 rounded-2xl flex items-center justify-center mb-10 shadow-sm"
                        >
                            <Dumbbell className="w-10 h-10 text-orange-500" />
                        </motion.div>

                        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight mb-8 uppercase text-black">
                            {isLogin ? "Member Login" : "Join the Elite"}
                        </h2>

                        <div className="space-y-8">
                            {[
                                { icon: Flame, title: "Pro Training", desc: "AI-driven workout routines" },
                                { icon: Activity, title: "Live Stats", desc: "Track your progress in real-time" },
                                { icon: Trophy, title: "Goal Crushing", desc: "Expert guidance to reach your PR" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-6 group">
                                    <div className="w-12 h-12 rounded-full border border-neutral-200 bg-white flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300 shadow-sm">
                                        <item.icon className="w-6 h-6 text-black group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold uppercase tracking-wider text-sm text-black">{item.title}</h4>
                                        <p className="text-neutral-500 text-xs mt-1 uppercase tracking-widest font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-neutral-200">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-5 h-5 text-orange-500" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Secure Athlete Portal</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form (White) */}
                <div className="p-8 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <header className="mb-10 text-center lg:text-left">
                            <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-2">
                                {isLogin ? "Let's Lift" : "Start Journey"}
                            </h1>
                            <div className="h-1.5 w-16 bg-orange-500 mx-auto lg:mx-0 mb-4 rounded-full" />
                            <p className="text-neutral-500 text-sm uppercase tracking-widest font-bold">
                                {isLogin ? "Welcome back, Athlete" : "Create your fitness identity"}
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-1.5 overflow-hidden"
                                    >
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Athlete Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-4 w-4 text-orange-500" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                required={!isLogin}
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="block w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-black placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all font-bold text-sm shadow-sm"
                                                placeholder="YOUR FULL NAME"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-black placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all font-bold text-sm shadow-sm"
                                        placeholder="CHAMP@FITNESS.COM"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="block w-full pl-12 pr-12 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-black placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all font-bold text-sm shadow-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-black transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="grid grid-cols-2 gap-4 overflow-hidden pt-2"
                                    >
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">Primary Goal</label>
                                            <select
                                                name="goal"
                                                value={formData.goal}
                                                onChange={handleInputChange}
                                                className="block w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-black text-xs font-bold focus:outline-none focus:border-orange-500 appearance-none cursor-pointer uppercase shadow-sm"
                                            >
                                                <option value="muscle_gain">Muscle Gain</option>
                                                <option value="fat_loss">Fat Loss</option>
                                                <option value="endurance">Endurance</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">Fitness Level</label>
                                            <select
                                                name="fitnessLevel"
                                                value={formData.fitnessLevel}
                                                onChange={handleInputChange}
                                                className="block w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-black text-xs font-bold focus:outline-none focus:border-orange-500 appearance-none cursor-pointer uppercase shadow-sm"
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-[0.2em] text-center"
                                >
                                    ERROR: {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative overflow-hidden bg-black text-white font-black py-4 rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:bg-orange-500 hover: shadow-[0_10px_30px_-5px_rgba(249,115,22,0.4)] transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-3 active:scale-95 group uppercase tracking-[0.2em] text-xs"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? "Start Training" : "Create Profile"}
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <footer className="mt-12 text-center">
                            <button
                                onClick={toggleMode}
                                type="button"
                                className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-orange-500 transition-colors"
                            >
                                {isLogin ? "New to the gym? Create Profile" : "Already a member? Sign In"}
                            </button>
                        </footer>
                    </div>
                </div>
            </motion.div>
        </div>

    );
};

export default AuthPage;
