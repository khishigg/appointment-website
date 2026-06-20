import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiClock } from 'react-icons/fi';
import { useBookingStore } from '../../store/BookingStore';
import SummaryHeader from './SummaryHeader';
import BookingStepContent from './BookingStepContent';

/**
 * BookingDetails - Service selection and patient info overlay
 * Opens after user selects a time slot
 * Two-step flow: 1) Service Selection 2) Patient Info Form
 */
export default function BookingDetails() {
    const {
        isBookingDetailsOpen,
        closeBookingDetails,
        selectedClinic,
        selectedBranch,
        selectedTimeSlot,
        selectedService,
        selectService,
        patientInfo,
        setPatientInfo,
        resetBooking,
    } = useBookingStore();

    // Local state for current step
    const [step, setStep] = useState(1); // 1: Service, 2: Patient Info, 3: Payment
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // 'socialpay' | 'qpay' | null
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const services = [
        { id: 'lombo', name: 'Ломбо', description: 'Шүд цэвэрлэгээ, оношлогоо' },
        { id: 'shud-awah', name: 'Шүд авахуулах', description: 'Шүд авах эмчилгээ' },
    ];

    // Validation
    const isPhoneValid = patientInfo.phone && /^[0-9]{8}$/.test(patientInfo.phone);
    const canSubmit = patientInfo.firstName && patientInfo.lastName && isPhoneValid;

    const handleBack = () => {
        if (step === 3 && selectedPaymentMethod) {
            // Go back from QR view to payment selection
            setSelectedPaymentMethod(null);
        } else if (step === 3) {
            setStep(2);
        } else if (step === 2) {
            setStep(1);
        } else {
            closeBookingDetails();
            setStep(1);
            setSelectedPaymentMethod(null);
        }
    };

    const handleServiceSelect = (service) => {
        selectService(service);
    };

    const handleContinue = () => {
        if (step === 1 && selectedService) {
            setStep(2);
        } else if (step === 2 && canSubmit) {
            // Transition to payment step
            setStep(3);
        }
    };

    const handleInputChange = (field, value) => {
        // Phone number: only allow digits, max 8 chars
        if (field === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 8);
        }
        setPatientInfo({ [field]: value });
    };

    if (!isBookingDetailsOpen) return null;

    // Animation variants for step transitions (Vertical: Top to Bottom)
    const slideVariants = {
        enter: { opacity: 0, y: -30 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 30 },
    };

    return (
        <AnimatePresence>
            {isBookingDetailsOpen && (
                <div className="fixed inset-0 z-[9999]">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="absolute inset-x-0 bottom-0 top-0 bg-white flex flex-col overflow-hidden"
                    >
                        {/* ===== STICKY HEADER ===== */}
                        {step === 3 ? (
                            <SummaryHeader
                                patientInfo={patientInfo}
                                selectedClinic={selectedClinic}
                                selectedService={selectedService}
                                selectedBranch={selectedBranch}
                                selectedTimeSlot={selectedTimeSlot}
                            />
                        ) : step !== 4 && (
                            /* Default Header for Steps 1-2 */
                            <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                                <h2 className="flex-1 text-center text-base font-semibold text-gray-800 pr-8">
                                    {selectedClinic?.name || 'Эмнэлгийн нэр'}
                                </h2>
                            </div>
                        )}

                        {/* ===== SCROLLABLE CENTER ===== */}
                        <div className="flex-1 overflow-y-auto px-4 py-6">
                            <AnimatePresence mode="wait">
                                <BookingStepContent
                                    step={step}
                                    services={services}
                                    selectedService={selectedService}
                                    handleServiceSelect={handleServiceSelect}
                                    patientInfo={patientInfo}
                                    handleInputChange={handleInputChange}
                                    isPhoneValid={isPhoneValid}
                                    selectedPaymentMethod={selectedPaymentMethod}
                                    setSelectedPaymentMethod={setSelectedPaymentMethod}
                                    isProcessingPayment={isProcessingPayment}
                                    setIsProcessingPayment={setIsProcessingPayment}
                                    setStep={setStep}
                                    selectedTimeSlot={selectedTimeSlot}
                                    selectedBranch={selectedBranch}
                                    closeBookingDetails={closeBookingDetails}
                                    resetBooking={resetBooking}
                                    slideVariants={slideVariants}
                                />
                            </AnimatePresence>
                        </div>

                        {/* ===== STICKY FOOTER (Condensed) ===== */}
                        {step !== 4 && (
                            <div className="sticky bottom-0 z-30 bg-white border-t border-gray-100 px-4 py-3">
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <FiMapPin className="w-3.5 h-3.5" />
                                        <span>{selectedBranch?.name || 'Салбар'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiClock className="w-3.5 h-3.5" />
                                        <span>{selectedTimeSlot?.date || 'Огноо'} • {selectedTimeSlot?.time || 'Цаг'}</span>
                                    </div>
                                </div>
                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleBack}
                                        className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Буцах
                                    </button>
                                    {step !== 3 && (
                                        <button
                                            onClick={handleContinue}
                                            disabled={step === 1 ? !selectedService : (step === 2 ? !canSubmit : false)}
                                            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${(step === 1 ? selectedService : (step === 2 ? canSubmit : true))
                                                ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {step === 1 ? 'Үргэлжлүүлэх' : 'Төлбөр төлөх'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
