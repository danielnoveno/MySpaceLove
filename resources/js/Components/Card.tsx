import { ReactNode } from 'react';
import { cn } from '@/utils/helpers';

// ============================================
// Card Component (Compound Pattern)
// ============================================

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'elevated' | 'glass' | 'romantic';
    hover?: boolean;
}

const Card = ({ 
    children, 
    className = '', 
    variant = 'default',
    hover = false 
}: CardProps) => {
    const variants = {
        default: 'bg-white border border-pink-100/50',
        elevated: 'bg-white border border-pink-100/50 shadow-xl',
        glass: 'bg-white/80 backdrop-blur-sm border border-pink-100/50',
        romantic: 'bg-gradient-to-br from-pink-50/80 to-rose-50/80 border border-pink-200/50',
    };

    return (
        <div
            className={cn(
                'rounded-2xl shadow-md transition-all duration-300',
                variants[variant],
                hover && 'hover:shadow-xl hover:scale-[1.02] cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
};

// ============================================
// Card Header
// ============================================

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
    return (
        <div className={cn('px-6 py-4 border-b border-pink-100/50', className)}>
            {children}
        </div>
    );
};

// ============================================
// Card Body
// ============================================

interface CardBodyProps {
    children: ReactNode;
    className?: string;
}

const CardBody = ({ children, className = '' }: CardBodyProps) => {
    return (
        <div className={cn('px-6 py-4', className)}>
            {children}
        </div>
    );
};

// ============================================
// Card Footer
// ============================================

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

const CardFooter = ({ children, className = '' }: CardFooterProps) => {
    return (
        <div className={cn('px-6 py-4 border-t border-pink-100/50 bg-gray-50/50 rounded-b-2xl', className)}>
            {children}
        </div>
    );
};

// ============================================
// Card Title
// ============================================

interface CardTitleProps {
    children: ReactNode;
    className?: string;
}

const CardTitle = ({ children, className = '' }: CardTitleProps) => {
    return (
        <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
            {children}
        </h3>
    );
};

// ============================================
// Card Description
// ============================================

interface CardDescriptionProps {
    children: ReactNode;
    className?: string;
}

const CardDescription = ({ children, className = '' }: CardDescriptionProps) => {
    return (
        <p className={cn('text-sm text-gray-600 mt-1', className)}>
            {children}
        </p>
    );
};

// ============================================
// Exports (Compound Component Pattern)
// ============================================

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card;
