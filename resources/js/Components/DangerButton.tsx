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
                `inline-flex items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-rose-500 via-red-500 to-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 ease-in-out hover:from-rose-500 hover:via-red-500 hover:to-rose-600 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    disabled ? 'pointer-events-none' : ''
                } ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
