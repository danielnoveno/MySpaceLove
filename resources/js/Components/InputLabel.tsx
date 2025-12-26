import { LabelHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={cn(
                'block text-sm font-semibold text-gray-700 mb-2',
                'transition-colors duration-200',
                className
            )}
        >
            {value ? value : children}
        </label>
    );
}
