import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
    Menu
} from 'lucide-react';

/**
 * AuthenticatedAppLayout
 * 
 * A structural wrapper for all protected routes.
 * Provides a persistent sidebar for navigation and a main content area.
 * Follows the composition pattern using React Router's Outlet.
 */
const AuthenticatedAppLayout = () => {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        // Pure SPA navigation, no reload
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, isImplemented: true },
        { name: 'Workout Library', path: '/workout-library', icon: Library, isImplemented: true },
        { name: 'Exercises', path: '/exercises', icon: Dumbbell, isImplemented: false },

        { name: 'Workout Logs', path: '/workout-logging', icon: ClipboardList, isImplemented: true },
        { name: 'Progress', path: '/progress', icon: TrendingUp, isImplemented: true },
        { name: 'Profile', path: '/profile', icon: User, isImplemented: false },
        { name: 'Chat', path: '/chat', icon: MessageSquare, isImplemented: false },
    ];

    return (
        <div className="flex h-screen bg-neutral-50 text-black font-sans selection:bg-orange-500/30 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`
                    ${isCollapsed ? 'w-20' : 'w-64'} 
                    border-r border-neutral-200 bg-white flex flex-col h-full z-40 overflow-x-hidden transition-all duration-300 ease-in-out shadow-sm
                `}
            >
                {/* Branding & Toggle */}
                <div className={`p-6 mb-2 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 bg-orange-500/5 rounded-xl flex items-center justify-center border border-orange-500/10 shadow-sm group-hover:bg-orange-500 transition-all duration-300">
                                <Activity className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-black group-hover:text-orange-500 transition-colors">
                                AI-Fitness
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`
                            p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-black transition-all
                            ${isCollapsed ? 'w-10 h-10 flex items-center justify-center' : ''}
                        `}
                    >
                        {isCollapsed ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation Section */}
                <nav
                    className={`flex-1 py-2 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide ${isCollapsed ? 'px-0' : 'px-4'}`}
                >
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={(e) => {
                                if (!item.isImplemented) {
                                    e.preventDefault();
                                }
                            }}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                                ${!item.isImplemented ? 'opacity-40 cursor-not-allowed' : ''}
                                ${isActive && item.isImplemented
                                    ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm font-semibold'
                                    : 'text-neutral-500 hover:text-orange-500 hover:bg-orange-50/50 border border-transparent'}
                                ${isCollapsed ? 'justify-center px-0' : ''}
                            `}
                        >
                            <item.icon className={`
                                w-5 h-5 transition-transform duration-300 
                                ${item.isImplemented ? 'group-hover:scale-110' : ''}
                                ${isCollapsed ? 'w-6 h-6' : ''}
                            `} />
                            {!isCollapsed && <span className="font-medium flex-1 truncate">{item.name}</span>}
                            {!isCollapsed && !item.isImplemented && (
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded">
                                    Soon
                                </span>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-xs font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.name} {!item.isImplemented && '(Soon)'}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-neutral-100 shrink-0">
                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 w-full px-4 py-3 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                    >
                        <LogOut className={`w-5 h-5 group-hover:-translate-x-1 transition-transform ${isCollapsed ? 'w-6 h-6' : ''}`} />
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-neutral-50">
                <div className="max-w-7xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};


export default AuthenticatedAppLayout;
