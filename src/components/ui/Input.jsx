import { useId } from 'react';

/**
 * Standardized Input component with label and error state support.
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.error - Error message
 * @param {React.ReactNode} props.leftIcon - Icon on the left
 */
export default function Input({
    label,
    error,
    leftIcon,
    className = '',
    containerClassName = '',
    id,
    ...props
}) {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    return (
        <div className={`flex flex-col gap-1 ${containerClassName}`}>
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-heading ms-1">
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                {leftIcon && (
                    <div className="pointer-events-none absolute start-3 text-muted" aria-hidden="true">
                        {leftIcon}
                    </div>
                )}

                <input
                    className={`
            w-full min-h-12 text-base leading-6 py-2 px-3 rounded-control border bg-surface text-ink transition-colors outline-none focus:shadow-focus disabled:opacity-50
            ${leftIcon ? 'ps-10' : 'ps-3'}
            ${error ? 'border-danger' : 'border-line focus:border-[var(--primary-600)]'}
            ${className}
          `}
                    {...props}
                    id={inputId}
                    aria-invalid={error ? true : props['aria-invalid']}
                    aria-describedby={[props['aria-describedby'], error ? errorId : null].filter(Boolean).join(' ') || undefined}
                />
            </div>

            {error && (
                <span id={errorId} className="text-xs text-danger-text ms-1 mt-0.5">
                    {error}
                </span>
            )}
        </div>
    );
}
