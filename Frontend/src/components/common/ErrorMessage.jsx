import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ error, onClose }) => {
    return (
        <AnimatePresence>
            {error && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700 font-medium mb-8"
                >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                    <button onClick={onClose} className="ml-auto p-1 hover:bg-red-100 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ErrorMessage;
