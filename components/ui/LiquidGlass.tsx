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
    displacementScale = 40,
    blurAmount = 0.15,
    saturation = 120,
    aberrationIntensity = 1,
    elasticity = 0.25,
    cornerRadius = 16
}) => {
    return (
        <div
            className={`relative ${className}`}
            style={style}
            onClick={onClick}
        >
            {/* Glass effect as absolute background layer */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                borderRadius: cornerRadius
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

            {/* Content layer above glass */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
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

// Standard card with subtle glass effect
export const LiquidGlass: React.FC<LiquidGlassProps> = (props) => (
    <GlassWrapper
        {...props}
        displacementScale={120}
        blurAmount={0.3}
        saturation={150}
        aberrationIntensity={2.5}
        elasticity={0.4}
        cornerRadius={20}
    />
);

export const GlassPanel: React.FC<LiquidGlassProps> = (props) => (
    <GlassWrapper
        {...props}
        displacementScale={140}
        blurAmount={0.35}
        saturation={160}
        aberrationIntensity={3}
        elasticity={0.45}
        cornerRadius={24}
    />
);

export const GlassCard: React.FC<LiquidGlassProps> = (props) => (
    <GlassWrapper
        {...props}
        displacementScale={130}
        blurAmount={0.25}
        saturation={155}
        aberrationIntensity={2.8}
        elasticity={0.42}
        cornerRadius={16}
    />
);

export const GlassCardSubtle: React.FC<LiquidGlassProps> = (props) => (
    <GlassWrapper
        {...props}
        displacementScale={80}
        blurAmount={0.15}
        saturation={130}
        aberrationIntensity={1.5}
        elasticity={0.3}
        cornerRadius={12}
    />
);

interface GlassModalProps extends LiquidGlassProps {
    onClose?: () => void;
}

export const GlassModal: React.FC<GlassModalProps> = ({ onClose, children, className = '', ...props }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => {
            if (e.target === e.currentTarget && onClose) onClose();
        }}
    >
        <div className={`w-full max-w-lg ${className}`}>
            <GlassWrapper
                {...props}
                displacementScale={200}
                blurAmount={0.5}
                saturation={180}
                aberrationIntensity={5}
                elasticity={0.6}
                cornerRadius={28}
            >
                {children}
            </GlassWrapper>
        </div>
    </div>
);

export const GlassColumn: React.FC<LiquidGlassProps> = (props) => (
    <GlassWrapper
        {...props}
        displacementScale={100}
        blurAmount={0.2}
        saturation={140}
        aberrationIntensity={2}
        elasticity={0.35}
        cornerRadius={20}
    />
);

export const GlassStatCard: React.FC<LiquidGlassProps> = (props) => (
    <GlassWrapper
        {...props}
        displacementScale={150}
        blurAmount={0.3}
        saturation={170}
        aberrationIntensity={3.5}
        elasticity={0.5}
        cornerRadius={20}
    />
);

export const LiquidGlassStrong: React.FC<LiquidGlassProps> = (props) => (
    <GlassWrapper
        {...props}
        displacementScale={250}
        blurAmount={0.8}
        saturation={200}
        aberrationIntensity={6}
        elasticity={0.8}
        cornerRadius={24}
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

interface GlassButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'ghost';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    onClick,
    disabled = false,
    className = '',
    type = 'button',
    variant = 'primary'
}) => {
    const handleClick = () => {
        if (!disabled && onClick) onClick();
    };

    return (
        <div
            className={`relative inline-flex ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
            onClick={handleClick}
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
            {type === 'submit' ? (
                <button
                    type="submit"
                    disabled={disabled}
                    className="relative z-10 px-6 py-3 text-white font-medium flex items-center gap-2"
                    style={{ background: 'transparent', border: 'none' }}
                >
                    {children}
                </button>
            ) : (
                <span className="relative z-10 px-6 py-3 text-white font-medium flex items-center gap-2">
                    {children}
                </span>
            )}
        </div>
    );
};

// ====================
// Form Components - Pure CSS (no library interference)
// ====================

interface GlassInputProps {
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
    required?: boolean;
}

export const GlassInput: React.FC<GlassInputProps> = ({
    type = 'text',
    placeholder,
    value,
    onChange,
    className = '',
    disabled = false,
    required = false
}) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 
      focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all backdrop-blur-sm ${className}`}
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
        className={`w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 
      focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all backdrop-blur-sm resize-none ${className}`}
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
        className={`w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white 
      focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all backdrop-blur-sm ${className}`}
        style={{ colorScheme: 'dark' }}
    >
        {children}
    </select>
);

// ====================
// Badge - Pure CSS
// ====================

interface GlassBadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
    className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const variantStyles: Record<string, string> = {
        default: 'bg-white/10 text-white/80 border-white/20',
        success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        danger: 'bg-red-500/20 text-red-300 border-red-500/30',
        info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${variantStyles[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default LiquidGlass;
