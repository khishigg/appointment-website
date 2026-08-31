import { useEffect } from 'react';
import IdentityPromptFrame from './IdentityPromptFrame';

/**
 * Completed patient form дээрх responsive identity decision prompt.
 * Mobile/tablet sheet, desktop төв dialog нь нэг л booking урсгалыг хадгална.
 */
export default function RegistrationPrompt({
    isBusy,
    error,
    onAccept,
    onDecline,
    onDismiss,
    isBackdropDismissible = false,
    isDesktop = false,
}) {
    const canDismiss = !isDesktop && isBackdropDismissible && !isBusy;

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

    return (
        <IdentityPromptFrame
            titleId="registration-prompt-title"
            descriptionId="registration-prompt-description"
            isDesktop={isDesktop}
            dismissible={canDismiss}
            onDismiss={onDismiss}
        >
            <div className="identity-prompt__header">
                <h3 id="registration-prompt-title" className="identity-prompt__title">
                    Та системд бүртгүүлэхийг зөвшөөрч байна уу?
                </h3>
                <p id="registration-prompt-description" className="identity-prompt__description">
                    Та системд бүртгүүлснээр цаг захиалгын түүхээ харах болон захиалгаа солих бүрэн боломжтой болно.
                </p>
            </div>

            {error ? (
                <div className="identity-prompt__error" role="alert">
                    {error}
                </div>
            ) : null}

            <div className="identity-prompt__actions identity-prompt__actions--registration">
                <button
                    type="button"
                    onClick={onDecline}
                    disabled={isBusy}
                    className="identity-prompt__button identity-prompt__button--secondary"
                >
                    {isBusy ? 'Үргэлжилж байна...' : 'Үгүй'}
                </button>
                <button
                    type="button"
                    onClick={onAccept}
                    disabled={isBusy}
                    autoFocus
                    className="booking-cta-primary identity-prompt__button"
                >
                    Тийм
                </button>
            </div>
        </IdentityPromptFrame>
    );
}
