import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Dumbbell, Loader2, Info, Plus } from 'lucide-react';
import ExerciseImage from '../common/ExerciseImage';



const ExerciseSearchModal = ({ isOpen, onClose, onSelectExercise }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await api.get('/exercises', {
                params: { search: query, limit: 10 }
            });
            setSearchResults(res.data.exercises || []);
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => handleSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-4xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
                    >
                        <div className="p-8 flex flex-col h-150">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight flex items-center gap-3">
                                    <Search className="w-6 h-6 text-orange-500" />
                                    Quick Add Exercise
                                </h3>
                                <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-neutral-400" />
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search exercises (e.g., Bench Press, Squat)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl focus:border-orange-500 outline-none font-bold text-lg text-black dark:text-white shadow-inner"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {isSearching ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Scanning Database</p>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <div className="space-y-3">
                                        {searchResults.map((ex) => (
                                            <button
                                                key={ex.id || ex._id}
                                                onClick={() => onSelectExercise(ex)}
                                                className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-700 rounded-2xl hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-500/10 transition-all group active:scale-[0.98] overflow-hidden"
                                            >
                                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                                    {ex.image ? (
                                                        <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-700">
                                                            <ExerciseImage
                                                                src={ex.image}
                                                                alt={ex.name}
                                                                variant="thumbnail"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 flex-shrink-0 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center group-hover:bg-white dark:group-hover:bg-neutral-900 transition-colors border border-neutral-100 dark:border-neutral-700">
                                                            <Dumbbell className="w-6 h-6 text-orange-500" />
                                                        </div>
                                                    )}
                                                    <div className="text-left min-w-0 flex-1">
                                                        <h4 className="font-black text-black dark:text-white uppercase text-sm tracking-tight line-clamp-1">{ex.name}</h4>
                                                        <div className="flex gap-2 mt-1 flex-wrap">
                                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">{ex.muscleGroup}</span>
                                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">{ex.difficulty}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Plus className="w-6 h-6 text-neutral-300 group-hover:text-orange-500 flex-shrink-0 ml-4" />
                                            </button>
                                        ))}
                                    </div>
                                ) : searchQuery.length > 2 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                                        <p className="text-black dark:text-white font-black uppercase">No results found</p>
                                        <p className="text-neutral-400 text-sm font-medium">Try a different search term or check spelling.</p>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                                        <Info className="w-10 h-10 text-neutral-200 mx-auto" />
                                        <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Type to see elite exercises</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ExerciseSearchModal;
