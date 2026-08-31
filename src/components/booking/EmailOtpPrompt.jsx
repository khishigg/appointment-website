import useOtpCountdown from '../../hooks/useOtpCountdown';
import IdentityPromptFrame from './IdentityPromptFrame';

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
    isDesktop = false,
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
        <IdentityPromptFrame titleId="email-otp-prompt-title" descriptionId="email-otp-prompt-description" isDesktop={isDesktop}>
            <div className="identity-prompt__header">
                <h3 id="email-otp-prompt-title" className="identity-prompt__title">
                    И-мэйлээ баталгаажуулна уу
                </h3>
                <p id="email-otp-prompt-description" className="identity-prompt__description">
                    {destination || 'Таны и-мэйл'} хаяг руу илгээсэн 4 оронтой кодыг оруулна уу.
                </p>
            </div>

            <div className="identity-prompt__field">
                <label htmlFor="booking-email-otp" className="identity-prompt__label">
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
                    className="identity-prompt__input identity-prompt__input--otp"
                />
                <p id="booking-email-otp-help" className="identity-prompt__help">
                    {isVerifying ? 'Кодыг шалгаж байна...' : '4 цифр оруулмагц автоматаар шалгана.'}
                </p>
            </div>

            {error ? (
                <div className="identity-prompt__error" role="alert">
                    {error}
                </div>
            ) : null}

            {isExpired ? <span className="sr-only" role="status">Кодын хугацаа дууслаа</span> : null}

            <div className="identity-prompt__actions">
                <button
                    type="button"
                    onClick={onResend}
                    disabled={!canResend}
                    className="identity-prompt__button identity-prompt__button--secondary"
                >
                    {resendLabel}
                </button>
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isBusy}
                    className="identity-prompt__button identity-prompt__button--back"
                >
                    Буцах
                </button>
            </div>
        </IdentityPromptFrame>
    );
}
