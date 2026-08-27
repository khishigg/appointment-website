import { useEffect } from 'react';
import { motion as Motion } from 'framer-motion';

/**
 * Compact, iOS-style decision sheet shown over the completed patient form.
 * It deliberately keeps the form visible in the background, so choosing an
 * identity path never feels like navigating to another booking page.
 */
export default function RegistrationPrompt({
    isBusy,
    error,
    onAccept,
    onDecline,
    onDismiss,
    isBackdropDismissible = false,
}) {
    const canDismiss = isBackdropDismissible && !isBusy;

    useEffect(() => {
        if (!canDismiss) return undefined;

        const handleKeyDown = (event) => {
            if (event.key !== 'Escape') return;

            event.preventDefault();
            event.stopPropagation();
            onDismiss?.();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canDismiss, onDismiss]);

    const handleBackdropClick = (event) => {
        if (event.target !== event.currentTarget || !canDismiss) return;

        onDismiss?.();
    };

    return (
        <div
            className="absolute inset-0 z-50 flex items-end bg-black/35 backdrop-blur-[2px]"
            onClick={handleBackdropClick}
        >
            <Motion.section
                role="dialog"
                aria-modal="true"
                aria-labelledby="registration-prompt-title"
                aria-describedby="registration-prompt-description"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                className="w-full rounded-t-[30px] border-t border-line-soft bg-surface px-5 pb-8 pt-3 shadow-[0_-16px_40px_rgb(15_23_42_/_0.16)] sm:mx-auto sm:max-w-xl sm:rounded-t-[32px] sm:px-6"
                style={{ paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom)))' }}
                onClick={(event) => event.stopPropagation()}
            >
                <div aria-hidden="true" className="mx-auto h-1 w-10 rounded-pill bg-slate-200" />

                <div className="mt-5">
                    <h3 id="registration-prompt-title" className="max-w-[21rem] text-[19px] font-semibold leading-[1.35] tracking-[-0.015em] text-ink">
                        Та системд бүртгүүлэхийг зөвшөөрч байна уу?
                    </h3>
                    <p id="registration-prompt-description" className="mt-2 max-w-[23rem] text-[14px] leading-5 text-muted">
                        Та системд бүртгүүлснээр цаг захиалгын түүхээ харах болон захиалгаа солих бүрэн боломжтой болно.
                    </p>
                </div>

                {error ? (
                    <div className="mt-4 rounded-panel border border-danger bg-danger-surface p-3 text-sm text-danger-text" role="alert">
                        {error}
                    </div>
                ) : null}

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onDecline}
                        disabled={isBusy}
                        className="min-h-12 w-full rounded-[14px] border border-line-soft bg-canvas px-4 py-3 text-[15px] font-semibold text-heading transition-colors hover:bg-hover-surface active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
                    >
                        {isBusy ? 'Үргэлжилж байна...' : 'Үгүй'}
                    </button>
                    <button
                        type="button"
                        onClick={onAccept}
                        disabled={isBusy}
                        autoFocus
                        className="booking-cta-primary min-h-12 w-full rounded-[14px] px-4 py-3 text-[15px] font-semibold disabled:cursor-wait disabled:opacity-50"
                    >
                        Тийм
                    </button>
                </div>
            </Motion.section>
        </div>
    );
}
