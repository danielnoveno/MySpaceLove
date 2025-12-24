import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-full border-2 border-violet-300 bg-gradient-to-r from-white/95 to-violet-50/80 px-5 py-3 text-sm font-semibold text-violet-600 shadow-sm transition-all duration-300 ease-in-out hover:border-violet-400 hover:bg-gradient-to-r hover:from-violet-50 hover:to-violet-100/90 hover:text-violet-700 hover:shadow-md hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${
                    disabled ? 'pointer-events-none' : ''
                } ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
