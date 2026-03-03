import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const GlobalErrorContext = createContext(null);

export const useGlobalError = () => {
    const context = useContext(GlobalErrorContext);
    if (!context) {
        throw new Error('useGlobalError must be used within a GlobalErrorProvider');
    }
    return context;
};

export const GlobalErrorProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);

    // 🔹 Remove message FIRST (so no temporal dead zone)
    const removeMessage = useCallback((id) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
    }, []);

    // 🔹 Add message depends on removeMessage
    const addMessage = useCallback(
        (message, type = 'error', duration = 5000) => {
            const id = crypto.randomUUID();

            setMessages((prev) => [...prev, { id, message, type }]);

            if (duration) {
                setTimeout(() => {
                    removeMessage(id);
                }, duration);
            }
        },
        [removeMessage]
    );

    const showError = useCallback(
        (message) => addMessage(message, 'error'),
        [addMessage]
    );

    const showSuccess = useCallback(
        (message) => addMessage(message, 'success'),
        [addMessage]
    );

    const showInfo = useCallback(
        (message) => addMessage(message, 'info'),
        [addMessage]
    );

    // 🔹 Global event listener
    useEffect(() => {
        const handleError = (e) => showError(e.detail);
        window.addEventListener('app-error', handleError);
        return () => window.removeEventListener('app-error', handleError);
    }, [showError]);

    return (
        <GlobalErrorContext.Provider
            value={{ showError, showSuccess, showInfo }}
        >
            {children}

            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full sm:w-auto">
                <AnimatePresence>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{
                                opacity: 0,
                                scale: 0.9,
                                transition: { duration: 0.2 },
                            }}
                            className={`
                                pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md
                                ${
                                    m.type === 'error'
                                        ? 'bg-white/90 border-red-100 text-red-800'
                                        : ''
                                }
                                ${
                                    m.type === 'success'
                                        ? 'bg-white/90 border-emerald-100 text-emerald-800'
                                        : ''
                                }
                                ${
                                    m.type === 'info'
                                        ? 'bg-white/90 border-blue-100 text-blue-800'
                                        : ''
                                }
                            `}
                        >
                            <div className="mt-0.5">
                                {m.type === 'error' && (
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                )}
                                {m.type === 'success' && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                )}
                                {m.type === 'info' && (
                                    <Info className="w-5 h-5 text-blue-500" />
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-bold uppercase tracking-tight leading-snug">
                                    {m.type === 'error'
                                        ? 'Error Detected'
                                        : m.type === 'success'
                                        ? 'Success'
                                        : 'Information'}
                                </p>
                                <p className="text-xs font-medium opacity-80 mt-0.5">
                                    {m.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeMessage(m.id)}
                                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </GlobalErrorContext.Provider>
    );
};