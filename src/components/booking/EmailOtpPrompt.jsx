import { motion as Motion } from 'framer-motion';
import useOtpCountdown from '../../hooks/useOtpCountdown';

const formatRemainingTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
};

export default function EmailOtpPrompt({
    code,
    destination,
    expiresAt,
    error,
    isSending,
    isVerifying,
    onCodeChange,
    onResend,
    onBack,
}) {
    const remainingSeconds = useOtpCountdown(expiresAt);
    const hasExpiry = remainingSeconds !== null;
    const isExpired = hasExpiry && remainingSeconds === 0;
    const isBusy = isSending || isVerifying;
    const canResend = !isBusy && (!hasExpiry || isExpired);

    const resendLabel = isSending
        ? 'Код илгээж байна...'
        : !isExpired && hasExpiry
            ? `Кодыг дахин илгээх (${formatRemainingTime(remainingSeconds)})`
            : 'Кодыг дахин илгээх';

    return (
        <div className="absolute inset-0 z-50 flex items-end bg-black/35 backdrop-blur-[2px]">
            <Motion.section
                role="dialog"
                aria-modal="true"
                aria-labelledby="email-otp-prompt-title"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 260 }}
                className="w-full rounded-t-[30px] border-t border-line-soft bg-surface px-5 pb-8 pt-3 shadow-[0_-16px_40px_rgb(15_23_42_/_0.16)] sm:mx-auto sm:max-w-xl sm:rounded-t-[32px] sm:px-6"
                style={{ paddingBottom: 'max(2rem, calc(2rem + env(safe-area-inset-bottom)))' }}
            >
                <div aria-hidden="true" className="mx-auto h-1 w-10 rounded-pill bg-slate-200" />

                <div className="mt-5">
                    <h3 id="email-otp-prompt-title" className="text-[19px] font-semibold leading-[1.35] tracking-[-0.015em] text-ink">
                        И-мэйлээ баталгаажуулна уу
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-muted">
                        {destination || 'Таны и-мэйл'} хаяг руу илгээсэн 4 оронтой кодыг оруулна уу.
                    </p>
                </div>

                <div className="mt-3">
                    <label htmlFor="booking-email-otp" className="mb-1.5 block text-sm font-medium text-heading">
                        Баталгаажуулах код
                    </label>
                    <input
                        id="booking-email-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={4}
                        autoFocus
                        value={code}
                        onChange={(event) => onCodeChange(event.target.value)}
                        disabled={isBusy || isExpired}
                        aria-invalid={Boolean(error)}
                        aria-describedby="booking-email-otp-help"
                        className={`w-full rounded-control border bg-surface px-4 py-3 text-center text-xl font-semibold tracking-[0.55em] outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-focus disabled:bg-canvas ${error ? 'border-danger' : 'border-line'}`}
                    />
                    <p id="booking-email-otp-help" className="mt-2 text-xs text-muted">
                        {isVerifying ? 'Кодыг шалгаж байна...' : '4 цифр оруулмагц автоматаар шалгана.'}
                    </p>
                </div>

                {error ? (
                    <div className="mt-4 rounded-panel border border-danger bg-danger-surface p-3 text-sm text-danger-text" role="alert">
                        {error}
                    </div>
                ) : null}

                {isExpired ? <span className="sr-only" role="status">Кодын хугацаа дууслаа</span> : null}

                <div className="mt-5 space-y-3">
                    <button
                        type="button"
                        onClick={onResend}
                        disabled={!canResend}
                        className="min-h-12 w-full rounded-[14px] border border-line-soft bg-canvas px-4 py-3 text-[15px] font-semibold text-heading transition-colors hover:bg-hover-surface active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {resendLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isBusy}
                        className="min-h-11 w-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:text-heading disabled:opacity-50"
                    >
                        Буцах
                    </button>
                </div>
            </Motion.section>
        </div>
    );
}
