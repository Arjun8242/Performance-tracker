import React from 'react';

const LibraryBadge = ({ count }) => (
    <div className="px-3 py-1 bg-neutral-100 rounded-full text-neutral-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-neutral-200/50">
        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
        {count} Exercises Available
    </div>
);

export default LibraryBadge;
