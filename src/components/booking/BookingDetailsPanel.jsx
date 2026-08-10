import { AnimatePresence } from 'framer-motion';

import SummaryHeader from './SummaryHeader';
import BookingStepContent from './BookingStepContent';
import BookingStepper from './BookingStepper';
import BookingSummaryCard from './BookingSummaryCard';
import RegistrationPrompt from './RegistrationPrompt';
import IdentityMethodPrompt from './IdentityMethodPrompt';
import EmailOtpPrompt from './EmailOtpPrompt';

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
    isIdentityMethodPromptOpen,
    isIdentityMethodPromptBusy,
    isEmailOtpPromptOpen,
    onAcceptRegistration,
    onDeclineRegistration,
    onSelectEmailIdentity,
    onBackToIdentityMethod,
    canViewBookings,
    onBack,
    onContinue,
    isSubmitting,
    isPrimaryDisabled,
    slideVariants,
}) {
    return (
        <>

            {/* Stepper — зөвхөн Desktop (lg+). Mobile дээр орон зай хэмнэхийн тулд нуугдана. */}
            <div className="hidden flex-shrink-0 border-b border-line-soft bg-surface lg:flex lg:items-center lg:justify-center lg:px-5">
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
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-5 lg:overflow-hidden lg:px-5 lg:py-4">
                <div className="relative lg:h-full lg:min-h-0">
                    <div className="lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2">
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
                            onFinish={onFinish}
                            onViewDetails={onViewDetails}
                            canViewBookings={canViewBookings}
                            slideVariants={slideVariants}
                        />
                    </AnimatePresence>
                    </div>

                    {/* Доод бүдгэрэл — гүйлгэх агуулга байгааг илэрхийлж, картууд
                        огцом тасрахаас сэргийлнэ. Хулганы үйлдэлд саад болохгүй. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-8 bg-gradient-to-t from-surface to-transparent lg:block"
                    />
                </div>

                {/* Баруун багана БҮХ алхамд — баталгаажилтад ч мөн (`confirmation`-ийн
                    утгыг эрхэмлэнэ). Өмнө нь энэ багана хоосон үлдэж, амжилтын
                    дэлгэц бүх зүйлээ зүүн баганад босоо өрснөөс gүйлгэлт үүсдэг байв. */}
                <BookingSummaryCard
                    className="hidden lg:block lg:self-start"
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
                                : 'bg-primary text-primary-text hover:bg-primary-hover active:scale-[0.98]'
                                }`}
                        >
                            {isSubmitting ? 'Илгээж байна...' : 'Үргэлжлүүлэх'}
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
                />
            ) : null}

            {isIdentityMethodPromptOpen ? (
                <IdentityMethodPrompt
                    error={identityError}
                    isBusy={isIdentityMethodPromptBusy}
                    onSelectEmail={onSelectEmailIdentity}
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
                    onBack={onBackToIdentityMethod}
                />
            ) : null}
        </>
    );
}
