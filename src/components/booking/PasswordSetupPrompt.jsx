import IdentityPromptFrame from './IdentityPromptFrame';

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
    isDesktop = false,
}) {
    return (
        <IdentityPromptFrame titleId="password-setup-prompt-title" isDesktop={isDesktop}>
            <form onSubmit={onSubmit} className="identity-prompt__form">
                <h3 id="password-setup-prompt-title" className="identity-prompt__title">
                    Нууц үг үүсгэх
                </h3>

                <div className="identity-prompt__field">
                    <label htmlFor="booking-verified-identity" className="identity-prompt__label">
                        Баталгаажсан и-мэйл
                    </label>
                    <input
                        id="booking-verified-identity"
                        value={verifiedIdentity}
                        readOnly
                        aria-readonly="true"
                        className="identity-prompt__input"
                    />
                </div>

                <div className="identity-prompt__field">
                    <label htmlFor="booking-new-password" className="identity-prompt__label">
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
                        className="identity-prompt__input"
                    />
                </div>

                <div className="identity-prompt__field">
                    <label htmlFor="booking-confirm-password" className="identity-prompt__label">
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
                        className="identity-prompt__input"
                    />
                </div>

                {error ? (
                    <div className="identity-prompt__error" role="alert">
                        {error}
                    </div>
                ) : null}

                <div className="identity-prompt__actions">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="booking-cta-primary identity-prompt__button"
                    >
                        {isSubmitting ? 'Үүсгэж байна...' : 'Үүсгэх'}
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="identity-prompt__button identity-prompt__button--back"
                    >
                        Буцах
                    </button>
                </div>
            </form>
        </IdentityPromptFrame>
    );
}
