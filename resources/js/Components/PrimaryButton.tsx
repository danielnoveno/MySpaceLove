import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 ease-in-out hover:from-pink-500 hover:via-rose-500 hover:to-pink-500 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    disabled ? 'pointer-events-none' : ''
                } ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
