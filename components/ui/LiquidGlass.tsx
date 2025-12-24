import React from 'react';

// ============================================================================
// PURE CSS LIQUID GLASS COMPONENTS
// ============================================================================
// This component library uses ONLY CSS for glassmorphism effects.
// The liquid-glass-react library was removed due to layout issues.
// ============================================================================

interface GlassProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

interface GlassButtonProps extends GlassProps {
    onClick?: () => void;
    variant?: 'default' | 'primary' | 'ghost' | 'danger';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

interface GlassInputProps {
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
}

interface GlassTextareaProps {
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
}

interface GlassSelectProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
}

interface GlassBadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

// Base glass styles
const baseGlassStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
};

// Main LiquidGlass component
export const LiquidGlass: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`glass-card ${className}`}
            style={{
                ...baseGlassStyle,
                ...style,
            }}
        >
            {children}
        </div>
    );
};

// Glass Panel - larger container
export const GlassPanel: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`glass-panel ${className}`}
            style={{
                ...baseGlassStyle,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '20px',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

// Glass Card - standard card
export const GlassCard: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`glass-card ${className}`}
            style={{
                ...baseGlassStyle,
                transition: 'all 0.3s ease',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

// Glass Card Subtle - less prominent
export const GlassCardSubtle: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`glass-card-subtle ${className}`}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

// Glass Sidebar - fixed sidebar
export const GlassSidebar: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <aside
            className={`glass-sidebar ${className}`}
            style={{
                background: 'rgba(15, 15, 20, 0.85)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                ...style,
            }}
        >
            {children}
        </aside>
    );
};

// Glass Header - fixed header
export const GlassHeader: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <header
            className={`glass-header ${className}`}
            style={{
                background: 'rgba(15, 15, 20, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                ...style,
            }}
        >
            {children}
        </header>
    );
};

// Glass Modal
export const GlassModal: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`glass-modal ${className}`}
            style={{
                background: 'rgba(20, 20, 30, 0.95)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

// Glass Button
export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    className = '',
    style = {},
    onClick,
    variant = 'default',
    disabled = false,
    type = 'button',
}) => {
    const variantStyles: Record<string, React.CSSProperties> = {
        default: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
        },
        primary: {
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            color: '#fff',
        },
        ghost: {
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.7)',
        },
        danger: {
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#ef4444',
        },
    };

    return (
        <button
            type={type}
            className={`glass-button ${className}`}
            style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '10px 20px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.2s ease',
                fontWeight: 500,
                ...variantStyles[variant],
                ...style,
            }}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

// Glass Input
export const GlassInput: React.FC<GlassInputProps> = ({
    className = '',
    style = {},
    ...props
}) => {
    return (
        <input
            className={`glass-input ${className}`}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#fff',
                outline: 'none',
                width: '100%',
                transition: 'all 0.2s ease',
                ...style,
            }}
            {...props}
        />
    );
};

// Glass Textarea
export const GlassTextarea: React.FC<GlassTextareaProps> = ({
    className = '',
    style = {},
    ...props
}) => {
    return (
        <textarea
            className={`glass-textarea ${className}`}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#fff',
                outline: 'none',
                width: '100%',
                resize: 'vertical',
                transition: 'all 0.2s ease',
                ...style,
            }}
            {...props}
        />
    );
};

// Glass Select
export const GlassSelect: React.FC<GlassSelectProps> = ({
    children,
    className = '',
    style = {},
    ...props
}) => {
    return (
        <select
            className={`glass-select ${className}`}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#fff',
                outline: 'none',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ...style,
            }}
            {...props}
        >
            {children}
        </select>
    );
};

// Glass Badge
export const GlassBadge: React.FC<GlassBadgeProps> = ({
    children,
    className = '',
    variant = 'default',
}) => {
    const variantStyles: Record<string, React.CSSProperties> = {
        default: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.8)',
        },
        success: {
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#22c55e',
        },
        warning: {
            background: 'rgba(234, 179, 8, 0.2)',
            color: '#eab308',
        },
        danger: {
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
        },
        info: {
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#3b82f6',
        },
    };

    return (
        <span
            className={`glass-badge ${className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 500,
                ...variantStyles[variant],
            }}
        >
            {children}
        </span>
    );
};

// Glass Column - for Kanban
export const GlassColumn: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`glass-column ${className}`}
            style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

// Glass Stat Card
export const GlassStatCard: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`glass-stat-card ${className}`}
            style={{
                ...baseGlassStyle,
                background: 'rgba(255, 255, 255, 0.08)',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

// Legacy support - LiquidGlassStrong
export const LiquidGlassStrong: React.FC<GlassProps> = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`liquid-glass-strong ${className}`}
            style={{
                ...baseGlassStyle,
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                ...style,
            }}
        >
            {children}
        </div>
    );
};

export default LiquidGlass;
