import React from 'react';
import { Search } from 'lucide-react';

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core'];
const EQUIPMENTS = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const LibraryFilters = ({
    searchTerm,
    setSearchTerm,
    filters,
    onFilterChange
}) => {
    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-wrap gap-4 items-end">
            {/* Search */}
            <div className="flex-1 min-w-60 space-y-2">
                <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider ml-1">Search</label>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Muscle Group */}
            <div className="w-full sm:w-auto min-w-40 space-y-2">
                <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider ml-1">Muscle Group</label>
                <select
                    name="muscleGroup"
                    value={filters.muscleGroup}
                    onChange={onFilterChange}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium appearance-none cursor-pointer"
                >
                    <option value="">All Muscles</option>
                    {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                </select>
            </div>

            {/* Equipment */}
            <div className="w-full sm:w-auto min-w-40 space-y-2">
                <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider ml-1">Equipment</label>
                <select
                    name="equipment"
                    value={filters.equipment}
                    onChange={onFilterChange}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium appearance-none cursor-pointer"
                >
                    <option value="">All Equipment</option>
                    {EQUIPMENTS.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                </select>
            </div>

            {/* Difficulty */}
            <div className="w-full sm:w-auto min-w-40 space-y-2">
                <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider ml-1">Difficulty</label>
                <select
                    name="difficulty"
                    value={filters.difficulty}
                    onChange={onFilterChange}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium appearance-none cursor-pointer"
                >
                    <option value="">All Levels</option>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
            </div>
        </div>
    );
};

export default LibraryFilters;
