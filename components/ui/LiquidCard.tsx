import React from 'react';
import LiquidGlass from 'liquid-glass-react'; // @ts-ignore
import { motion } from 'framer-motion';

interface LiquidCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    delay?: number;
}

const LiquidCard: React.FC<LiquidCardProps> = ({ children, className = '', onClick, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: delay, ease: [0.22, 1, 0.36, 1] }}
            className={`relative ${className}`}
            onClick={onClick}
        >
            <LiquidGlass
                displacementScale={64}
                blurAmount={0.1}
                saturation={130}
                aberrationIntensity={2}
                elasticity={0.35}
                cornerRadius={32} /* slightly adjusted for standard UI cards */
                padding="0px"
                onClick={onClick}
                style={{ height: '100%', width: '100%' }}
            >
                <div className="h-full w-full">
                    {children}
                </div>
            </LiquidGlass>
        </motion.div>
    );
};

export default LiquidCard;
