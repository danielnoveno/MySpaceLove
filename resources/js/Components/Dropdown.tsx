import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useRef, ReactNode, HTMLAttributes } from 'react';
import { useToggle } from '@/hooks/useToggle';
import { useClickOutside } from '@/hooks/useClickOutside';

// ============================================
// Context & Types
// ============================================

interface DropdownContextType {
    open: boolean;
    toggle: () => void;
    close: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

const useDropdownContext = () => {
    const context = useContext(DropdownContext);
    if (!context) {
        throw new Error('Dropdown components must be used within a Dropdown');
    }
    return context;
};

// ============================================
// Main Dropdown Component (Compound Pattern)
// ============================================

interface DropdownProps {
    children: ReactNode;
}

const Dropdown = ({ children }: DropdownProps) => {
    const [open, toggle, , close] = useToggle(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useClickOutside(dropdownRef, close);

    return (
        <DropdownContext.Provider value={{ open, toggle, close }}>
            <div ref={dropdownRef} className="relative">
                {children}
            </div>
        </DropdownContext.Provider>
    );
};

// ============================================
// Trigger Component
// ============================================

interface TriggerProps {
    children: ReactNode;
}

const Trigger = ({ children }: TriggerProps) => {
    const { toggle } = useDropdownContext();

    return (
        <div onClick={toggle} className="cursor-pointer">
            {children}
        </div>
    );
};

// ============================================
// Content Component
// ============================================

interface ContentProps {
    align?: 'left' | 'right';
    width?: '48' | '56' | '64';
    contentClasses?: string;
    children: ReactNode;
}

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white',
    children,
}: ContentProps) => {
    const { open } = useDropdownContext();

    // Alignment classes with LoveSpace theme
    const alignmentClasses = {
        left: 'ltr:origin-top-left rtl:origin-top-right start-0',
        right: 'ltr:origin-top-right rtl:origin-top-left end-0',
    }[align];

    // Width classes
    const widthClasses = {
        '48': 'w-48',
        '56': 'w-56',
        '64': 'w-64',
    }[width];

    return (
        <Transition
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <div
                className={`absolute z-50 mt-2 rounded-xl shadow-lg ${alignmentClasses} ${widthClasses}`}
            >
                <div
                    className={`rounded-xl ring-1 ring-pink-100 ring-opacity-20 ${contentClasses}`}
                >
                    {children}
                </div>
            </div>
        </Transition>
    );
};

// ============================================
// Link Component (with LoveSpace theme)
// ============================================

interface DropdownLinkProps extends HTMLAttributes<HTMLAnchorElement> {
    href: string;
    className?: string;
    children: ReactNode;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: 'a' | 'button';
}

const DropdownLink = ({ 
    className = '', 
    children, 
    ...props 
}: DropdownLinkProps) => {
    const { close } = useDropdownContext();

    return (
        <Link
            {...props}
            onClick={close}
            className={
                'block w-full px-4 py-2.5 text-start text-sm leading-5 text-gray-700 transition duration-200 ease-in-out ' +
                'hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-600 ' +
                'focus:bg-gradient-to-r focus:from-pink-50 focus:to-rose-50 focus:text-pink-600 focus:outline-none ' +
                'first:rounded-t-xl last:rounded-b-xl ' +
                className
            }
        >
            {children}
        </Link>
    );
};

// ============================================
// Divider Component
// ============================================

const Divider = () => {
    return <div className="my-1 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent" />;
};

// ============================================
// Button Component (for non-link actions)
// ============================================

interface DropdownButtonProps extends HTMLAttributes<HTMLButtonElement> {
    className?: string;
    children: ReactNode;
    type?: 'button' | 'submit' | 'reset';
}

const DropdownButton = ({ 
    className = '', 
    children, 
    type = 'button',
    onClick,
    ...props 
}: DropdownButtonProps) => {
    const { close } = useDropdownContext();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        close();
    };

    return (
        <button
            type={type}
            onClick={handleClick}
            className={
                'block w-full px-4 py-2.5 text-start text-sm leading-5 text-gray-700 transition duration-200 ease-in-out ' +
                'hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-600 ' +
                'focus:bg-gradient-to-r focus:from-pink-50 focus:to-rose-50 focus:text-pink-600 focus:outline-none ' +
                'first:rounded-t-xl last:rounded-b-xl ' +
                className
            }
            {...props}
        >
            {children}
        </button>
    );
};

// ============================================
// Exports (Compound Component Pattern)
// ============================================

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;
Dropdown.Divider = Divider;
Dropdown.Button = DropdownButton;

export default Dropdown;
