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
    // 3D Tilt Physics
    const ref = useRef<HTMLDivElement>(null);

    // Mouse position values (0 to 1)
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);

    // Smooth Heavy Physics - 60FPS Optimized
    const springConfig = { mass: 0.8, stiffness: 90, damping: 25 };
    const mouseX = useSpring(x, springConfig);
    const mouseY = useSpring(y, springConfig);

    // Calculate rotation based on mouse position (-10deg to 10deg)
    const rotateX = useTransform(mouseY, [0, 1], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseX, [0, 1], ["-7deg", "7deg"]);

    // Dynamic Specular Highlight (The "Shine") position
    const glareX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
    const glareY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseXRel = e.clientX - rect.left;
        const mouseYRel = e.clientY - rect.top;

        const xPct = mouseXRel / width;
        const yPct = mouseYRel / height;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        // Reset to center on leave
        x.set(0.5);
        y.set(0.5);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`relative ${className}`}
            style={{
                perspective: 1000,
                transformStyle: "preserve-3d",
                ...style
            }}
            {...props}
        >
            {/* The Physical Glass Pane */}
            <motion.div
                className="relative h-full w-full overflow-hidden"
                style={{
                    borderRadius: cornerRadius,
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                    // GPU Acceleration for smooth liquid physics
                    willChange: 'transform',
                    transform: 'translateZ(0)'
                }}
            >
                {/* 1. The Liquid Distortion Engine (Background) */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{ transform: "scale(1.1)" }} // Slight scale to cover edges during rigid tilt
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
                        {/* Essential for library to mount correctly */}
                        <div style={{ width: '100%', height: '100%' }} />
                    </LiquidGlassReact>
                </div>

                {/* 2. Dynamic Specular Reflection (The Shine) */}
                <motion.div
                    className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
                    style={{
                        background: `radial-gradient(
                            circle at ${glareX} ${glareY}, 
                            rgba(255,255,255,0.8) 0%, 
                            rgba(255,255,255,0.2) 40%, 
                            rgba(255,255,255,0) 80%
                        )`,
                        opacity: 0.6
                    }}
                />

                {/* 3. Glass Surface Texture (Subtle Noise) */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
                />

                {/* 4. Content Content (Floating inside the glass) */}
                <div className="relative z-20 h-full w-full">
                    {children}
                </div>
            </motion.div>
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
        displacementScale={2000} // Phantom Mode (Theoretical Max)
        blurAmount={3.0}
        saturation={320}
        aberrationIntensity={60}
        elasticity={0.97}
        cornerRadius={24}
    />
);

export const GlassPanel: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-panel ${className}`}
        {...props}
        displacementScale={2200} // Phantom Mode
        blurAmount={3.5}
        saturation={330}
        aberrationIntensity={65}
        elasticity={0.98}
        cornerRadius={32}
    />
);

export const GlassCard: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card ${className}`}
        {...props}
        displacementScale={2100} // Phantom Mode
        blurAmount={2.8}
        saturation={310}
        aberrationIntensity={60}
        elasticity={0.97}
        cornerRadius={24}
    />
);

export const GlassCardSubtle: React.FC<LiquidGlassProps> = ({ className = '', ...props }) => (
    <GlassWrapper
        className={`glass-card ${className}`}
        {...props}
        displacementScale={1200} // High but manageable for "subtle" in this mode
        blurAmount={1.5}
        saturation={200}
        aberrationIntensity={30}
        elasticity={0.90}
        cornerRadius={24}
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

    // We skip the 3D physics for buttons to make them feel "clickable" and fast
    // But we add a subtle internal glass shine effect
    return (
        <button
            className={`
                relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl overflow-hidden active:scale-95
                border border-glass-border shadow-lg hover:shadow-xl hover:border-glass-border-strong
                ${sizeStyles[size]} ${className}
            `}
            style={{
                background: 'var(--glass-bg-interactive)',
                backdropFilter: 'blur(12px) saturate(180%)'
            }}
            {...props}
        >
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-white/30 mix-blend-overlay" />
            </div>
            <div className="relative z-10 flex items-center gap-2">
                {children}
            </div>
        </button>
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

export default LiquidGlass;
