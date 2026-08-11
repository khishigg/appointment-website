import { motion as Motion } from 'framer-motion';

export default function PasswordSetupPrompt({
    verifiedIdentity,
    password,
    confirmPassword,
    error,
    isSubmitting,
    onPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
    onBack,
}) {
    return (
        <div className="absolute inset-0 z-50 flex items-end bg-black/35 backdrop-blur-[2px]">
            <Motion.section
                role="dialog"
                aria-modal="true"
                aria-labelledby="password-setup-prompt-title"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                className="max-h-[calc(100dvh-env(safe-area-inset-bottom))] w-full overflow-y-auto rounded-t-[30px] border-t border-line-soft bg-surface px-5 pb-8 pt-3 shadow-[0_-16px_40px_rgb(15_23_42_/_0.16)] sm:mx-auto sm:max-w-xl sm:rounded-t-[32px] sm:px-6"
                style={{ paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom)))' }}
            >
                <div aria-hidden="true" className="mx-auto h-1 w-10 rounded-pill bg-slate-200" />

                <form onSubmit={onSubmit} className="mt-5">
                    <h3 id="password-setup-prompt-title" className="text-[19px] font-semibold leading-[1.35] tracking-[-0.015em] text-ink">
                        Нууц үг үүсгэх
                    </h3>

                    <div className="mt-5">
                        <label htmlFor="booking-verified-identity" className="mb-1.5 block text-sm font-medium text-heading">
                            Баталгаажсан и-мэйл
                        </label>
                        <input
                            id="booking-verified-identity"
                            value={verifiedIdentity}
                            readOnly
                            aria-readonly="true"
                            className="w-full rounded-control border border-line bg-canvas px-4 py-3 text-base text-muted outline-none"
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="booking-new-password" className="mb-1.5 block text-sm font-medium text-heading">
                            Нууц үг
                        </label>
                        <input
                            id="booking-new-password"
                            value={password}
                            onChange={(event) => onPasswordChange(event.target.value)}
                            type="password"
                            autoComplete="new-password"
                            autoFocus
                            disabled={isSubmitting}
                            aria-invalid={Boolean(error)}
                            className={`w-full rounded-control border bg-surface px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-focus disabled:bg-canvas ${error ? 'border-danger' : 'border-line'}`}
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="booking-confirm-password" className="mb-1.5 block text-sm font-medium text-heading">
                            Нууц үгээ давтах
                        </label>
                        <input
                            id="booking-confirm-password"
                            value={confirmPassword}
                            onChange={(event) => onConfirmPasswordChange(event.target.value)}
                            type="password"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            aria-invalid={Boolean(error)}
                            className={`w-full rounded-control border bg-surface px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-focus disabled:bg-canvas ${error ? 'border-danger' : 'border-line'}`}
                        />
                    </div>

                    {error ? (
                        <div className="mt-4 rounded-panel border border-danger bg-danger-surface p-3 text-sm text-danger-text" role="alert">
                            {error}
                        </div>
                    ) : null}

                    <div className="mt-5 space-y-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-h-12 w-full rounded-control bg-primary px-4 py-3 text-[15px] font-semibold text-primary-text shadow-card transition-all hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? 'Үүсгэж байна...' : 'Үүсгэх'}
                        </button>
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="min-h-11 w-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-heading disabled:opacity-50"
                        >
                            Буцах
                        </button>
                    </div>
                </form>
            </Motion.section>
        </div>
    );
}