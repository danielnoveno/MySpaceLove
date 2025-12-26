import { ImgHTMLAttributes } from 'react';
import { cn, getInitials } from '@/utils/helpers';

// ============================================
// Avatar Component
// ============================================

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    variant?: 'circle' | 'rounded' | 'square';
    status?: 'online' | 'offline' | 'away' | 'busy';
    className?: string;
}

export default function Avatar({
    src,
    alt,
    name = '',
    size = 'md',
    variant = 'circle',
    status,
    className = '',
    ...props
}: AvatarProps) {
    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-24 h-24 text-3xl',
    };

    const variants = {
        circle: 'rounded-full',
        rounded: 'rounded-xl',
        square: 'rounded-md',
    };

    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        away: 'bg-yellow-500',
        busy: 'bg-red-500',
    };

    const statusSizes = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
        '2xl': 'w-5 h-5',
    };

    const initials = name ? getInitials(name) : '';

    return (
        <div className={cn('relative inline-block', className)}>
            {src ? (
                <img
                    src={src}
                    alt={alt || name}
                    className={cn(
                        'object-cover',
                        'border-2 border-white shadow-sm',
                        'transition-all duration-200',
                        sizes[size],
                        variants[variant],
                    )}
                    {...props}
                />
            ) : (
                <div
                    className={cn(
                        'flex items-center justify-center',
                        'bg-gradient-to-br from-pink-400 to-rose-400',
                        'text-white font-semibold',
                        'border-2 border-white shadow-sm',
                        'transition-all duration-200',
                        sizes[size],
                        variants[variant],
                    )}
                >
                    {initials}
                </div>
            )}

            {/* Status indicator */}
            {status && (
                <span
                    className={cn(
                        'absolute bottom-0 right-0',
                        'rounded-full border-2 border-white',
                        statusColors[status],
                        statusSizes[size],
                    )}
                    aria-label={`Status: ${status}`}
                />
            )}
        </div>
    );
}

// ============================================
// Avatar Group Component
// ============================================

interface AvatarGroupProps {
    children: React.ReactNode;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
}

export function AvatarGroup({
    children,
    max = 5,
    size = 'md',
    className = '',
}: AvatarGroupProps) {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-24 h-24 text-3xl',
    };

    return (
        <div className={cn('flex items-center -space-x-2', className)}>
            {visibleChildren}
            {remainingCount > 0 && (
                <div
                    className={cn(
                        'flex items-center justify-center',
                        'bg-gray-200 text-gray-600 font-semibold',
                        'border-2 border-white shadow-sm rounded-full',
                        sizes[size],
                    )}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}
