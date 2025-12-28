import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

// ============================================
// Badge Component
// ============================================

interface BadgeProps {
    children: ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md' | 'lg';
    rounded?: boolean;
}

export default function Badge({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    rounded = false,
}: BadgeProps) {
    const variants = {
        primary: 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 border border-pink-200',
        secondary: 'bg-purple-100 text-purple-700 border border-purple-200',
        success: 'bg-green-100 text-green-700 border border-green-200',
        warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
        danger: 'bg-red-100 text-red-700 border border-red-200',
        info: 'bg-blue-100 text-blue-700 border border-blue-200',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center font-semibold',
                'transition-all duration-200',
                rounded ? 'rounded-full' : 'rounded-lg',
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </span>
    );
}
