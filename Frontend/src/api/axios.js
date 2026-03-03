import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('[API] Unauthorized access - 401');
        } else if (error.code === 'ECONNABORTED') {
            window.dispatchEvent(new CustomEvent('app-error', { detail: 'Request timed out. Please check your connection.' }));
        } else if (!error.response) {
            window.dispatchEvent(new CustomEvent('app-error', { detail: 'Network error. Backend might be down.' }));
        } else if (error.response.status >= 500) {
            window.dispatchEvent(new CustomEvent('app-error', { detail: 'Server error. Please try again later.' }));
        }

        return Promise.reject(error);
    }
);

export default api;
