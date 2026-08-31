import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion } from 'framer-motion';
import './IdentityPrompt.css';

const FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]';
const getFocusTargets = (panel) => Array.from(panel.querySelectorAll(FOCUSABLE))
    .filter((element) => element.tabIndex >= 0 && !element.matches(':disabled')
        && !element.closest('[inert]') && element.getClientRects().length > 0
        && getComputedStyle(element).visibility !== 'hidden');

const SHEET_VARIANTS = {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
};

const DIALOG_VARIANTS = {
    initial: { opacity: 0, scale: 0.96, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: 12 },
};

const SHEET_SPRING = { type: 'spring', damping: 30, stiffness: 260 };
const DIALOG_EASE = { duration: 0.2, ease: [0.16, 1, 0.3, 1] };

/**
 * Identity үе шатуудын responsive бүрхүүл.
 * Mobile/tablet дээр existing bottom sheet, desktop дээр төв dialog рендэрлэнэ.
 */
export default function IdentityPromptFrame({
    children,
    titleId,
    descriptionId,
    isDesktop = false,
    dismissible = false,
    onDismiss,
}) {
    const panelRef = useRef(null);
    const canDismiss = !isDesktop && dismissible && typeof onDismiss === 'function';

    useEffect(() => {
        const panel = panelRef.current;
        const keepFocusInside = () => {
            const active = document.activeElement;
            if (panel.contains(active) && !active.matches(':disabled')) return;
            (getFocusTargets(panel)[0] || panel).focus({ preventScroll: true });
        };

        // Keep the prompt's existing autoFocus. During loading all controls may
        // be disabled; the dialog itself remains a safe focus destination.
        keepFocusInside();
        document.addEventListener('focusin', keepFocusInside);
        const observer = new MutationObserver(keepFocusInside);
        observer.observe(panel, { subtree: true, attributes: true, attributeFilter: ['disabled'] });
        return () => {
            document.removeEventListener('focusin', keepFocusInside);
            observer.disconnect();
        };
    }, []);

    const handleKeyDown = (event) => {
        if (event.key !== 'Tab') return;
        event.stopPropagation();
        const panel = panelRef.current;
        const targets = getFocusTargets(panel);
        const index = targets.indexOf(document.activeElement);
        if (targets.length === 0) {
            event.preventDefault();
            panel.focus();
        } else if (index === -1 || (event.shiftKey ? index === 0 : index === targets.length - 1)) {
            event.preventDefault();
            targets[event.shiftKey ? targets.length - 1 : 0].focus();
        }
    };

    const handleBackdropClick = (event) => {
        if (event.target !== event.currentTarget || !canDismiss) return;

        onDismiss();
    };

    // Escape the underlying booking panel's transform/overflow clipping.
    return createPortal(
        <div
            className={`identity-prompt__overlay identity-prompt__overlay--${isDesktop ? 'desktop' : 'sheet'}`}
            onClick={handleBackdropClick}
        >
            <Motion.section
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={isDesktop ? DIALOG_VARIANTS : SHEET_VARIANTS}
                transition={isDesktop ? DIALOG_EASE : SHEET_SPRING}
                className="identity-prompt__panel"
                onKeyDownCapture={handleKeyDown}
                onClick={(event) => event.stopPropagation()}
            >
                {!isDesktop ? (
                    <div aria-hidden="true" className="identity-prompt__handle" />
                ) : null}
                {children}
            </Motion.section>
        </div>,
        document.body,
    );
}
