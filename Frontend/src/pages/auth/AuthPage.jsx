import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, ShieldCheck, Dumbbell, User, Mail,
    Lock, EyeOff, Eye, ChevronRight, Flame,
    Activity, Trophy
} from 'lucide-react';

const AuthPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, verify, isAuthenticated, loading: authLoading } = useAuth();

    // Determine initial mode based on URL or default to login
    const [isLogin, setIsLogin] = useState(location.pathname === '/login');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        goal: 'muscle_gain',
        fitnessLevel: 'beginner'
    });

    useEffect(() => {
        // Redirect if already logged in
        if (isAuthenticated && !authLoading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        setIsLogin(location.pathname === '/login');
        setError('');
        setSuccessMsg('');
        setIsVerifying(false);
    }, [location.pathname]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const data = await verify(formData.email, otp);
            if (data?.user) {
                setSuccessMsg('Email verified! Redirecting to dashboard...');
                // Authentication state update is handled by context
            } else {
                setSuccessMsg('Email verified! You can now log in.');
                setIsVerifying(false);
                setIsLogin(true);
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            await api.post('/auth/resend-otp', { email: formData.email });
            setSuccessMsg('A new OTP has been sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                // Redirect is handled by the useEffect watching isAuthenticated
            } else {
                if (formData.password.length < 8) {
                    throw new Error('Password must be at least 8 characters long');
                }

                const res = await api.post('/auth/register', formData);
                setSuccessMsg(res.data?.message || 'Check your email for the OTP.');
                setIsVerifying(true);
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Authentication failed.';
            setError(msg);

            // Special handling for unverified login
            if (msg.toLowerCase().includes('verify your email')) {
                setError('Your account is not verified yet.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        navigate(isLogin ? '/register' : '/login');
    };

    // --- RENDER LOGIC ---

    const renderVerificationForm = () => (
        <form onSubmit={handleVerify} className="space-y-6">
            <header className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-2">Verify Email</h1>
                <div className="h-1.5 w-16 bg-orange-500 mx-auto lg:mx-0 mb-4 rounded-full" />
                <p className="text-neutral-500 text-sm uppercase tracking-widest font-bold">
                    Enter the 6-digit code sent to {formData.email}
                </p>
            </header>

            <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">OTP CODE</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ShieldCheck className="h-4 w-4 text-orange-500" />
                    </div>
                    <input
                        type="text"
                        maxLength="6"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-black placeholder-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10 transition-all font-bold tracking-[0.5em] text-center text-lg shadow-sm"
                        placeholder="000000"
                    />
                </div>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase text-center">
                    {error}
                </motion.div>
            )}

            {successMsg && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase text-center">
                    {successMsg}
                </motion.div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-500 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
            </button>

            <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-orange-500 transition-colors mt-4"
            >
                Didn't get a code? Resend
            </button>
        </form>
    );

    const renderAuthForm = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            <header className="mb-10 text-center lg:text-left">
                <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-2">
                    {isLogin ? "Let's Lift" : "Start Journey"}
                </h1>
                <div className="h-1.5 w-16 bg-orange-500 mx-auto lg:mx-0 mb-4 rounded-full" />
                <p className="text-neutral-500 text-sm uppercase tracking-widest font-bold">
                    {isLogin ? "Welcome back, Athlete" : "Create your fitness identity"}
                </p>
            </header>

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
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-[0.2em] text-center flex flex-col gap-2">
                    <div>ERROR: {error}</div>
                    {error.toLowerCase().includes('not verified') && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsVerifying(true);
                                handleResendOtp();
                            }}
                            className="text-orange-600 underline hover:text-orange-700 transition-colors"
                        >
                            VERIFY NOW
                        </button>
                    )}
                </motion.div>
            )}

            {successMsg && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] text-center">
                    {successMsg}
                </motion.div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden bg-black text-white font-black py-4 rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:bg-orange-500 hover:shadow-[0_10px_30px_-5px_rgba(249,115,22,0.4)] transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-3 active:scale-95 group uppercase tracking-[0.2em] text-xs"            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        {isLogin ? "Start Training" : "Create Profile"}
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <footer className="mt-12 text-center">
                <button
                    onClick={toggleMode}
                    type="button"
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-orange-500 transition-colors"
                >
                    {isLogin ? "New to the gym? Create Profile" : "Already a member? Sign In"}
                </button>
            </footer>
        </form>
    );

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
                            {isVerifying ? "Verify Access" : (isLogin ? "Member Login" : "Join the Elite")}
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

                {/* Right Side: Form */}
                <div className="p-8 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        {isVerifying ? renderVerificationForm() : renderAuthForm()}
                    </div>
                </div>
            </motion.div>
        </div>

    );
};

export default AuthPage;
