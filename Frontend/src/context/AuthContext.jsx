import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const interceptorId = useRef(null);

    // Setup 401 interceptor — auto-logout on expired/invalid session
    useEffect(() => {
        interceptorId.current = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401 && isAuthenticated) {
                    console.warn('[Auth] Session expired — logging out');
                    setUser(null);
                    setIsAuthenticated(false);
                }
                return Promise.reject(error);
            }
        );
        return () => {
            if (interceptorId.current !== null) {
                axios.interceptors.response.eject(interceptorId.current);
            }
        };
    }, [isAuthenticated]);

    const checkAuthStatus = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/users/profile`, {
                withCredentials: true
            });
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

    const login = async (email, password) => {
        const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }, {
            withCredentials: true
        });
        if (res.data?.user) {
            setUser(res.data.user);
            setIsAuthenticated(true);
        }
        return res.data;
    };

    const verify = async (email, otp) => {
        const res = await axios.post(`${API_BASE_URL}/auth/verify`, { email, otp }, {
            withCredentials: true
        });
        if (res.data?.user) {
            setUser(res.data.user);
            setIsAuthenticated(true);
        }
        return res.data;
    };

    const logout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
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
            await axios.put(`${API_BASE_URL}/users/theme`, { theme: newTheme }, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Failed to update theme:', error);
            // Rollback on failure
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
