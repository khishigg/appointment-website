import React from 'react';

/**
 * Standardized Button component with multiple variants and loading states.
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'} props.variant - Visual style
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {boolean} props.loading - Loading state
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 * @param {React.ReactNode} props.rightIcon - Icon on the right
 */
export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    leftIcon,
    rightIcon,
    children,
    ...props
}) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 border font-semibold rounded-pill transition-colors focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50';

    const variants = {
        primary: 'bg-[var(--primary-500)] border-[var(--primary-600)] text-ink enabled:hover:bg-[var(--primary-600)] shadow-xs',
        secondary: 'bg-canvas border-line text-heading enabled:hover:bg-disabled-bg',
        outline: 'bg-transparent border-[var(--primary-600)] text-ink enabled:hover:bg-[var(--primary-200)]',
        ghost: 'bg-transparent border-transparent text-muted enabled:hover:bg-hover-surface',
        danger: 'bg-danger-text border-danger-text text-surface enabled:hover:bg-danger',
    };

    const sizes = {
        sm: 'min-h-11 px-3 py-1.5 text-xs leading-5',
        md: 'min-h-12 px-4 py-2 text-sm leading-5',
        lg: 'min-h-12 px-6 py-3 text-base leading-6',
    };

    const selectedVariant = variants[variant] || variants.primary;
    const selectedSize = sizes[size] || sizes.md;

    return (
        <button
            className={`${baseClasses} ${selectedVariant} ${selectedSize} ${className} ${loading ? 'opacity-70 pointer-events-none' : ''}`}
            {...props}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
        >
            {loading && (
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" aria-hidden="true" />
            )}
            {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {!loading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </button>
    );
}
