import React from 'react';
import { GlassCard } from './LiquidGlass.tsx';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <GlassCard className={`p-8 flex flex-col items-center justify-center text-center ${className}`}>
            {Icon && (
                <div className="w-16 h-16 rounded-2xl bg-glass-subtle flex items-center justify-center mb-4 text-glass-secondary">
                    <Icon size={32} opacity={0.6} />
                </div>
            )}
            <h3 className="text-lg font-semibold text-glass-primary mb-2">{title}</h3>
            <p className="text-glass-secondary text-sm max-w-sm mb-6 leading-relaxed">
                {description}
            </p>
            {action}
        </GlassCard>
    );
};
