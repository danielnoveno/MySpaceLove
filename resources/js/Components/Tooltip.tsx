import { ReactNode, useState } from 'react';
import { cn } from '@/utils/helpers';

// ============================================
// Tooltip Component
// ============================================

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    delay?: number;
}

export default function Tooltip({
    children,
    content,
    position = 'top',
    className = '',
    delay = 200,
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    let timeout: NodeJS.Timeout;

    const showTooltip = () => {
        timeout = setTimeout(() => setIsVisible(true), delay);
    };

    const hideTooltip = () => {
        clearTimeout(timeout);
        setIsVisible(false);
    };

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrows = {
        top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
        left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
        right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            
            {isVisible && (
                <div
                    className={cn(
                        'absolute z-50 px-3 py-2',
                        'bg-gray-900 text-white text-sm rounded-lg',
                        'whitespace-nowrap',
                        'animate-in fade-in zoom-in-95 duration-200',
                        'shadow-lg',
                        positions[position],
                        className
                    )}
                    role="tooltip"
                >
                    {content}
                    {/* Arrow */}
                    <div
                        className={cn(
                            'absolute w-0 h-0',
                            'border-4',
                            arrows[position]
                        )}
                    />
                </div>
            )}
        </div>
    );
}
