import { AnimatePresence } from 'framer-motion';

import SummaryHeader from './SummaryHeader';
import BookingStepContent from './BookingStepContent';

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
    submitError,
    needsNewTimeSlot,
    onPickAnotherTimeSlot,
    confirmation,
    onFinish,
    onViewDetails,
    onBack,
    onContinue,
    isSubmitting,
    isPrimaryDisabled,
    slideVariants,
}) {
    return (
        <>
            {step !== 4 ? (
                <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-line-soft bg-surface px-4 py-3">
                    <h2 className="flex-1 pr-8 text-center text-base font-semibold text-heading">
                        {selectedClinic?.name || 'Эмнэлгийн нэр'}
                    </h2>
                </div>
            ) : null}

            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
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
                        slideVariants={slideVariants}
                    />
                </AnimatePresence>
            </div>

            {step !== 4 ? (
                <div className="sticky bottom-0 z-30 border-t border-line-soft bg-surface px-4 py-3">
                    {/* Хураангуй — зөвхөн эмч, үйлчилгээ, огноо/цаг */}
                    <SummaryHeader
                        selectedService={selectedService}
                        selectedDoctor={selectedDoctor}
                        selectedTimeSlot={selectedTimeSlot}
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSubmitting}
                            className="flex-1 rounded-control border border-line px-4 py-3 font-medium text-heading transition-colors hover:bg-hover-surface disabled:opacity-50"
                        >
                            Буцах
                        </button>
                        <button
                            type="button"
                            onClick={onContinue}
                            disabled={isPrimaryDisabled}
                            className={`flex-1 rounded-control px-4 py-3 font-semibold transition-all duration-200 ${isPrimaryDisabled
                                ? 'cursor-not-allowed bg-disabled-bg text-faint'
                                : 'bg-primary text-primary-text hover:bg-primary-hover active:scale-[0.98]'
                                }`}
                        >
                            {step === 1
                                ? 'Үргэлжлүүлэх'
                                : isSubmitting ? 'Илгээж байна...' : 'Захиалах'}
                        </button>
                    </div>
                </div>
            ) : null}
        </>
    );
}
