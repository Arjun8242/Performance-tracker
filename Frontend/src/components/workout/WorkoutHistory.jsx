import React from 'react';
import {
    Calendar, Trophy, Loader2, ChevronRight, ChevronLeft, Notebook
} from 'lucide-react';

const WorkoutHistory = ({
    logs,
    pagination,
    filters,
    isLoading,
    fetchLogs,
    onFilterChange,
    onClearFilters
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filters */}
            <div className="bg-white rounded-[2rem] border border-neutral-100 p-8 shadow-sm flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px] space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 ml-1">From Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => onFilterChange({ from: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 min-w-[200px] space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-black text-neutral-400 ml-1">To Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => onFilterChange({ to: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <button
                    onClick={onClearFilters}
                    className="h-[46px] px-6 text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-black border border-neutral-200 rounded-xl transition-all"
                >
                    Clear
                </button>
            </div>

            {/* Logs List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                    <p className="text-neutral-500 font-bold animate-pulse">Fetching your gains...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-neutral-200 rounded-[3rem] p-24 text-center">
                    <Trophy className="w-16 h-16 text-neutral-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">No history recorded yet</h3>
                    <p className="text-neutral-500 max-w-sm mx-auto">Start your first session today and track your progress over time.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {logs.map((log) => (
                        <div
                            key={log._id}
                            className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform">
                                        <Calendar className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xl font-black text-black uppercase tracking-tight">
                                                {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                            </h4>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${log.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-neutral-50 text-neutral-500 border border-neutral-200'}`}>
                                                {log.status}
                                            </span>
                                        </div>
                                        <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                            {log.workoutId?.name ? `${log.workoutId.name} • ${log.workoutId.day}` : `Manual Log • ${new Date(log.createdAt).toLocaleTimeString()}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Exercises</p>
                                    <p className="text-xl font-black text-black">{log.performedExercises?.length || 0}</p>
                                </div>
                            </div>

                            {log.performedExercises?.length > 0 && (
                                <div className="space-y-3 bg-neutral-50/50 p-6 rounded-[2rem] border border-neutral-100">
                                    {log.performedExercises.map((ex, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                                            <span className="font-bold text-sm text-neutral-900">{ex.exerciseId?.name || ex.name || 'Exercise'}</span>
                                            <div className="flex flex-col gap-1 items-end">
                                                {ex.sets.map((set, si) => (
                                                    <div key={si} className="flex gap-3 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                        <span>Set {si + 1}:</span>
                                                        <span><span className="text-black">{set.reps}</span> Reps</span>
                                                        <span className="text-orange-500"><span className="text-black">{set.weight}</span> KG</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {log.notes && (
                                <div className="mt-6 flex gap-3 text-neutral-500">
                                    <Notebook className="w-4 h-4 flex-shrink-0 mt-0.5 text-neutral-400" />
                                    <p className="text-sm font-medium italic">"{log.notes}"</p>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 py-8">
                            <button
                                onClick={() => fetchLogs(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="p-3 bg-white border border-neutral-200 rounded-xl hover:border-orange-500 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm font-black text-black">Page {pagination.page} / {pagination.totalPages}</span>
                            <button
                                onClick={() => fetchLogs(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="p-3 bg-white border border-neutral-200 rounded-xl hover:border-orange-500 disabled:opacity-30 transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkoutHistory;
