import React from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   LIQUID GLASS COMPONENT LIBRARY
   Pure CSS glassmorphism components without external dependencies
   ═══════════════════════════════════════════════════════════════════════════ */

interface GlassProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

interface GlassButtonProps extends GlassProps {
    variant?: 'default' | 'primary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

interface GlassInputProps {
    className?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    autoFocus?: boolean;
}

interface GlassBadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

/* ─────────────────────────────────────────────────────────────────────────────
   BASE GLASS WRAPPER
   Standard glass effect for general use
───────────────────────────────────────────────────────────────────────────── */
export const LiquidGlass: React.FC<GlassProps> = ({
    children,
    className = '',
    style,
    onClick
}) => {
    return (
        <div
            className={`glass-card ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS PANEL
   Large container with prominent glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassPanel: React.FC<GlassProps> = ({
    children,
    className = '',
    style,
    onClick
}) => {
    return (
        <div
            className={`glass-panel ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS CARD
   Medium container for cards and content blocks
───────────────────────────────────────────────────────────────────────────── */
export const GlassCard: React.FC<GlassProps> = ({
    children,
    className = '',
    style,
    onClick
}) => {
    return (
        <div
            className={`glass-card ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS CARD SUBTLE
   Less prominent glass card for nested content
───────────────────────────────────────────────────────────────────────────── */
export const GlassCardSubtle: React.FC<GlassProps> = ({
    children,
    className = '',
    style,
    onClick
}) => {
    return (
        <div
            className={`glass-card-subtle ${className}`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS SIDEBAR
   Navigation sidebar with glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassSidebar: React.FC<GlassProps> = ({
    children,
    className = '',
    style
}) => {
    return (
        <aside
            className={`glass-sidebar h-full flex flex-col ${className}`}
            style={style}
        >
            {children}
        </aside>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS HEADER
   Top navigation bar with glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassHeader: React.FC<GlassProps> = ({
    children,
    className = '',
    style
}) => {
    return (
        <header
            className={`glass-header ${className}`}
            style={style}
        >
            {children}
        </header>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS MODAL
   Modal dialog with strong glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassModal: React.FC<GlassProps & { onClose?: () => void }> = ({
    children,
    className = '',
    style,
    onClose
}) => {
    return (
        <div
            className="fixed inset-0 z-[100] glass-overlay flex items-center justify-center p-6 animate-fade-in"
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            <div
                className={`glass-modal w-full max-w-lg animate-scale-in ${className}`}
                style={style}
            >
                {children}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS BUTTON
   Interactive button with glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassButton: React.FC<GlassButtonProps> = ({
    children,
    className = '',
    style,
    onClick,
    variant = 'default',
    size = 'md',
    disabled = false,
    type = 'button'
}) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    const variantClasses = {
        default: 'glass-button',
        primary: 'glass-button glass-button-primary',
        ghost: 'glass-button border-transparent bg-transparent hover:bg-white/50'
    };

    return (
        <button
            type={type}
            className={`${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={style}
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS INPUT
   Text input with glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassInput: React.FC<GlassInputProps> = ({
    className = '',
    placeholder,
    value,
    onChange,
    type = 'text',
    autoFocus = false
}) => {
    return (
        <input
            type={type}
            className={`glass-input ${className}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
        />
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS TEXTAREA
   Multi-line input with glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassTextarea: React.FC<{
    className?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
}> = ({
    className = '',
    placeholder,
    value,
    onChange,
    rows = 4
}) => {
        return (
            <textarea
                className={`glass-input resize-none ${className}`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
            />
        );
    };

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS SELECT
   Dropdown select with glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassSelect: React.FC<{
    children: React.ReactNode;
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({
    children,
    className = '',
    value,
    onChange
}) => {
        return (
            <select
                className={`glass-input cursor-pointer ${className}`}
                value={value}
                onChange={onChange}
            >
                {children}
            </select>
        );
    };

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS BADGE
   Status indicator with glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassBadge: React.FC<GlassBadgeProps> = ({
    children,
    variant = 'default',
    className = ''
}) => {
    const variantClasses = {
        default: 'bg-gray-100 text-gray-600 border-gray-200',
        primary: 'bg-blue-50 text-blue-600 border-blue-200',
        success: 'bg-green-50 text-green-600 border-green-200',
        warning: 'bg-amber-50 text-amber-600 border-amber-200',
        danger: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
        <span className={`glass-badge ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS COLUMN
   Kanban column with glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassColumn: React.FC<GlassProps> = ({
    children,
    className = '',
    style
}) => {
    return (
        <div
            className={`glass-card-subtle rounded-2xl p-4 min-w-[300px] max-w-[350px] flex flex-col ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────────────────────
   GLASS STAT CARD
   Dashboard stat card with glass effect
───────────────────────────────────────────────────────────────────────────── */
export const GlassStatCard: React.FC<GlassProps & {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: string;
}> = ({
    icon,
    label,
    value,
    trend,
    className = ''
}) => {
        return (
            <div className={`glass-card p-5 ${className}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                        {icon}
                    </div>
                    {trend && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            {trend}
                        </span>
                    )}
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        );
    };

/* ─────────────────────────────────────────────────────────────────────────────
   LIQUID GLASS STRONG
   Strong glass effect for auth screens (pure CSS version)
───────────────────────────────────────────────────────────────────────────── */
export const LiquidGlassStrong: React.FC<GlassProps> = ({
    children,
    className = '',
    style
}) => {
    return (
        <div
            className={`${className}`}
            style={style}
        >
            {children}
        </div>
    );
};
