import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { formatProductDuration, formatProductPrice } from './productFormat';
import ServiceCard from './ServiceCard';
import BookingSummaryCard from './BookingSummaryCard';
import QPayPaymentStep from './QPayPaymentStep';

export default function BookingStepContent({
    step,
    services,
    isLoadingProducts,
    productError,
    onReloadLists,
    selectedService,
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
    selectedDoctor,
    selectedTimeSlot,
    selectedBranch,
    selectedClinic,
    paymentState,
    invoice,
    paymentError,
    isCheckingPayment,
    activePaymentView,
    onCheckPayment,
    onOpenBankApps,
    onOpenQr,
    onBackToPayment,
    onCancelPayment,
    slideVariants
}) {

    const [expandedServiceIds, setExpandedServiceIds] = useState(() => new Set());
    const toggleServiceDescription = (serviceId) => {
        setExpandedServiceIds((current) => {
            const next = new Set(current);
            if (next.has(serviceId)) {
                next.delete(serviceId);
            } else {
                next.add(serviceId);
            }
            return next;
        });
    };

    return (
        <div className={`mx-auto flex w-full max-w-md flex-1 flex-col md:max-w-lg lg:max-w-none ${step === 5 ? 'h-full min-h-0 max-w-none md:max-w-none' : ''}`}>
            {step === 1 && (
                <Motion.div
                    key="step1"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                >

                    <h3 className=" top-0 z-10 bg-surface pb-3 text-sm font-medium text-muted">
                        Үйлчилгээ сонгох
                    </h3>
                    {isLoadingProducts ? (
                        <p className="text-sm text-muted">Үйлчилгээний жагсаалтыг уншиж байна...</p>
                    ) : productError ? (
                        <div className="rounded-panel border border-danger bg-danger-surface p-4 text-sm text-danger-text" role="alert">
                            <p>{productError}</p>
                            <button
                                type="button"
                                onClick={onReloadLists}
                                className="booking-cta-outline mt-2 rounded-control px-3 py-2 text-xs font-semibold"
                            >
                                Дахин оролдох
                            </button>
                        </div>
                    ) : services.length === 0 ? (
                        <p className="text-sm text-muted">Бүртгэлтэй үйлчилгээ олдсонгүй.</p>
                    ) : (

                        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-3" role="radiogroup" aria-label="Үйлчилгээ сонгох">
                            {services.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    name={service.name}
                                    duration={formatProductDuration(service.durationMinutes)}
                                    price={formatProductPrice(service.price)}
                                    description={service.description}
                                    selected={selectedService?.id === service.id}
                                    expanded={expandedServiceIds.has(service.id)}
                                    onSelect={() => handleServiceSelect(service)}
                                    onToggle={() => toggleServiceDescription(service.id)}
                                />
                            ))}
                        </div>
                    )}
                </Motion.div>
            )}

            {step === 2 && showPersonalInfoForm && (
                <Motion.div
                    key="step2"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                >
                    <h3 className="text-sm font-medium text-muted mb-3">Хувийн мэдээлэл</h3>

                    {/* Овог | Нэр — mobile-д давхар gap-5 биш, ойрхон gap-3; өргөн дэлгэцэд хажуу хажуугаа gap-5 */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
                        <div>
                            <label className="block text-sm font-medium text-heading mb-1.5">
                                Овог <span className="text-danger-text">*</span>
                            </label>
                            <input
                                type="text"
                                value={patientInfo.lastName || ''}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                placeholder="Овог"
                                className="w-full px-4 py-3 border border-line rounded-control focus:ring-2 focus:ring-focus focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-heading mb-1.5">
                                Нэр <span className="text-danger-text">*</span>
                            </label>
                            <input
                                type="text"
                                value={patientInfo.firstName || ''}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                placeholder="Нэр"
                                className="w-full px-4 py-3 border border-line rounded-control focus:ring-2 focus:ring-focus focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-heading mb-1.5">
                            Утасны дугаар <span className="text-danger-text">*</span>
                        </label>

                        <div className="flex">
                            <span
                                aria-hidden="true"
                                className="flex items-center rounded-l-control border border-r-0 border-line bg-canvas px-3 text-sm font-medium text-muted"
                            >
                                +976
                            </span>
                            <input
                                type="tel"
                                inputMode="numeric"
                                value={patientInfo.phone || ''}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="8 оронтой дугаар"
                                aria-invalid={Boolean(patientInfo.phone && !isPhoneValid)}
                                className={`
                                    w-full min-w-0 rounded-r-control border px-4 py-3 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-focus
                                    ${patientInfo.phone && !isPhoneValid ? 'border-danger' : 'border-line'}
                                `}
                            />
                        </div>
                        {patientInfo.phone && !isPhoneValid && (
                            <p className="text-xs text-danger-text mt-1">8 оронтой дугаар оруулна уу</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-heading mb-1.5">
                            Имэйл <span className="text-danger-text">*</span>
                        </label>
                        <input
                            type="email"
                            value={patientInfo.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="name@example.com"
                            aria-invalid={Boolean(patientInfo.email && !isEmailValid)}
                            className={`w-full px-4 py-3 border rounded-control focus:ring-2 focus:ring-focus focus:border-transparent outline-none transition-all ${patientInfo.email && !isEmailValid ? 'border-danger' : 'border-line'}`}
                        />

                        {patientInfo.email && !isEmailValid && (
                            <p className="mt-1 text-xs text-danger-text">Зөв и-мэйл хаяг оруулна уу.</p>
                        )}

                    </div>

                    {submitError && (
                        <div className="rounded-panel border border-danger bg-danger-surface p-4" role="alert">
                            <p className="text-sm font-medium text-danger-text">{submitError}</p>
                            {needsNewTimeSlot && (
                                <button
                                    type="button"
                                    onClick={onPickAnotherTimeSlot}
                                    className="booking-cta-primary mt-3 w-full rounded-control py-2.5 text-sm font-semibold"
                                >
                                    Өөр цаг сонгох
                                </button>
                            )}
                        </div>
                    )}
                </Motion.div>
            )}

            {step === 2 && !showPersonalInfoForm && submitError && (
                <Motion.div
                    key="account-booking-error"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                >
                    <div className="rounded-panel border border-danger bg-danger-surface p-4" role="alert">
                        <p className="text-sm font-medium text-danger-text">{submitError}</p>
                        {needsNewTimeSlot && (
                            <button
                                type="button"
                                onClick={onPickAnotherTimeSlot}
                                className="booking-cta-primary mt-3 w-full rounded-control py-2.5 text-sm font-semibold"
                            >
                                Өөр цаг сонгох
                            </button>
                        )}
                    </div>
                </Motion.div>
            )}

            {step === 5 && (
                <Motion.div
                    key="step5"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="h-full min-h-0"
                >
                    <QPayPaymentStep
                        view={activePaymentView}
                        paymentState={paymentState}
                        invoice={invoice}
                        error={paymentError}
                        isChecking={isCheckingPayment}
                        confirmation={confirmation}
                        selectedClinic={selectedClinic}
                        selectedBranch={selectedBranch}
                        selectedDoctor={selectedDoctor}
                        selectedService={selectedService}
                        selectedTimeSlot={selectedTimeSlot}
                        onCheck={onCheckPayment}
                        onOpenBanks={onOpenBankApps}
                        onOpenQr={onOpenQr}
                        onBackToPayment={onBackToPayment}
                        onCancel={onCancelPayment}
                    />
                </Motion.div>
            )}

            {step === 6 && (
                <Motion.div
                    key="step6"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="flex w-full flex-1 flex-col items-center py-4 lg:items-center lg:py-0"
                >
                    <div className="flex flex-col items-center text-center lg:items-center lg:text-left">
                        <Motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                            className="mb-4 flex h-16 w-16 items-center justify-center rounded-pill bg-success shadow-card lg:mb-3 lg:h-12 lg:w-12"
                        >
                            <FiCheck className="h-8 w-8 stroke-[2.5] text-primary-text lg:h-6 lg:w-6" />
                        </Motion.div>

                        <h2 className="text-display text-ink lg:text-title">Захиалга амжилттай үүслээ!</h2>
                        <p className="mt-2 text-body text-muted lg:mt-1">
                            Таны төлбөр баталгаажиж, цаг амжилттай үүслээ.
                        </p>
                        <p className="hidden">
                            Таны имэйл хаяг уруу цаг захиалгын хуудас илгээлээ.
                        </p>
                    </div>

                    <BookingSummaryCard
                        className="mt-6 hidden w-full max-w-sm text-left md:block lg:hidden"
                        selectedDoctor={selectedDoctor}
                        selectedService={selectedService}
                        selectedTimeSlot={selectedTimeSlot}
                        selectedBranch={selectedBranch}
                        selectedClinic={selectedClinic}
                        confirmation={confirmation}
                    />
                </Motion.div>
            )}
        </div>
    );
}
