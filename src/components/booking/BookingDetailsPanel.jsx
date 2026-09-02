import { AnimatePresence } from 'framer-motion';

import SummaryHeader from './SummaryHeader';
import BookingStepContent from './BookingStepContent';
import BookingStepper from './BookingStepper';
import BookingSummaryCard from './BookingSummaryCard';
import RegistrationPrompt from './RegistrationPrompt';
import EmailOtpPrompt from './EmailOtpPrompt';
import PasswordSetupPrompt from './PasswordSetupPrompt';
import { QPayCancelPrompt, QPayQrPrompt } from './QPayPaymentStep';

/**
 * BookingDetailsPanel — захиалгын алхмуудын АГУУЛГА (header + step + footer).
 *
 * Цэвэр presentational: ямар ч state эзэмшихгүй. Бүх state (step, isSubmitting,
 * confirmation г.м.) нь BookingDetails wrapper-т үлдэнэ — эс тэгвэл 409 алдааны дараа
 * хэрэглэгч формдоо буцаж ирэхэд `step` 1 болж мэдээлэл алдагдана.
 */
export default function BookingDetailsPanel({
    step,
    services,
    isLoadingProducts,
    productError,
    onReloadLists,
    selectedService,
    selectedDoctor,
    selectedTimeSlot,
    selectedBranch,
    selectedClinic,
    handleServiceSelect,
    patientInfo,
    showPersonalInfoForm,
    handleInputChange,
    isPhoneValid,
    isEmailValid,
    submitError,
    needsNewTimeSlot,
    onPickAnotherTimeSlot,
    confirmation,
    onFinish,
    onViewDetails,
    otpCode,
    otpDestination,
    otpExpiresAt,
    otpError,
    isSendingOtp,
    isVerifyingOtp,
    onOtpChange,
    onResendOtp,
    identityError,
    isRegistrationPromptOpen,
    isRegistrationPromptBusy,
    isEmailOtpPromptOpen,
    isPasswordSetupPromptOpen,
    passwordSetupIdentity,
    password,
    confirmPassword,
    passwordSetupError,
    isSettingPassword,
    onAcceptRegistration,
    onDeclineRegistration,
    onDismissRegistration,
    isRegistrationBackdropDismissible,
    isIdentityPromptDesktop,
    onBackToRegistrationPrompt,
    onPasswordChange,
    onConfirmPasswordChange,
    onPasswordSetupSubmit,
    onBackFromPasswordSetup,
    onBack,
    onContinue,
    isSubmitting,
    isPrimaryDisabled,
    paymentState,
    invoice,
    paymentError,
    isCheckingPayment,
    isCancellingPayment,
    activePaymentMethod,
    isCancelPaymentPromptOpen,
    onCheckPayment,
    onOpenBankApps,
    onOpenQr,
    onCancelPayment,
    onContinuePayment,
    onConfirmCancelPayment,
    onClosePaymentMethod,
    slideVariants,
}) {
    return (
        <>

            {/* Stepper — зөвхөн Desktop (lg+). Mobile дээр орон зай хэмнэхийн тулд нуугдана. */}
            <div className="hidden shrink-0 border-b border-line-soft bg-surface lg:flex lg:items-center lg:justify-center lg:px-5">
                <div className="lg:flex-none">
                    <BookingStepper step={step} />
                </div>
            </div>

            {/* Desktop: зүүн форм | баруун хураангуй карт. Mobile/tablet: нэг багана
                (хураангуйг footer-ийн компакт SummaryHeader гүйцэтгэнэ).

                ⚠️ Desktop-д гүйлгэлт ЗӨВХӨН зүүн баганад — ГАНЦ scrollbar.
                `lg:items-start` ХЭРЭГЛЭХГҮЙ: тэр нь мөрийн өндрийг агуулгаар тодорхойлж,
                зүүн баганын `lg:h-full`-тэй зөрчилдөн хоёр дахь gүйлгэлт үүсгэдэг байв.
                Оронд нь grid stretch хэвээр үлдэж, хураангуй карт `lg:self-start` авна. */}
            <div className={`flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 lg:min-h-0 lg:px-5 lg:py-4 ${step === 5
                ? activePaymentMethod === 'banks'
                    ? 'booking-payment-stage min-h-0 overflow-x-hidden overflow-y-auto px-4 py-5 lg:block lg:overflow-hidden lg:px-5 lg:py-4'
                    : 'booking-payment-stage h-[100dvh] min-h-0 overflow-hidden px-0 py-0 lg:block lg:h-auto lg:overflow-hidden lg:px-5 lg:py-4'
                : 'lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 lg:overflow-hidden'
            }`}>
                <div className={`relative lg:h-full lg:min-h-0 ${step === 5 ? 'h-full min-h-0' : ''}`}>
                    <div className={`lg:no-scrollbar lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2 ${step === 5 && activePaymentMethod !== 'banks' ? 'h-full min-h-0 overflow-hidden lg:overflow-y-auto' : ''}`}>
                    <AnimatePresence mode="wait">
                        <BookingStepContent
                            step={step}
                            services={services}
                            isLoadingProducts={isLoadingProducts}
                            productError={productError}
                            onReloadLists={onReloadLists}
                            selectedService={selectedService}
                            handleServiceSelect={handleServiceSelect}
                            patientInfo={patientInfo}
                            showPersonalInfoForm={showPersonalInfoForm}
                            handleInputChange={handleInputChange}
                            isPhoneValid={isPhoneValid}
                            isEmailValid={isEmailValid}
                            submitError={submitError}
                            needsNewTimeSlot={needsNewTimeSlot}
                            onPickAnotherTimeSlot={onPickAnotherTimeSlot}
                            confirmation={confirmation}
                            selectedTimeSlot={selectedTimeSlot}
                            selectedBranch={selectedBranch}
                            selectedClinic={selectedClinic}
                            selectedDoctor={selectedDoctor}
                            paymentState={paymentState}
                            invoice={invoice}
                            paymentError={paymentError}
                            isCheckingPayment={isCheckingPayment}
                            isCancellingPayment={isCancellingPayment}
                            activePaymentView={activePaymentMethod}
                            onCheckPayment={onCheckPayment}
                            onOpenBankApps={onOpenBankApps}
                            onOpenQr={onOpenQr}
                            onBackToPayment={onClosePaymentMethod}
                            onCancelPayment={onCancelPayment}
                            slideVariants={slideVariants}
                        />
                    </AnimatePresence>
                    </div>

                    {/* Доод бүдгэрэл — гүйлгэх агуулга байгааг илэрхийлж, картууд
                        огцом тасрахаас сэргийлнэ. Хулганы үйлдэлд саад болохгүй. */}
                    {step !== 5 ? <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-8 bg-gradient-to-t from-surface to-transparent lg:block"
                    /> : null}
                </div>

                {/* Баруун багана БҮХ алхамд — баталгаажилтад ч мөн (`confirmation`-ийн
                    утгыг эрхэмлэнэ). Өмнө нь энэ багана хоосон үлдэж, амжилтын
                    дэлгэц бүх зүйлээ зүүн баганад босоо өрснөөс gүйлгэлт үүсдэг байв. */}
                <BookingSummaryCard
                    className={step === 5 ? 'hidden' : 'hidden lg:block lg:self-start'}
                    selectedDoctor={selectedDoctor}
                    selectedService={selectedService}
                    selectedTimeSlot={selectedTimeSlot}
                    selectedBranch={selectedBranch}
                    selectedClinic={selectedClinic}
                    confirmation={confirmation}
                />
            </div>

            {step === 1 || step === 2 ? (
                <div className="sticky bottom-0 z-30 border-t border-line-soft bg-surface px-4 py-3 lg:px-5 lg:py-2.5">
                    {/* Компакт хураангуй — desktop-д баруун баганын карт үүнийг орлоно. */}
                    <div className="lg:hidden">
                        <SummaryHeader
                            selectedService={selectedService}
                            selectedDoctor={selectedDoctor}
                            selectedTimeSlot={selectedTimeSlot}
                        />
                    </div>
                    <div className="flex gap-3 lg:justify-end">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="flex-1 rounded-control border border-line px-4 py-3 font-medium text-heading transition-colors hover:bg-hover-surface disabled:opacity-50 lg:flex-none lg:px-6 lg:py-2 lg:text-sm"
                        >
                            Буцах
                        </button>
                        <button
                            type="button"
                            onClick={onContinue}
                            disabled={isPrimaryDisabled}
                            className={`flex-1 rounded-control px-4 py-3 font-semibold transition-all duration-200 lg:flex-none lg:px-6 lg:py-2 lg:text-sm ${isPrimaryDisabled
                                ? 'cursor-not-allowed bg-disabled-bg text-disabled-text'
                                : 'booking-cta-primary'
                                }`}
                        >
                            {isSubmitting ? 'Илгээж байна...' : 'Үргэлжлүүлэх'}
                        </button>
                    </div>
                </div>
            ) : null}

            {step === 6 ? (
                <div className="sticky bottom-0 z-30 border-t border-line-soft bg-surface px-4 py-3 lg:px-5 lg:py-2.5">
                    <div className="mx-auto flex w-full max-w-sm flex-col gap-3 lg:max-w-none lg:flex-row lg:justify-center">
                        <button
                            type="button"
                            onClick={onViewDetails}
                            className="booking-cta-primary min-h-12 w-full rounded-control px-4 py-3 font-semibold lg:min-h-0 lg:w-auto lg:px-5 lg:py-2 lg:text-sm"
                        >
                            Захиалгын дэлгэрэнгүй
                        </button>
                        <button
                            type="button"
                            onClick={onFinish}
                            className="min-h-12 w-full rounded-control border border-line bg-surface px-4 py-3 font-medium text-heading transition-colors hover:bg-hover-surface focus:outline-none focus:ring-2 focus:ring-focus active:scale-[0.98] lg:min-h-0 lg:w-auto lg:px-5 lg:py-2 lg:text-sm"
                        >
                            Дуусгах
                        </button>
                    </div>
                </div>
            ) : null}

            {isRegistrationPromptOpen ? (
                <RegistrationPrompt
                    error={identityError}
                    isBusy={isRegistrationPromptBusy}
                    onAccept={onAcceptRegistration}
                    onDecline={onDeclineRegistration}
                    onDismiss={onDismissRegistration}
                    isBackdropDismissible={isRegistrationBackdropDismissible}
                    isDesktop={isIdentityPromptDesktop}
                />
            ) : null}

            {isEmailOtpPromptOpen ? (
                <EmailOtpPrompt
                    code={otpCode}
                    destination={otpDestination}
                    expiresAt={otpExpiresAt}
                    error={otpError}
                    isSending={isSendingOtp}
                    isVerifying={isVerifyingOtp}
                    onCodeChange={onOtpChange}
                    onResend={onResendOtp}
                    onBack={onBackToRegistrationPrompt}
                    isDesktop={isIdentityPromptDesktop}
                />
            ) : null}

            {isPasswordSetupPromptOpen ? (
                <PasswordSetupPrompt
                    verifiedIdentity={passwordSetupIdentity}
                    password={password}
                    confirmPassword={confirmPassword}
                    error={passwordSetupError}
                    isSubmitting={isSettingPassword}
                    onPasswordChange={onPasswordChange}
                    onConfirmPasswordChange={onConfirmPasswordChange}
                    onSubmit={onPasswordSetupSubmit}
                    onBack={onBackFromPasswordSetup}
                    isDesktop={isIdentityPromptDesktop}
                />
            ) : null}

            {activePaymentMethod === 'qr' ? (
                <QPayQrPrompt
                    invoice={invoice}
                    paymentState={paymentState}
                    isChecking={isCheckingPayment}
                    onCheck={onCheckPayment}
                    onOpenBanks={onOpenBankApps}
                    onClose={onClosePaymentMethod}
                />
            ) : null}

            {isCancelPaymentPromptOpen ? (
                <QPayCancelPrompt
                    onContinue={onContinuePayment}
                    onConfirm={onConfirmCancelPayment}
                    isSubmitting={isCancellingPayment}
                />
            ) : null}
        </>
    );
}
