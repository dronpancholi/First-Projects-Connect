import React, { useRef, useState, useEffect } from 'react';
// @ts-ignore
import * as LiquidGlassLibModule from 'liquid-glass-react';

// Robust Import handling
const LiquidGlassLib = (LiquidGlassLibModule as any).default || (LiquidGlassLibModule as any).LiquidGlass || LiquidGlassLibModule;

interface LiquidSurfaceProps {
    children: React.ReactNode;
    className?: string;
    intensity?: 'low' | 'medium' | 'high';
    radius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    onClick?: () => void;
    // Advanced Props
    distortion?: boolean;
    style?: React.CSSProperties;
}

const LiquidSurface: React.FC<LiquidSurfaceProps> = ({
    children,
    className = '',
    intensity = 'medium',
    radius = 'xl',
    onClick,
    distortion = true, // Enable by default, but component handles fallbacks
    style
}) => {
    // 1. Intensity Maps
    const blurMap = { low: 0.1, medium: 0.2, high: 0.4 };
    const displaceMap = { low: 20, medium: 40, high: 80 };
    const radiusMap = { sm: 12, md: 18, lg: 24, xl: 32, full: 100 };
    // Tailwind equivalents for fallback
    const fallbackClassMap = {
        low: 'glass-light',
        medium: 'glass-base',
        high: 'glass-heavy'
    };
    const roundedClassMap = {
        sm: 'rounded-xl',
        md: 'rounded-2xl',
        lg: 'rounded-3xl',
        xl: 'rounded-[2rem]',
        full: 'rounded-full'
    };

    // 2. Safe Rendering Logic
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 3. Render
    // If distortion is off or not mounted yet, render robust CSS glass
    if (!distortion || !isMounted) {
        return (
            <div
                ref={containerRef}
                className={`${fallbackClassMap[intensity]} ${roundedClassMap[radius]} ${className} relative overflow-hidden`}
                onClick={onClick}
                style={style}
            >
                {children}
            </div>
        );
    }

    // Render with Liquid Glass Effect
    // IMPORTANT: Wrapper div needs explicit display and dimensions handling
    return (
        <div
            className={`relative ${roundedClassMap[radius]} ${className}`}
            style={{ ...style, isolation: 'isolate', display: 'block' }} // Isolation creates stacking context
            onClick={onClick}
        >
            {/* The library component usually takes 'children' and wraps them. 
                 It needs to be the direct parent of the content. */}
            <LiquidGlassLib
                displacementScale={displaceMap[intensity]}
                blurAmount={blurMap[intensity]}
                saturation={110}
                aberrationIntensity={2}
                elasticity={0.3}
                cornerRadius={radiusMap[radius]}
                padding="0px"
            >
                {/* 
                   We add a subtle background layer *inside* the distortion 
                   so the content sits on 'something' even if the library blurs the background.
                */}
                <div className={`h-full w-full ${fallbackClassMap[intensity]} bg-opacity-30 border-opacity-40`}>
                    {children}
                </div>
            </LiquidGlassLib>
        </div>
    );
};

export default LiquidSurface;
