import React from 'react';
import { motion } from 'framer-motion';

const OrbitingPill = ({ index, total, feature, onArrival }) => {
    const angle = (index / total) * (2 * Math.PI);
    // Radius for the center of the capsule
    const radius = Math.min(260, window.innerWidth * 0.3);


    const finalX = Math.cos(angle) * radius;
    const finalY = Math.sin(angle) * radius;

    // Initial coordinates (slide in from outside)
    const initialX = Math.cos(angle) * 1200;
    const initialY = Math.sin(angle) * 1200;

    // Rotation for radial alignment (pointing to center)
    // We add 90 degrees because the rectangle is naturally tall
    const rotationDeg = (angle * 180) / Math.PI + 90;

    return (
        <motion.div
            initial={{ x: initialX, y: initialY, opacity: 0 }}
            animate={{ x: finalX, y: finalY, opacity: 1 }}
            transition={{
                delay: index * 0.1,
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1]
            }}
            onAnimationComplete={onArrival}
            className="absolute flex items-center justify-center"
        >
            <div
                style={{ transform: `rotate(${rotationDeg}deg)` }}
                className="z-20"
            >
                <div className="bg-white border-2 border-black w-12 h-48 rounded-full
                    flex flex-col items-center justify-center
                    shadow-[0_10px_40px_rgba(0,0,0,0.1)]">

                    {/* In the screenshot, text flows along the capsule or is placed at ends */}
                    {/* We'll use vertical layout as shown in the spoke orientation */}
                    <div className="flex flex-col items-center gap-6">
                        <feature.icon className="w-6 h-6 text-black" />
                        <span
                            className="text-[14px] font-black uppercase tracking-tighter text-black"
                            style={{
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                            }}
                        >
                            {feature.text}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default OrbitingPill;
