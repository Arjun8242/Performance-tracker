import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

function getMuscleColor(volume) {
    if (volume <= 3) return '#ef4444';
    if (volume <= 8) return '#facc15';
    return '#22c55e';
}

function getMuscleLabel(volume) {
    if (volume <= 3) return 'Undertrained';
    if (volume <= 8) return 'Moderate';
    return 'Well Trained';
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ─── SVG BODY PATHS ────────────────────────────────────────── */

const FRONT_MUSCLES = {
    chest: (
        <path
            d="
                M72 82
                Q85 70 100 72
                Q115 70 128 82
                Q122 105 100 108
                Q78 105 72 82
                "
            strokeWidth="1.5"
            stroke="#555"
        />
    ),
    shoulders: (
        <>
            <path d="M58,68 Q52,60 50,72 Q50,84 58,88 L72,82 L72,74 Z" strokeWidth="1.5" stroke="#555" />
            <path d="M142,68 Q148,60 150,72 Q150,84 142,88 L128,82 L128,74 Z" strokeWidth="1.5" stroke="#555" />
        </>
    ),
    biceps: (
        <>
            <path d="M48,90 Q42,100 42,116 Q42,128 48,132 L58,128 Q60,114 58,98 Z" strokeWidth="1.5" stroke="#555" />
            <path d="M152,90 Q158,100 158,116 Q158,128 152,132 L142,128 Q140,114 142,98 Z" strokeWidth="1.5" stroke="#555" />
        </>
    ),
    core: (
        <path
            d="M78,110 Q80,108 100,108 Q120,108 122,110 L122,155 Q115,162 100,162 Q85,162 78,155 Z"
            strokeWidth="1.5"
            stroke="#555"
        />
    ),
    legs: (
        <>
            <path d="M78,164 Q74,170 72,195 Q70,225 68,260 L78,262 Q82,230 84,200 Q88,175 90,164 Z" strokeWidth="1.5" stroke="#555" />
            <path d="M122,164 Q126,170 128,195 Q130,225 132,260 L122,262 Q118,230 116,200 Q112,175 110,164 Z" strokeWidth="1.5" stroke="#555" />
        </>
    ),
};

const BACK_MUSCLES = {
    back: (
        <path
            d="M72,74 Q80,68 100,68 Q120,68 128,74 L128,140 Q120,150 100,150 Q80,150 72,140 Z"
            strokeWidth="1.5"
            stroke="#555"
        />
    ),
    triceps: (
        <>
            <path d="M48,86 Q42,96 42,116 Q42,130 48,134 L58,130 Q60,114 58,94 Z" strokeWidth="1.5" stroke="#555" />
            <path d="M152,86 Q158,96 158,116 Q158,130 152,134 L142,130 Q140,114 142,94 Z" strokeWidth="1.5" stroke="#555" />
        </>
    ),
    shoulders: (
        <>
            <path d="M58,64 Q52,56 50,68 Q50,82 58,86 L72,78 L72,70 Z" strokeWidth="1.5" stroke="#555" />
            <path d="M142,64 Q148,56 150,68 Q150,82 142,86 L128,78 L128,70 Z" strokeWidth="1.5" stroke="#555" />
        </>
    ),
    legs: (
        <>
            <path d="M78,158 Q74,168 72,195 Q70,225 68,260 L78,262 Q82,230 84,200 Q88,175 90,158 Z" strokeWidth="1.5" stroke="#555" />
            <path d="M122,158 Q126,168 128,195 Q130,225 132,260 L122,262 Q118,230 116,200 Q112,175 110,158 Z" strokeWidth="1.5" stroke="#555" />
        </>
    ),
};

/* Body outline for context (head, neck, arms outline, torso outline, legs outline) */
const BodyOutline = () => (
  <g stroke="#2a2a2a" strokeWidth="1.2" fill="none" opacity="0.45">
    
    {/* Head */}
    <ellipse cx="100" cy="36" rx="20" ry="24" />

    {/* Neck */}
    <path d="M90 58 Q100 62 110 58" />

    {/* Torso */}
    <path d="
      M70 70
      Q60 75 50 90
      Q45 110 48 140
      Q52 160 70 170
      Q85 178 100 178
      Q115 178 130 170
      Q148 160 152 140
      Q155 110 150 90
      Q140 75 130 70
    "/>

    {/* Arms */}
    <path d="M50 90 Q38 110 40 150 Q45 175 60 180" />
    <path d="M150 90 Q162 110 160 150 Q155 175 140 180" />

    {/* Legs */}
    <path d="M78 178 Q70 210 68 240 Q66 265 75 280" />
    <path d="M122 178 Q130 210 132 240 Q134 265 125 280" />

  </g>
);

/* ─── TOOLTIP ───────────────────────────────────────────────── */

const Tooltip = ({ data, position }) => {
    if (!data) return null;
    return (
        <div
            className="pointer-events-none absolute z-50 bg-neutral-900 text-white text-xs rounded-xl px-4 py-3 shadow-xl border border-neutral-700 min-w-40"
            style={{ left: position.x, top: position.y }}
        >
            <p className="font-bold text-sm mb-1.5">{capitalize(data.muscle)}</p>
            <div className="space-y-0.5 text-neutral-300">
                <p>Exercises: <span className="text-white font-semibold">{data.totalExercises}</span></p>
                <p>Sets: <span className="text-white font-semibold">{data.totalSets}</span></p>
                <p>Last trained: <span className="text-white font-semibold">{data.lastTrained ? capitalize(data.lastTrained) : '—'}</span></p>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getMuscleColor(data.totalSets) }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{getMuscleLabel(data.totalSets)}</span>
            </div>
        </div>
    );
};

/* ─── BODY SVG ──────────────────────────────────────────────── */

const BodySVG = ({ muscles, volume, onHover, onLeave }) => (
    <svg viewBox="25 10 150 275" className="w-full h-full max-h-100">
        <BodyOutline />
        {Object.entries(muscles).map(([muscle, pathEl]) => (
            <g
            key={muscle}
            style={{
                fill: getMuscleColor(volume[muscle] || 0),
                filter: `drop-shadow(0 0 6px ${getMuscleColor(volume[muscle] || 0)})`
            }}
                fillOpacity="0.75"
                className="cursor-pointer transition-all duration-300 hover:scale-105 hover:fill-opacity-100"
                onMouseEnter={(e) => onHover(muscle, e)}
                onMouseLeave={onLeave}
            >
                {pathEl}
            </g>
        ))}
    </svg>
);

/* ─── LEGEND ────────────────────────────────────────────────── */

const Legend = () => {
    const items = [
        { color: '#ef4444', label: '0–3 sets', desc: 'Undertrained' },
        { color: '#facc15', label: '4–8 sets', desc: 'Moderate' },
        { color: '#22c55e', label: '9+ sets', desc: 'Well Trained' },
    ];
    return (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
            {items.map((item) => (
                <div key={item.color} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ─── MAIN COMPONENT ────────────────────────────────────────── */

const MuscleHeatmap = () => {
    const [volume, setVolume] = useState({});
    const [details, setDetails] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('front'); // 'front' | 'back'
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [tooltip, setTooltip] = useState(null);

    const fetchMuscleVolume = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await api.get('/progress/muscle-volume');
            setVolume(res.data.volume || {});
            setDetails(res.data.details || {});
        } catch (err) {
            console.error('Error fetching muscle volume:', err);
            setError('Failed to load muscle data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMuscleVolume();
    }, [fetchMuscleVolume]);

    const handleHover = (muscle, e) => {
        const containerRect = e.currentTarget.closest('.muscle-heatmap-container').getBoundingClientRect();
        const svgX = e.clientX - containerRect.left;
        const svgY = e.clientY - containerRect.top;

        setTooltip({
            muscle,
            totalSets: details[muscle]?.totalSets || 0,
            totalExercises: details[muscle]?.totalExercises || 0,
            lastTrained: details[muscle]?.lastTrained || null,
            position: { x: svgX + 16, y: svgY - 10 },
        });
    };

    const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 30;
    const rotateX = -((y / rect.height) - 0.5) * 30;

    setRotation({ x: rotateX, y: rotateY });
    };

    const resetRotation = () => {
    setRotation({ x: 0, y: 0 });
    };

    const handleLeave = () => setTooltip(null);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 transition-colors">
                <div className="animate-pulse space-y-4">
                    <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                    <div className="h-64 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 transition-colors">
                <p className="text-red-500 text-sm font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">
                        Weekly Muscle Map
                    </p>
                    <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">
                        Training Heatmap
                    </h3>
                </div>
                {/* Front / Back toggle */}
                <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                    <button
                        onClick={() => setView('front')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            view === 'front'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'text-neutral-500 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        Front
                    </button>
                    <button
                        onClick={() => setView('back')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            view === 'back'
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'text-neutral-500 hover:text-black dark:hover:text-white'
                        }`}
                    >
                        Back
                    </button>
                </div>
            </div>

            {/* Body visualization */}
            <div
                className="muscle-heatmap-container relative flex justify-center"
                style={{ perspective: '900px' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                    resetRotation();
                    setTooltip(null);
                }}
            >
                <div
                    className="w-full max-w-65 transition-transform duration-300 ease-out"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: `
                            rotateX(${rotation.x}deg)
                            rotateY(${view === 'back' ? 180 + rotation.y : rotation.y}deg)
                        `,
                    }}
                >
                    {/* Front face */}
                    <div style={{ backfaceVisibility: 'hidden' }}>
                        <BodySVG
                            muscles={FRONT_MUSCLES}
                            volume={volume}
                            onHover={handleHover}
                            onLeave={handleLeave}
                        />
                    </div>

                    {/* Back face — rotated 180° so it appears correctly when container flips */}
                    <div
                        className="absolute inset-0"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <BodySVG
                            muscles={BACK_MUSCLES}
                            volume={volume}
                            onHover={handleHover}
                            onLeave={handleLeave}
                        />
                    </div>
                </div>

                {/* Tooltip */}
                {tooltip && <Tooltip data={tooltip} position={tooltip.position} />}
            </div>

            {/* Muscle group pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
                {(view === 'front'
                    ? ['chest', 'shoulders', 'biceps', 'core', 'legs']
                    : ['back', 'triceps', 'shoulders', 'legs']
                ).map((muscle) => (
                    <span
                        key={muscle}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                    >
                        <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getMuscleColor(volume[muscle] || 0) }}
                        />
                        {muscle} — {volume[muscle] || 0} sets
                    </span>
                ))}
            </div>

            {/* Legend */}
            <Legend />
        </div>
    );
};

export default MuscleHeatmap;
