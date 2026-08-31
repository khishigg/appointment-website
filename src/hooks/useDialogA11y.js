import { useEffect, useRef } from 'react';

const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Modal/dialog-ийн a11y: Esc-ээр хаах, focus trap, focus сэргээх, body scroll-lock.
 *
 * `enabled: false` (desktop дээр рэйл нь dialog БИШ) үед бүх effect эрт гарна —
 * inline горимд Esc юу ч хаахгүй, focus чөлөөтэй, хуудас хэвийн гүйнэ.
 *
 * ЖИЧ: booking-д TimeSlotModal ба BookingDetails нэгэн зэрэг нээгддэггүй
 * (TimeButton эхлээд хааж, дараа нь нөгөөг нээдэг) тул scroll-lock-д counter хэрэггүй.
 */
export default function useDialogA11y({
    enabled,
    open,
    onClose,
    containerRef,
    dismissible = true,
    focusTrapPaused = false,
}) {
    const previouslyFocused = useRef(null);
    const active = enabled && open;

    // Esc-ээр хаах
    useEffect(() => {
        if (!active || !dismissible) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onClose?.();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [active, dismissible, onClose]);

    // Body scroll-lock
    useEffect(() => {
        if (!active) return undefined;

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [active]);

    // Focus: нээхэд панель руу, хаахад нээсэн элемент рүү буцаана
    useEffect(() => {
        if (!active) return undefined;

        previouslyFocused.current = document.activeElement;

        return () => {
            previouslyFocused.current?.focus?.();
        };
    }, [active, containerRef]);

    // A nested identity dialog owns focus while open. Keep the parent's
    // scroll lock and external focus restoration alive during that time.
    useEffect(() => {
        if (!active || focusTrapPaused) return;
        const node = containerRef.current;
        if (node && !node.contains(document.activeElement)) node.focus();
    }, [active, containerRef, focusTrapPaused]);

    // Focus trap — Tab нь панелийн дотор эргэлдэнэ
    useEffect(() => {
        if (!active || focusTrapPaused) return undefined;

        const onKeyDown = (event) => {
            if (event.key !== 'Tab') return;

            const node = containerRef.current;
            if (!node) return;

            const items = Array.from(node.querySelectorAll(FOCUSABLE))
                .filter((el) => el.offsetParent !== null && !el.closest('[inert]'));
            if (items.length === 0) {
                event.preventDefault();
                node.focus();
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];

            if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [active, containerRef, focusTrapPaused]);
}
