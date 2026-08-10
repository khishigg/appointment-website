import { motion as Motion } from 'framer-motion';
import { FiMail, FiSmartphone } from 'react-icons/fi';

/**
 * The second identity decision stays in the same visual family as the
 * registration-consent sheet. Only Gmail has a backend flow today; the phone
 * control intentionally remains an enabled visual choice without a handler.
 */
export default function IdentityMethodPrompt({ isBusy, error, onSelectEmail }) {
    return (
        <div className="absolute inset-0 z-50 flex items-end bg-black/35 backdrop-blur-[2px]">
            <Motion.section
                role="dialog"
                aria-modal="true"
                aria-labelledby="identity-method-prompt-title"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                className="w-full rounded-t-[30px] border-t border-line-soft bg-surface px-5 pb-8 pt-3 shadow-[0_-16px_40px_rgb(15_23_42_/_0.16)] sm:mx-auto sm:max-w-xl sm:rounded-t-[32px] sm:px-6"
                style={{ paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom)))' }}
            >
                <div aria-hidden="true" className="mx-auto h-1 w-10 rounded-pill bg-slate-200" />
                <h3 id="identity-method-prompt-title" className="mt-5 text-[19px] font-semibold leading-[1.35] tracking-[-0.015em] text-ink">
                    Баталгаажуулах арга сонгоно уу
                </h3>

                {error ? (
                    <div className="mt-4 rounded-panel border border-danger bg-danger-surface p-3 text-sm text-danger-text" role="alert">
                        {error}
                    </div>
                ) : null}

                <div className="mt-5 space-y-3">
                    <button
                        type="button"
                        onClick={onSelectEmail}
                        disabled={isBusy}
                        className="flex min-h-14 w-full items-center gap-3 rounded-[14px] border border-line-soft bg-canvas px-4 py-3 text-left text-[15px] font-semibold text-heading transition-colors hover:bg-hover-surface active:scale-[0.98] disabled:cursor-wait disabled:opacity-50"
                    >
                        <FiMail className="h-5 w-5 text-muted" aria-hidden="true" />
                        Gmail
                    </button>
                    <button
                        type="button"
                        className="flex min-h-14 w-full items-center gap-3 rounded-[14px] border border-line-soft bg-canvas px-4 py-3 text-left text-[15px] font-semibold text-heading transition-colors hover:bg-hover-surface active:scale-[0.98]"
                    >
                        <FiSmartphone className="h-5 w-5 text-muted" aria-hidden="true" />
                        Утасны дугаар
                    </button>
                </div>
            </Motion.section>
        </div>
    );
}
