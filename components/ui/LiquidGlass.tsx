import React, { useRef } from 'react';
import LiquidGlassReact from 'liquid-glass-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// ====================
// Types
// ====================

interface LiquidGlassProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    // Allow any other props
    [key: string]: any;
}

interface GlassWrapperProps extends LiquidGlassProps {
    displacementScale: number;
    blurAmount: number;
    saturation: number;
    aberrationIntensity: number;
    elasticity: number;
    cornerRadius: number;
}

// ====================
// The Physics Engine Wrapper
// ====================

const GlassWrapper: React.FC<GlassWrapperProps> = ({
    children,
    className = '',
    style,
    onClick,
    displacementScale,
    blurAmount,
    saturation,
    aberrationIntensity,
    elasticity,
    cornerRadius,
    ...props
}) => {
    // 3D Tilt Removed - Simplified Static Render

    return (
        <motion.div
            onClick={onClick}
            className={`relative ${className}`}
            style={{
                ...style
            }}
            {...props}
        >
            <div
                className="relative h-full w-full overflow-hidden"
                style={{
                    borderRadius: cornerRadius,
                    // No 3D transforms
                }}
            >
                {/* 1. The Liquid Distortion Engine (Background) */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{ transform: "scale(1.0)" }}
                >
                    <LiquidGlassReact
                        displacementScale={displacementScale}
                        blurAmount={blurAmount}
                        saturation={saturation}
                        aberrationIntensity={aberrationIntensity}
                        elasticity={elasticity}
                        cornerRadius={cornerRadius}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <div style={{ width: '100%', height: '100%' }} />
                    </LiquidGlassReact>
                </div>

                {/* 2. Static Shine (simplified) */}
                <div
                    className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
                    style={{
                        background: `linear-gradient(120deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)`,
                        opacity: 0.4
                    }}
                />

                {/* 3. Glass Surface Texture */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
                />

                {/* 4. Content Content */}
                <div className="relative z-20 h-full w-full">
                    {children}
                </div>
            </div>
        </motion.div>
    );
};

// ====================
// God Mode Component Variants
// ====================

export const LiquidGlass: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card ${className}`}
        {...props}
        displacementScale={1500} // Standardized High
        blurAmount={2.0}
        saturation={110}
        aberrationIntensity={30}
        elasticity={0.95}
        cornerRadius={24}
    />
);

export const GlassPanel: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-panel ${className}`}
        {...props}
        displacementScale={1200} // Standardized Medium-High
        blurAmount={2.5}
        saturation={120}
        aberrationIntensity={40}
        elasticity={0.96}
        cornerRadius={24} // Standardized radius
    />
);

export const GlassCard: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card ${className}`}
        {...props}
        displacementScale={1000} // Standardized Medium
        blurAmount={1.5}
        saturation={110}
        aberrationIntensity={20}
        elasticity={0.94}
        cornerRadius={20} // Standardized radius
    />
);

export const GlassCardSubtle: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card ${className}`}
        {...props}
        displacementScale={600} // Standardized Low
        blurAmount={1.0}
        saturation={100}
        aberrationIntensity={10}
        elasticity={0.90}
        cornerRadius={16} // Standardized radius
    />
);

interface GlassModalProps extends LiquidGlassProps {
    onClose?: () => void;
}

export const GlassModal: React.FC<GlassModalProps> = ({ onClose, children, className = '', ...props }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" aria-hidden="true" onClick={onClose} />
            <GlassWrapper
                className={`glass-modal ${className}`}
                {...props}
                displacementScale={2500} // Phantom Mode Extreme
                blurAmount={4.0}
                saturation={350}
                aberrationIntensity={80}
                elasticity={0.99}
                cornerRadius={32}
            >
                {children}
            </GlassWrapper>
        </div>
    );
};

export const GlassColumn: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-panel ${className}`}
        {...props}
        displacementScale={1500}
        blurAmount={2.5}
        saturation={280}
        aberrationIntensity={50}
        elasticity={0.96}
        cornerRadius={20}
    />
);

export const GlassStatCard: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card ${className}`}
        {...props}
        displacementScale={1800}
        blurAmount={2.5}
        saturation={300}
        aberrationIntensity={55}
        elasticity={0.96}
        cornerRadius={24}
    />
);

export const LiquidGlassStrong: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-panel ${className}`}
        {...props}
        displacementScale={2400}
        blurAmount={3.5}
        saturation={350}
        aberrationIntensity={75}
        elasticity={0.99}
        cornerRadius={32}
    />
);

// ====================
// Fixed Layout Elements (Sidebar/Header) - No physics to prevent motion sickness
// ====================

export const GlassSidebar: React.FC<LiquidGlassProps> = ({ children, className = '' }) => (
    <aside className={`glass-sidebar ${className}`}>
        {children}
    </aside>
);

export const GlassHeader: React.FC<LiquidGlassProps> = ({ children, className = '' }) => (
    <header className={`glass-header ${className}`}>
        {children}
    </header>
);


// ====================
// Interactive Elements (Buttons, Inputs)
// ====================

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    as?: any; // To allow motion component passthrough if needed
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    const variantStyles: Record<string, string> = {
        primary: 'bg-glass-accent text-white shadow-lg hover:shadow-glass-accent/30',
        secondary: 'bg-glass-subtle text-glass-primary border border-glass-border hover:bg-glass-subtle/80',
        ghost: 'bg-transparent text-glass-secondary hover:bg-glass-subtle/50',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20',
    };

    const sizeStyles: Record<string, string> = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg',
        icon: 'p-3',
    };

    // Upgrading to motion.button for spring-based interactions
    return (
        <motion.button
            className={`
                relative inline-flex items-center justify-center font-medium transition-colors duration-300 rounded-xl overflow-hidden
                border border-glass-border shadow-lg
                ${sizeStyles[size]} ${className}
            `}
            style={{
                background: 'var(--glass-bg-interactive)',
                backdropFilter: 'blur(12px) saturate(180%)'
            }}
            whileHover={{
                y: -2,
                backgroundColor: 'var(--glass-bg-strong)',
                boxShadow: 'var(--glass-shadow-hover)',
                borderColor: 'var(--glass-border-strong)'
            }}
            whileTap={{
                scale: 0.96,
                y: 0,
                boxShadow: 'var(--glass-shadow-inset)'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            {...(props as any)}
        >
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-white/30 mix-blend-overlay" />
            </div>
            <div className="relative z-10 flex items-center gap-2">
                {children}
            </div>
        </motion.button>
    );
};

// ====================
// Form Inputs
// ====================

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const GlassInput: React.FC<GlassInputProps> = ({
    className = '',
    ...props
}) => (
    <input
        {...props}
        className={`w-full px-4 py-3 rounded-xl border border-glass-border-subtle text-glass-primary placeholder-glass-muted 
      focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all backdrop-blur-md ${className}`}
        style={{
            background: 'var(--glass-bg-interactive)'
        }}
    />
);

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const GlassTextarea: React.FC<GlassTextareaProps> = ({
    className = '',
    rows = 4,
    ...props
}) => (
    <textarea
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl bg-glass-subtle border border-glass-border-subtle text-glass-primary placeholder-glass-muted 
      focus:outline-none focus:border-glass-border focus:bg-glass transition-all backdrop-blur-sm resize-none ${className}`}
        {...props}
    />
);

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

export const GlassSelect: React.FC<GlassSelectProps> = ({
    children,
    className = '',
    ...props
}) => (
    <select
        className={`w-full px-4 py-3 rounded-xl bg-glass-subtle border border-glass-border-subtle text-glass-primary 
      focus:outline-none focus:border-glass-border focus:bg-glass transition-all backdrop-blur-sm ${className}`}
        style={{ colorScheme: 'light' }}
        {...props}
    >
        {children}
    </select>
);

// ====================
// Badge
// ====================

interface GlassBadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'primary';
    className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const variantStyles: Record<string, string> = {
        default: 'bg-glass-subtle text-glass-secondary border-glass-border-subtle',
        primary: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
        success: 'bg-green-500/10 text-green-700 border-green-500/20',
        warning: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        danger: 'bg-red-500/10 text-red-700 border-red-500/20',
        info: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
        purple: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${variantStyles[variant]} ${className}`}>
            {children}
        </span>
    );
};

// ====================
// Progress Bar
// ====================

interface GlassProgressBarProps {
    value: number;
    max?: number;
    className?: string;
    showLabel?: boolean;
    variant?: 'default' | 'gradient' | 'success' | 'warning';
}

export const GlassProgressBar: React.FC<GlassProgressBarProps> = ({
    value,
    max = 100,
    className = '',
    showLabel = false,
    variant = 'gradient'
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variantStyles: Record<string, string> = {
        default: 'bg-glass-primary',
        gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
        success: 'bg-green-500',
        warning: 'bg-amber-500',
    };

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-glass-secondary">Progress</span>
                    <span className="text-glass-primary font-medium">{Math.round(percentage)}%</span>
                </div>
            )}
            <div className="h-2 rounded-full bg-glass-border-subtle overflow-hidden backdrop-blur-sm">
                <motion.div
                    className={`h-full rounded-full ${variantStyles[variant]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />
            </div>
        </div>
    );
};

export default LiquidGlass;
