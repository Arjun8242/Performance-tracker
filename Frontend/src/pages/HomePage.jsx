import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Dumbbell, Star, User, Target, Zap,
    ClipboardList, Smile, Cpu
} from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();
    const [isReadyToRotate, setIsReadyToRotate] = useState(false);

    const features = [
        { text: "Fun & Easy", icon: Star },
        { text: "Personalized", icon: User },
        { text: "Set Goals", icon: Target },
        { text: "Track Progress", icon: Zap },
        { text: "Plan Workouts", icon: ClipboardList },
        { text: "Stay Motivated", icon: Smile },
        { text: "AI Powered", icon: Cpu }
    ];


    return (
        <div className="fixed inset-0 min-h-screen max-h-screen bg-white text-black flex flex-col items-center justify-center overflow-hidden font-['Poppins']">
            {/* Background Static Elements for Depth */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] border-[40px] border-black rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] border-[60px] border-black rounded-full" />
            </div>

            {/* Main Perspective Container */}
            <div className="relative flex items-center justify-center w-[min(90vw,800px)] h-[min(90vw,800px)] lg:w-[800px] lg:h-[800px] transform scale-75 sm:scale-90 lg:scale-100">

                {/* Central Hub */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{
                        scale: 1.1,
                        backgroundColor:'#F97316',
                        boxShadow: "0_25px_80px_rgba(0,0,0,0.25)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.8, ease: "backOut" }}
                    onClick={() => navigate('/login')}
                    className="relative z-30 w-32 h-32 rounded-full bg-black 
                            shadow-[0_20px_60px_rgba(0,0,0,0.15)] 
                            flex items-center justify-center 
                            border-4 border-slate-100 
                            cursor-pointer select-none"
                >
                    <Dumbbell className="w-14 h-14 text-white" />
                </motion.div>


                {/* The Orbiting System */}
                <motion.div
                    animate={isReadyToRotate ? { rotate: 360 } : {}}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    {features.map((feature, index) => (
                        <OrbitingPill
                            key={index}
                            index={index}
                            total={features.length}
                            feature={feature}
                            onArrival={() => index === features.length - 1 && setIsReadyToRotate(true)}
                            isRotating={isReadyToRotate}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

const OrbitingPill = ({ index, total, feature, onArrival, isRotating }) => {
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

export default HomePage;
