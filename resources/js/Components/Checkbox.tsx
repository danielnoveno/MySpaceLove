import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={cn(
                // Base styles
                'rounded-md',
                'transition-all duration-200 ease-in-out',
                
                // Size
                'h-5 w-5',
                
                // Border and background
                'border-2 border-gray-300',
                'bg-white',
                
                // Checked state with LoveSpace theme
                'text-pink-500',
                'checked:bg-pink-500',
                'checked:border-pink-500',
                
                // Focus state
                'focus:ring-4 focus:ring-pink-100',
                'focus:ring-offset-0',
                'focus:outline-none',
                
                // Hover state
                'hover:border-pink-300',
                'cursor-pointer',
                
                // Disabled state
                'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
                
                className
            )}
        />
    );
}
