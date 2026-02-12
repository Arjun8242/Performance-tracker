import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

const PlanBuilderEmptyState = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center space-y-4 bg-neutral-100/50 rounded-[3rem] border-2 border-dashed border-neutral-200"
        >
            <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto">
                <ClipboardList className="w-8 h-8 text-neutral-400" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-black">No days added yet</h3>
                <p className="text-neutral-500">Click "Add Workout Day" to start building your routine.</p>
            </div>
        </motion.div>
    );
};

export default PlanBuilderEmptyState;
