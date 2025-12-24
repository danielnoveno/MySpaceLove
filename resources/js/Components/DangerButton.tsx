import { ButtonHTMLAttributes } from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:from-red-600 hover:via-rose-600 hover:to-orange-600 hover:shadow-2xl hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${
                    disabled ? 'pointer-events-none' : ''
                } ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
