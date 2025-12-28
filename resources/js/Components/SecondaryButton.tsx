import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { type?: 'submit' | 'button' | 'reset' }) {
    return (
        <button
            {...props}
            type={type}
            className={cn(
                // Base styles
                'inline-flex items-center justify-center',
                'rounded-xl px-6 py-2.5',
                'text-sm font-semibold',
                'transition-all duration-200 ease-in-out',
                
                // LoveSpace secondary theme (outline style)
                'bg-white text-pink-600',
                'border-2 border-pink-200',
                'hover:bg-pink-50 hover:border-pink-300',
                'active:bg-pink-100',
                
                // Shadow and effects
                'shadow-sm hover:shadow-md',
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
