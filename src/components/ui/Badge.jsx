import React from 'react';

/**
 * Standardized Badge/Tag component for status indicators and labels.
 * @param {Object} props
 * @param {'primary' | 'success' | 'error' | 'warning' | 'gray'} props.variant - Color variant
 * @param {'sm' | 'md'} props.size - Badge size
 * @param {boolean} props.pill - Fully rounded corners
 */
export default function Badge({
    variant = 'primary',
    size = 'md',
    pill = true,
    className = '',
    children,
    ...props
}) {
    const baseClasses = 'inline-flex items-center font-bold transition-all';

    const variants = {
        primary: 'bg-[var(--primary-200)] text-ink',
        success: 'bg-success-surface text-success-text',
        error: 'bg-danger-surface text-danger-text',
        warning: 'bg-warning-surface text-warning-text',
        gray: 'bg-gray-100 text-gray-600',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
    };

    const selectedVariant = variants[variant] || variants.primary;
    const selectedSize = sizes[size] || sizes.md;

    return (
        <span
            className={`
        ${baseClasses} 
        ${selectedVariant} 
        ${selectedSize} 
        ${pill ? 'rounded-full' : 'rounded-sm'} 
        ${className}
      `}
            {...props}
        >
            {children}
        </span>
    );
}
