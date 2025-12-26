import { forwardRef, InputHTMLAttributes, useEffect, useImperativeHandle, useRef } from 'react';
import { cn } from '@/utils/helpers';

export default forwardRef<
    HTMLInputElement,
    InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean }
>(function TextInput({ type = 'text', className = '', isFocused = false, ...props }, ref) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => localRef.current!);

    useEffect(() => {
        if (isFocused && localRef.current) {
            localRef.current.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={cn(
                // Base styles
                'w-full rounded-xl px-4 py-2.5',
                'text-sm text-gray-900',
                'transition-all duration-200 ease-in-out',
                
                // Border and background
                'border-2 border-gray-200 bg-white',
                
                // Focus state with LoveSpace theme
                'focus:border-pink-400 focus:ring-4 focus:ring-pink-100',
                'focus:outline-none',
                
                // Hover state
                'hover:border-gray-300',
                
                // Placeholder
                'placeholder:text-gray-400',
                
                // Disabled state
                'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                
                className
            )}
            ref={localRef}
        />
    );
});
