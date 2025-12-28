import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

// ============================================
// Spinner Component
// ============================================

interface SpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'white' | 'gray';
}

export default function Spinner({
    className = '',
    size = 'md',
    variant = 'primary',
}: SpinnerProps) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-3',
        xl: 'w-12 h-12 border-4',
    };

    const variants = {
        primary: 'border-pink-200 border-t-pink-600',
        white: 'border-white/30 border-t-white',
        gray: 'border-gray-200 border-t-gray-600',
    };

    return (
        <div
            className={cn(
                'inline-block rounded-full animate-spin',
                sizes[size],
                variants[variant],
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}

// ============================================
// Loading Overlay Component
// ============================================

interface LoadingOverlayProps {
    children?: ReactNode;
    isLoading: boolean;
    text?: string;
    className?: string;
}

export function LoadingOverlay({
    children,
    isLoading,
    text = 'Loading...',
    className = '',
}: LoadingOverlayProps) {
    return (
        <div className={cn('relative', className)}>
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-3">
                        <Spinner size="lg" variant="primary" />
                        {text && (
                            <p className="text-sm font-medium text-gray-600">{text}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// Loading Button Component
// ============================================

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    children: ReactNode;
}

export function LoadingButton({
    isLoading = false,
    loadingText,
    children,
    disabled,
    className = '',
    ...props
}: LoadingButtonProps) {
    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={cn(
                'inline-flex items-center justify-center gap-2',
                'rounded-xl px-6 py-2.5',
                'text-sm font-semibold text-white',
                'bg-gradient-to-r from-pink-500 to-rose-500',
                'hover:from-pink-600 hover:to-rose-600',
                'shadow-md hover:shadow-lg',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className
            )}
        >
            {isLoading && <Spinner size="sm" variant="white" />}
            <span>{isLoading && loadingText ? loadingText : children}</span>
        </button>
    );
}
