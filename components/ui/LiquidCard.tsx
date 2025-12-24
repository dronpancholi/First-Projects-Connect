import React from 'react';
import LiquidGlass from './LiquidGlass.tsx';
import { motion } from 'framer-motion';

interface LiquidCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    delay?: number;
}

const LiquidCard: React.FC<LiquidCardProps> = ({ children, className = '', onClick, delay = 0 }) => {
    return (
        <div
            className={`relative ${className}`}
            onClick={onClick}
        >
            <LiquidGlass
                displacementScale={64}
                blurAmount={0.3}
                saturation={130}
                elasticity={0.35}
                cornerRadius={32}
                padding="0px"
                onClick={onClick}
                style={{ height: '100%', width: '100%' }}
            >
                <div className="h-full w-full">
                    {children}
                </div>
            </LiquidGlass>
        </div>
    );
};

export default LiquidCard;
