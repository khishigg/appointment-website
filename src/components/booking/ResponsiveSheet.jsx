import { useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

import useDialogA11y from '../../hooks/useDialogA11y';

/**
 * Booking-ийн ганц presentation primitive: нэг агуулгыг гурван бүрхүүлээр рендэрлэнэ.
 *
 *   'sheet'  (mobile)  — доороос гарах bottom sheet, бүтэн дэлгэц
 *   'dialog' (tablet)  — төвлөрсөн цонх (640px), backdrop харагдана
 *   'wide'   (desktop) — төвлөрсөн цонх (960px), дотроо 2 багана багтаана
 *   'inline'           — overlay/backdrop/role="dialog" ОГТ БАЙХГҮЙ, зүгээр л панель
 *
 * Агуулга (children) бүх горимд ижил — зөвхөн бүрхүүл солигдоно.
 */

// Компонентоос ГАДНА: рендэр бүрт шинэ объект үүсгэвэл framer-motion дэмий сэргээнэ.
const FADE = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

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

const SPRING = { type: 'spring', damping: 28, stiffness: 220 };
const EASE = { duration: 0.2, ease: [0.16, 1, 0.3, 1] };

// Төвлөрсөн цонхны хэмжээ — бүрхүүл нь ижил, зөвхөн хэмжээ ялгаатай.
// `wide` нь агуулгаар өсдөггүй ТОГТМОЛ өндөртэй: ингэснээр баруун талын хураангуй
// карт хэзээ ч гүйхгүй, зөвхөн зүүн жагсаалт гүйнэ.
const DIALOG_SIZE = {
    dialog: 'w-[min(640px,92vw)] max-h-[88vh]',
    wide: 'w-[min(960px,94vw)] h-[min(680px,88vh)]',
};

export default function ResponsiveSheet({
    mode = 'sheet',
    open = false,
    onClose,
    dismissible = true,
    label,
    className = '',
    children,
}) {
    const panelRef = useRef(null);
    const isInline = mode === 'inline';

    useDialogA11y({
        enabled: !isInline,
        open,
        onClose,
        containerRef: panelRef,
        dismissible,
    });

    // Desktop: overlay биш — энгийн бүсэд суусан панель.
    if (isInline) {
        return (
            <section
                aria-label={label}
                className={`flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-card ${className}`}
            >
                {children}
            </section>
        );
    }

    const isSheet = mode === 'sheet';

    return (
        <AnimatePresence>
            {open ? (
                <div className="fixed inset-0 z-[var(--z-modal)]">
                    <Motion.div
                        {...FADE}
                        onClick={dismissible ? onClose : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
                    />

                    {/* Транформыг ЗӨВХӨН motion эзэмшинэ — төвлөрүүлэлт нь flex-ээр
                        (translate-1/2 хэрэглэвэл scale/y анимацтай зөрчилдөнө). */}
                    <div
                        className={
                            isSheet
                                ? 'absolute inset-0'
                                : 'pointer-events-none absolute inset-0 flex items-center justify-center p-6'
                        }
                    >
                        <Motion.div
                            ref={panelRef}
                            tabIndex={-1}
                            role="dialog"
                            aria-modal="true"
                            aria-label={label}
                            variants={isSheet ? SHEET_VARIANTS : DIALOG_VARIANTS}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={isSheet ? SPRING : EASE}
                            className={
                                isSheet
                                    ? `absolute inset-x-0 bottom-0 top-0 flex flex-col overflow-hidden bg-surface outline-none ${className}`
                                    : `pointer-events-auto flex ${DIALOG_SIZE[mode] || DIALOG_SIZE.dialog} flex-col overflow-hidden rounded-panel bg-surface shadow-modal outline-none ${className}`
                            }
                        >
                            {children}
                        </Motion.div>
                    </div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}
