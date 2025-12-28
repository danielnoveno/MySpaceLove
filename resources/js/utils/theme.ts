/**
 * LoveSpace Design System
 * Centralized theme configuration following react-bits best practices
 * 
 * This file contains all design tokens, color palettes, and styling constants
 * used throughout the LoveSpace application.
 */

// ============================================
// Color Palette - LoveSpace Theme
// ============================================

export const colors = {
    // Primary - Pink/Rose theme for love and romance
    primary: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
    },
    
    // Secondary - Purple for elegance
    secondary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87',
    },
    
    // Accent - Rose for warmth
    accent: {
        50: '#fff1f2',
        100: '#ffe4e6',
        200: '#fecdd3',
        300: '#fda4af',
        400: '#fb7185',
        500: '#f43f5e',
        600: '#e11d48',
        700: '#be123c',
        800: '#9f1239',
        900: '#881337',
    },
    
    // Neutral - Gray scale
    neutral: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },
    
    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
} as const;

// ============================================
// Gradients - LoveSpace Signature
// ============================================

export const gradients = {
    primary: 'bg-gradient-to-r from-pink-500 to-rose-500',
    primaryHover: 'bg-gradient-to-r from-pink-600 to-rose-600',
    secondary: 'bg-gradient-to-r from-purple-500 to-pink-500',
    accent: 'bg-gradient-to-r from-rose-400 to-pink-500',
    subtle: 'bg-gradient-to-r from-pink-50 to-rose-50',
    glass: 'bg-gradient-to-br from-white/80 to-pink-50/80',
    romantic: 'bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100',
} as const;

// ============================================
// Spacing System
// ============================================

export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
} as const;

// ============================================
// Border Radius
// ============================================

export const borderRadius = {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
} as const;

// ============================================
// Shadows - Soft and Romantic
// ============================================

export const shadows = {
    sm: '0 1px 2px 0 rgba(236, 72, 153, 0.05)',
    md: '0 4px 6px -1px rgba(236, 72, 153, 0.1), 0 2px 4px -1px rgba(236, 72, 153, 0.06)',
    lg: '0 10px 15px -3px rgba(236, 72, 153, 0.1), 0 4px 6px -2px rgba(236, 72, 153, 0.05)',
    xl: '0 20px 25px -5px rgba(236, 72, 153, 0.1), 0 10px 10px -5px rgba(236, 72, 153, 0.04)',
    '2xl': '0 25px 50px -12px rgba(236, 72, 153, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(236, 72, 153, 0.06)',
    none: 'none',
} as const;

// ============================================
// Typography
// ============================================

export const typography = {
    fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
    },
    fontSize: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
    },
    fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },
} as const;

// ============================================
// Animation Durations
// ============================================

export const animation = {
    duration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '500ms',
    },
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
} as const;

// ============================================
// Component Variants - Pre-defined styles
// ============================================

export const buttonVariants = {
    primary: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all duration-200',
    secondary: 'bg-white text-pink-600 border-2 border-pink-200 hover:bg-pink-50 transition-all duration-200',
    ghost: 'bg-transparent text-pink-600 hover:bg-pink-50 transition-all duration-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg transition-all duration-200',
    success: 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg transition-all duration-200',
} as const;

export const inputVariants = {
    default: 'border-gray-300 focus:border-pink-500 focus:ring-pink-500 rounded-lg transition-all duration-200',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500 rounded-lg',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500 rounded-lg',
} as const;

export const cardVariants = {
    default: 'bg-white rounded-2xl shadow-md border border-pink-100/50',
    elevated: 'bg-white rounded-2xl shadow-xl border border-pink-100/50',
    glass: 'bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100/50',
    romantic: 'bg-gradient-to-br from-pink-50/80 to-rose-50/80 rounded-2xl shadow-md border border-pink-200/50',
} as const;

// ============================================
// Breakpoints (for responsive design)
// ============================================

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// ============================================
// Z-Index Scale
// ============================================

export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
} as const;

// ============================================
// Helper Functions
// ============================================

/**
 * Get color value from palette
 */
export const getColor = (color: keyof typeof colors, shade?: number) => {
    if (typeof colors[color] === 'string') {
        return colors[color];
    }
    return shade ? (colors[color] as any)[shade] : colors[color];
};

/**
 * Combine class names conditionally
 */
export const cn = (...classes: (string | boolean | undefined | null)[]) => {
    return classes.filter(Boolean).join(' ');
};

// ============================================
// Export all as theme object
// ============================================

export const theme = {
    colors,
    gradients,
    spacing,
    borderRadius,
    shadows,
    typography,
    animation,
    buttonVariants,
    inputVariants,
    cardVariants,
    breakpoints,
    zIndex,
    getColor,
    cn,
} as const;

export default theme;
