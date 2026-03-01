import React from 'react';
import { X, ArrowUpRight, ArrowDownRight, Plus, Info } from 'lucide-react';

const AdjustmentPreview = ({ data, onCancel }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">            <div className="bg-white dark:bg-neutral-900 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight">Coach <span className="text-orange-500">Suggestions</span></h2>
                        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Recommendations based on your performance</p>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-neutral-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Summary */}
                    <div className="bg-orange-50 p-6 rounded-4xl border border-orange-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-orange-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Coach Insight</p>
                        </div>
                        <p className="text-neutral-800 font-medium leading-relaxed">{data?.summary}</p>
                    </div>

                    {/* Modification List */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-4">Optimization Tips</p>
                        {(data?.modifications ?? []).map((mod, idx) => (<div key={idx} className="bg-neutral-50 p-6 rounded-4xl border border-neutral-100 hover:border-orange-200 transition-colors group">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${mod.type.includes('increase') || mod.type.includes('add')
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {mod.type.replace('_', ' ')}
                                        </span>
                                        <span className="text-neutral-300">•</span>
                                        <span className="text-xs font-bold text-black dark:text-white uppercase tracking-tight">{mod.muscle}</span>
                                    </div>
                                    <p className="text-sm text-neutral-600 leading-relaxed font-medium">{mod.reason}</p>
                                </div>
                                <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-sm">
                                    {mod.type === 'increase_volume' && <ArrowUpRight className="w-5 h-5 text-green-500" />}
                                    {mod.type === 'reduce_volume' && <ArrowDownRight className="w-5 h-5 text-red-500" />}
                                    {mod.type === 'add_exercise' && <Plus className="w-5 h-5 text-green-500" />}
                                    {mod.type === 'remove_exercise' && <X className="w-5 h-5 text-red-500" />}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-neutral-100 flex gap-4 bg-neutral-50/50">
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-black text-white rounded-2xl py-4 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-orange-600 transition-all duration-300"
                    >
                        Got it, Coach
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustmentPreview;
