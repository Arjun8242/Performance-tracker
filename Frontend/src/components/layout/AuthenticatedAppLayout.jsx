import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000';
import {
    Activity,
    LayoutDashboard,
    Library,
    Dumbbell,
    ClipboardList,
    TrendingUp,
    User,
    MessageSquare,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    Zap,
    Star
} from 'lucide-react';

import male1 from '../../assets/male1.png';
import male2 from '../../assets/male2.jpg';
import female1 from '../../assets/female1.jpg';
import female2 from '../../assets/female2.jpg';

/**
 * AuthenticatedAppLayout
 * 
 * A structural wrapper for all protected routes.
 * Provides a persistent sidebar for navigation and a main content area.
 * Follows the composition pattern using React Router's Outlet.
 */
import { useAuth } from '../../context/AuthContext';

const AuthenticatedAppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, updateTheme, loading: isProfileLoading } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isOnChatPage = location.pathname === '/chat';
    const isOnSetupPage = location.pathname === '/setup';

    useEffect(() => {
        if (!isProfileLoading && user) {
            // Apply theme immediately
            const currentTheme = user.theme || localStorage.getItem('theme') || 'light';
            document.documentElement.classList.toggle('dark', currentTheme === 'dark');

            // Onboarding Check
            if (!isOnSetupPage && (!user.avatar || !user.nutritionProfile)) {
                navigate('/setup');
            }
        }
    }, [user, isProfileLoading, navigate, isOnSetupPage]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleTheme = async () => {
        const newTheme = user?.theme === 'light' ? 'dark' : 'light';

        // Optimistic UI update
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        localStorage.setItem('theme', newTheme);

        await updateTheme(newTheme);
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, isImplemented: true },
        { name: 'Workout Library', path: '/workout-library', icon: Library, isImplemented: true },
        { name: 'Exercises', path: '/exercises', icon: Dumbbell, isImplemented: true },

        { name: 'Workout Logs', path: '/workout-logging', icon: ClipboardList, isImplemented: true },
        { name: 'Progress', path: '/progress', icon: TrendingUp, isImplemented: true },
        { name: 'Reviews', path: '/reviews', icon: Star, isImplemented: true },
        { name: 'Profile', path: '/profile', icon: User, isImplemented: true },
        { name: 'Chat', path: '/chat', icon: MessageSquare, isImplemented: true },
    ];

    return (
        <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white font-sans selection:bg-orange-500/30 overflow-hidden text-sm md:text-base">
            {/* Sidebar */}
            <aside
                className={`
                    ${isCollapsed ? 'w-20' : 'w-64'} 
                    border-r border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 flex flex-col h-full z-40 overflow-x-hidden transition-all duration-300 ease-in-out shadow-sm
                `}
            >
                {/* Branding & Toggle */}
                <div className={`p-6 mb-2 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 bg-orange-500/5 rounded-xl flex items-center justify-center border border-orange-500/10 shadow-sm group-hover:bg-orange-500 transition-all duration-300">
                                <Activity className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-black dark:text-white group-hover:text-orange-500 transition-colors">
                                AI-Fitness
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
                            p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white transition-all
                            ${isCollapsed ? 'w-10 h-10 flex items-center justify-center' : ''}
                        `}
                    >
                        {isCollapsed ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                {/* User Avatar Section */}
                {!isCollapsed && user && (
                    <div className="px-6 mb-6">
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar.includes('male_1') ? male1 : user.avatar.includes('male_2') ? male2 : user.avatar.includes('female_1') ? female1 : female2}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                                        <User className="w-5 h-5 text-neutral-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-black dark:text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest truncate">{user.goal?.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Section */}
                <nav
                    className={`flex-1 py-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide ${isCollapsed ? 'px-0' : 'px-4'}`}
                >
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                                ${isActive
                                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500 border border-orange-100 dark:border-orange-500/20 shadow-sm font-semibold'
                                    : 'text-neutral-500 hover:text-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-500/5 border border-transparent'}
                                ${isCollapsed ? 'justify-center px-0' : ''}
                            `}
                        >
                            <item.icon className={`
                                w-5 h-5 transition-transform duration-300 
                                group-hover:scale-110
                                ${isCollapsed ? 'w-6 h-6' : ''}
                            `} />
                            {!isCollapsed && <span className="font-medium flex-1 truncate">{item.name}</span>}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-white dark:bg-black text-black dark:text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-neutral-100 dark:border-neutral-800">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 shrink-0 space-y-2">
                    <button
                        onClick={toggleTheme}
                        className={`
                            flex items-center gap-3 w-full px-4 py-3 rounded-xl text-neutral-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all duration-200 group
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        {user?.theme === 'dark' ? <Zap className="w-5 h-5 text-orange-500" /> : <Activity className="w-5 h-5" />}
                        {!isCollapsed && (
                            <div className="flex-1 flex justify-between items-center">
                                <span className="font-medium">Dark Mode</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${user?.theme === 'dark' ? 'bg-orange-500' : 'bg-neutral-200'}`}>
                                    <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${user?.theme === 'dark' ? 'right-1' : 'left-1'}`} />
                                </div>
                            </div>
                        )}
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 w-full px-4 py-3 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 group
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        <LogOut className={`w-5 h-5 group-hover:-translate-x-1 transition-transform ${isCollapsed ? 'w-6 h-6' : ''}`} />
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950 relative">
                <div className="max-w-7xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Outlet />
                </div>

                {/* Floating AI Chat Button — hidden on /chat page */}
                {!isOnChatPage && (
                    <button
                        onClick={() => navigate('/chat')}
                        title="Open AI Coach"
                        className="fixed bottom-7 right-7 z-50 group"
                    >
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full bg-orange-500 opacity-30 animate-ping" />
                        {/* Button */}
                        <span className="relative flex items-center justify-center w-14 h-14 bg-black dark:bg-orange-500 hover:bg-orange-600 rounded-full shadow-2xl shadow-black/30 transition-all duration-300 group-hover:scale-110">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </span>
                        {/* Tooltip */}
                        <span className="absolute bottom-full right-0 mb-3 whitespace-nowrap bg-black dark:bg-neutral-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            AI Coach
                        </span>
                    </button>
                )}
            </main>
        </div>
    );
};


export default AuthenticatedAppLayout;
