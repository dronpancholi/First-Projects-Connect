import React from 'react';
import LiquidGlassComponent from 'liquid-glass-react';

// ====================
// Wrapper that layers glass effect behind content
// The library's canvas interferes with layout, so we:
// 1. Position glass absolutely as background (z-index: 0)
// 2. Position content relatively above (z-index: 1)
// ====================

interface GlassWrapperProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    // Glass effect props
    displacementScale?: number;
    blurAmount?: number;
    saturation?: number;
    aberrationIntensity?: number;
    elasticity?: number;
    cornerRadius?: number;
}

const GlassWrapper: React.FC<GlassWrapperProps> = ({
    children,
    className = '',
    style,
    onClick,
    displacementScale = 180,
    blurAmount = 0.5,
    saturation = 170,
    aberrationIntensity = 4.5,
    elasticity = 0.6,
    cornerRadius = 24
}) => {
    return (
        <div
            className={`relative flex flex-col overflow-hidden ${className}`}
            style={{
                ...style,
                cursor: 'pointer',
                // GPU Acceleration for smooth liquid physics
                willChange: 'transform',
                transform: 'translateZ(0)'
            }}
            onClick={onClick}
        >
            {/* Glass effect as absolute background layer */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                borderRadius: cornerRadius,
                boxShadow: 'inset 0 0 40px rgba(255,255,255,0.1)'
            }}>
                <LiquidGlassComponent
                    displacementScale={displacementScale}
                    blurAmount={blurAmount}
                    saturation={saturation}
                    aberrationIntensity={aberrationIntensity}
                    elasticity={elasticity}
                    cornerRadius={cornerRadius}
                    style={{ width: '100%', height: '100%' }}
                >
                    <div style={{ width: '100%', height: '100%' }} />
                </LiquidGlassComponent>
            </div>

            {/* Content layer above glass - purely strictly layout */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// ====================
// Component Variants
// ====================

interface LiquidGlassProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

// Standard card with refined max glass effect
export const LiquidGlass: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card ${className}`}
        {...props}
        displacementScale={350}
        blurAmount={1.2}
        saturation={240}
        aberrationIntensity={12}
        elasticity={0.85}
        cornerRadius={24}
    />
);

export const GlassPanel: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-panel ${className}`}
        {...props}
        displacementScale={400}
        blurAmount={1.5}
        saturation={260}
        aberrationIntensity={15}
        elasticity={0.9}
        cornerRadius={32}
    />
);

export const GlassCard: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card ${className}`}
        {...props}
        displacementScale={350}
        blurAmount={1.2}
        saturation={240}
        aberrationIntensity={12}
        elasticity={0.85}
        cornerRadius={24}
    />
);

export const GlassCardSubtle: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card-subtle ${className}`}
        {...props}
        displacementScale={120}
        blurAmount={0.3}
        saturation={150}
        aberrationIntensity={3}
        elasticity={0.5}
        cornerRadius={16}
    />
);

interface GlassModalProps extends LiquidGlassProps {
    onClose?: () => void;
}

export const GlassModal: React.FC<GlassModalProps> = ({ onClose, children, className = '', ...props }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px) saturate(150%)' }}
        onClick={(e) => {
            if (e.target === e.currentTarget && onClose) onClose();
        }}
    >
        <div className={`w-full max-w-lg transition-all duration-300`}>
            {/* The wrapper itself needs the visual glass class */}
            <GlassWrapper
                className={`glass-modal ${className}`}
                {...props}
                displacementScale={500}
                blurAmount={2.0}
                saturation={300}
                aberrationIntensity={20}
                elasticity={0.95}
                cornerRadius={32}
            >
                {children}
            </GlassWrapper>
        </div>
    </div>
);

export const GlassColumn: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-panel ${className}`} // Use panel style for columns
        {...props}
        displacementScale={180}
        blurAmount={0.4}
        saturation={160}
        aberrationIntensity={4}
        elasticity={0.6}
        cornerRadius={20}
    />
);

export const GlassStatCard: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card ${className}`}
        {...props}
        displacementScale={380}
        blurAmount={1.4}
        saturation={250}
        aberrationIntensity={14}
        elasticity={0.88}
        cornerRadius={24}
    />
);

export const LiquidGlassStrong: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-panel ${className}`}
        {...props}
        displacementScale={500}
        blurAmount={2.0}
        saturation={300}
        aberrationIntensity={20}
        elasticity={0.95}
        cornerRadius={32}
    />
);

// ====================
// CSS-based fixed elements (no library - ensures layout stability)
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
// Button with Liquid Glass Effect
// ====================

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    ...props
}) => {
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg'
    };

    return (
        <div
            className={`relative inline-flex ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
            {/* Glass background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                borderRadius: 100,
                overflow: 'hidden'
            }}>
                <LiquidGlassComponent
                    displacementScale={64}
                    blurAmount={0.1}
                    saturation={130}
                    aberrationIntensity={2}
                    elasticity={0.35}
                    cornerRadius={100}
                    style={{ width: '100%', height: '100%' }}
                >
                    <div style={{ width: '100%', height: '100%' }} />
                </LiquidGlassComponent>
            </div>

            {/* Button content */}
            <button
                {...props}
                className={`relative z-10 ${sizeStyles[size]} text-glass-primary font-medium flex items-center gap-2 bg-transparent border-none`}
            >
                {children}
            </button>
        </div>
    );
};

// ====================
// Form Components - Pure CSS (no library interference)
// ====================

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    // Extend standard props
}

export const GlassInput: React.FC<GlassInputProps> = ({
    className = '',
    ...props
}) => (
    <input
        {...props}
        className={`w-full px-4 py-3 rounded-xl bg-glass-subtle border border-glass-border-subtle text-glass-primary placeholder-glass-muted 
      focus:outline-none focus:border-glass-border focus:bg-glass transition-all backdrop-blur-sm ${className}`}
    />
);

interface GlassTextareaProps {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string;
    rows?: number;
    disabled?: boolean;
}

export const GlassTextarea: React.FC<GlassTextareaProps> = ({
    placeholder,
    value,
    onChange,
    className = '',
    rows = 4,
    disabled = false
}) => (
    <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl bg-glass-subtle border border-glass-border-subtle text-glass-primary placeholder-glass-muted 
      focus:outline-none focus:border-glass-border focus:bg-glass transition-all backdrop-blur-sm resize-none ${className}`}
    />
);

interface GlassSelectProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
    value,
    onChange,
    children,
    className = '',
    disabled = false
}) => (
    <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl bg-glass-subtle border border-glass-border-subtle text-glass-primary 
      focus:outline-none focus:border-glass-border focus:bg-glass transition-all backdrop-blur-sm ${className}`}
        style={{ colorScheme: 'light' }}
    >
        {children}
    </select>
);

// ====================
// Badge - Pure CSS
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

export default LiquidGlass;
