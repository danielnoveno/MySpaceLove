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
                `inline-flex items-center justify-center rounded-full border border-rose-200 bg-white/90 px-5 py-3 text-sm font-semibold text-rose-500 shadow-sm transition duration-200 ease-in-out hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-200 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    disabled ? 'pointer-events-none' : ''
                } ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
