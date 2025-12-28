import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={cn(
                // Base styles
                'inline-flex items-center justify-center',
                'rounded-xl px-6 py-2.5',
                'text-sm font-semibold text-white',
                'transition-all duration-200 ease-in-out',
                
                // LoveSpace gradient theme
                'bg-gradient-to-r from-pink-500 to-rose-500',
                'hover:from-pink-600 hover:to-rose-600',
                'active:from-pink-700 active:to-rose-700',
                
                // Shadow and effects
                'shadow-md hover:shadow-lg',
                'transform hover:scale-[1.02] active:scale-[0.98]',
                
                // Focus state
                'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
                
                // Disabled state
                disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
                
                className
            )}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
