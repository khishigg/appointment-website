import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiClock, FiMapPin } from 'react-icons/fi';

export default function BookingStepContent({
    step,
    services,
    selectedService,
    handleServiceSelect,
    patientInfo,
    handleInputChange,
    isPhoneValid,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isProcessingPayment,
    setIsProcessingPayment,
    setStep,
    selectedTimeSlot,
    selectedBranch,
    closeBookingDetails,
    resetBooking,
    slideVariants
}) {
    return (
        <div className="max-w-md mx-auto">
            {step === 1 && (
                <motion.div
                    key="step1"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                >
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Үйлчилгээ сонгох</h3>
                    <div className="space-y-3">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => handleServiceSelect(service)}
                                className={`
                                    w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between
                                    ${selectedService?.id === service.id
                                        ? 'border-gray-900 bg-gray-50 shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                `}
                            >
                                <div>
                                    <span className="block text-base font-semibold text-gray-900">
                                        {service.name}
                                    </span>
                                    <span className="block text-sm text-gray-500 mt-1">
                                        {service.description}
                                    </span>
                                </div>
                                {selectedService?.id === service.id && (
                                    <FiCheck className="w-5 h-5 text-gray-900" />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div
                    key="step2"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                >
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Хувийн мэдээлэл</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Овог <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={patientInfo.lastName || ''}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Овог"
                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Нэр <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={patientInfo.firstName || ''}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="Нэр"
                            className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Утасны дугаар <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={patientInfo.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="8 оронтой дугаар"
                            className={`
                                w-full px-4 py-3 border rounded-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all
                                ${patientInfo.phone && !isPhoneValid ? 'border-red-400' : 'border-gray-300'}
                            `}
                        />
                        {patientInfo.phone && !isPhoneValid && (
                            <p className="text-xs text-red-500 mt-1">8 оронтой дугаар оруулна уу</p>
                        )}
                    </div>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div
                    key="step3"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                >
                    {!selectedPaymentMethod ? (
                        <>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Төлбөрийн хэрэгсэл сонгох</h3>

                            {/* <div className="space-y-3">
                     
                                <button
                                    onClick={() => setSelectedPaymentMethod('socialpay')}
                                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-[#00A651] hover:bg-green-50/50 transition-all duration-200 flex items-center gap-4 group"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-[#00A651] flex items-center justify-center shadow-md">
                                        <span className="text-white font-bold text-lg">SP</span>
                                    </div>
                                    <div className="text-left flex-1">
                                        <span className="block text-base font-semibold text-gray-900 group-hover:text-[#00A651] transition-colors">
                                            SocialPay
                                        </span>
                                        <span className="block text-sm text-gray-500">
                                            Цахим түрийвчээр төлөх
                                        </span>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-[#00A651] transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>

                               
                                <button
                                    onClick={() => setSelectedPaymentMethod('qpay')}
                                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-[#E31837] hover:bg-red-50/50 transition-all duration-200 flex items-center gap-4 group"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-[#E31837] flex items-center justify-center shadow-md">
                                        <span className="text-white font-bold text-lg">QP</span>
                                    </div>
                                    <div className="text-left flex-1">
                                        <span className="block text-base font-semibold text-gray-900 group-hover:text-[#E31837] transition-colors">
                                            QPay
                                        </span>
                                        <span className="block text-sm text-gray-500">
                                            QR кодоор төлөх
                                        </span>
                                    </div>
                                    <div className="text-gray-300 group-hover:text-[#E31837] transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            </div> */}

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Төлбөр төлсний дараа таны захиалга баталгаажна
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">
                                {selectedPaymentMethod === 'socialpay' ? 'SocialPay' : 'QPay'} QR код
                            </h3>
                            <div
                                className={`
                                    w-48 h-48 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg
                                    ${selectedPaymentMethod === 'socialpay' ? 'bg-[#00A651]' : 'bg-[#E31837]'}
                                `}
                            >
                                {isProcessingPayment ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 15 }}
                                    >
                                        <FiCheck className="w-20 h-20 text-white" />
                                    </motion.div>
                                ) : (
                                    <div className="bg-white p-4 rounded-xl">
                                        <svg className="w-32 h-32" viewBox="0 0 100 100">
                                            <rect x="10" y="10" width="20" height="20" fill="#1a1a1a" />
                                            <rect x="35" y="10" width="10" height="10" fill="#1a1a1a" />
                                            <rect x="50" y="10" width="10" height="10" fill="#1a1a1a" />
                                            <rect x="70" y="10" width="20" height="20" fill="#1a1a1a" />
                                            <rect x="10" y="35" width="10" height="10" fill="#1a1a1a" />
                                            <rect x="35" y="35" width="30" height="30" fill="#1a1a1a" />
                                            <rect x="80" y="35" width="10" height="10" fill="#1a1a1a" />
                                            <rect x="10" y="50" width="10" height="10" fill="#1a1a1a" />
                                            <rect x="80" y="50" width="10" height="10" fill="#1a1a1a" />
                                            <rect x="10" y="70" width="20" height="20" fill="#1a1a1a" />
                                            <rect x="35" y="80" width="10" height="10" fill="#1a1a1a" />
                                            <rect x="50" y="70" width="10" height="10" fill="#1a1a1a" />
                                            <rect x="70" y="70" width="20" height="20" fill="#1a1a1a" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                                {isProcessingPayment
                                    ? 'Төлбөр амжилттай!'
                                    : `${selectedPaymentMethod === 'socialpay' ? 'SocialPay' : 'QPay'} апп-аар уншуулна уу`
                                }
                            </p>
                            {!isProcessingPayment && (
                                <button
                                    onClick={() => {
                                        setIsProcessingPayment(true);
                                        setTimeout(() => {
                                            setStep(4);
                                        }, 2000);
                                    }}
                                    className={`
                                        mt-4 px-6 py-3 rounded-xl text-white font-semibold transition-all
                                        ${selectedPaymentMethod === 'socialpay'
                                            ? 'bg-[#00A651] hover:bg-[#008c44]'
                                            : 'bg-[#E31837] hover:bg-[#c4142e]'}
                                    `}
                                >
                                    Төлбөр хийгдсэн (Mock)
                                </button>
                            )}
                        </div>
                    )}
                </motion.div>
            )}

            {step === 4 && (
                <motion.div
                    key="step4"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200"
                    >
                        <FiCheck className="w-12 h-12 text-white" />
                    </motion.div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">Захиалга баталгаажлаа!</h2>
                        <p className="text-gray-500 px-6">
                            Таны захиалга амжилттай бүртгэгдлээ. Бид удахгүй тантай холбогдох болно.
                        </p>
                    </div>
                    <div className="w-full max-w-xs bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4 text-left">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100">
                                <FiClock className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Цаг</p>
                                <p className="font-medium text-gray-900">{selectedTimeSlot?.time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100">
                                <FiMapPin className="w-4 h-4 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Байршил</p>
                                <p className="font-medium text-gray-900">{selectedBranch?.name}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            closeBookingDetails();
                            setTimeout(() => {
                                resetBooking();
                            }, 500);
                        }}
                        className="w-full max-w-xs py-4 bg-gray-900 text-white rounded-xl font-semibold shadow-lg shadow-gray-200 active:scale-[0.98] transition-all"
                    >
                        Дуусгах
                    </button>
                </motion.div>
            )}
        </div>
    );
}
