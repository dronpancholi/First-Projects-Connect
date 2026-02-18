import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    variant = 'text'
}) => {
    const baseStyles = "animate-pulse bg-glass-subtle/50 backdrop-blur-sm";

    const variantStyles = {
        text: "rounded-md",
        circular: "rounded-full",
        rectangular: "rounded-none",
        rounded: "rounded-xl"
    };

    return (
        <div
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            style={{ width, height }}
        />
    );
};
