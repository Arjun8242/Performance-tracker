import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        try {
            const res = await api.get('/users/profile');
            setUser(res.data);
            setIsAuthenticated(true);
        } catch {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // Setup 401 interceptor for automatic logout
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && isAuthenticated) {
                    setUser(null);
                    setIsAuthenticated(false);
                }
                return Promise.reject(error);
            }
        );
        return () => api.interceptors.response.eject(interceptor);
    }, [isAuthenticated]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data?.user) {
            setUser(res.data.user);
            setIsAuthenticated(true);
        }
        return res.data;
    };

    const verify = async (email, otp) => {
        const res = await api.post('/auth/verify', { email, otp });
        if (res.data?.user) {
            setUser(res.data.user);
            setIsAuthenticated(true);
        }
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateTheme = async (newTheme) => {
        const previousTheme = user?.theme;
        setUser(prev => ({ ...prev, theme: newTheme }));
        try {
            await api.put('/users/theme', { theme: newTheme });
        } catch (error) {
            console.error('Failed to update theme:', error);
            setUser(prev => ({ ...prev, theme: previousTheme }));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loading,
            login,
            logout,
            verify,
            updateTheme,
            checkAuthStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
