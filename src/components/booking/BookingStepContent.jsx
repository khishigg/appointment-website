import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { parseLocalDateTime } from '../../api/appointments';
import { formatProductDuration, formatProductPrice } from './productFormat';
import ServiceCard from './ServiceCard';

// Сервер timezone тэмдэглэгээгүй орон нутгийн цаг буцаадаг тул мөрийг тэр хэвээр нь уншиж
// харуулна (шилжилт гаргахгүй). Задалж чадаагүй тохиолдолд түүхий мөрийг л харуулна.
const formatConfirmationDateTime = (value) => {
    const parsed = parseLocalDateTime(value);
    if (!parsed) return value || '-';

    const pad = (part) => String(part).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

// Баталгаажилтын мэдээллийн нэгж — icon-гүй, нягт grid нүд. label дээр, утга доор.
const InfoCell = ({ label, value, hint, className = '' }) => (
    <div className={`min-w-0 ${className}`}>
        <p className="text-label font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-ink break-words">{value || '-'}</p>
        {hint ? <p className="mt-0.5 text-xs leading-snug text-muted break-words">{hint}</p> : null}
    </div>
);

export default function BookingStepContent({
    step,
    services,
    isLoadingProducts,
    productError,
    onReloadLists,
    selectedService,
    handleServiceSelect,
    patientInfo,
    handleInputChange,
    isPhoneValid,
    submitError,
    needsNewTimeSlot,
    onPickAnotherTimeSlot,
    confirmation,
    selectedDoctor,
    selectedTimeSlot,
    selectedBranch,
    selectedClinic,
    onFinish,
    onViewDetails,
    slideVariants
}) {
    // Overlay доторх үйлчилгээ сонголт: карт бие = сонгох, chevron = тайлбар нээх.
    // Тайлбарын нээлттэй байдлыг сонголтоос тусад нь энд хадгална.
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
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-none flex-1 flex flex-col">
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
                    <h3 className="text-sm font-medium text-muted mb-3">Үйлчилгээ сонгох</h3>
                    {isLoadingProducts ? (
                        <p className="text-sm text-muted">Үйлчилгээний жагсаалтыг уншиж байна...</p>
                    ) : productError ? (
                        <div className="rounded-xl border border-red-200 bg-danger-surface p-4 text-sm text-danger-text" role="alert">
                            <p>{productError}</p>
                            <button
                                type="button"
                                onClick={onReloadLists}
                                className="mt-2 font-semibold underline"
                            >
                                Дахин оролдох
                            </button>
                        </div>
                    ) : services.length === 0 ? (
                        <p className="text-sm text-muted">Бүртгэлтэй үйлчилгээ олдсонгүй.</p>
                    ) : (
                        <div className="flex flex-col gap-4" role="radiogroup" aria-label="Үйлчилгээ сонгох">
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
                    <h3 className="text-sm font-medium text-muted mb-3">Хувийн мэдээлэл</h3>
                    <div>
                        <label className="block text-sm font-medium text-heading mb-1.5">
                            Овог <span className="text-danger">*</span>
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
                            Нэр <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            value={patientInfo.firstName || ''}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="Нэр"
                            className="w-full px-4 py-3 border border-line rounded-control focus:ring-2 focus:ring-focus focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-heading mb-1.5">
                            Утасны дугаар <span className="text-danger">*</span>
                        </label>
                        <input
                            type="tel"
                            value={patientInfo.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="8 оронтой дугаар"
                            className={`
                                w-full px-4 py-3 border rounded-control focus:ring-2 focus:ring-focus focus:border-transparent outline-none transition-all
                                ${patientInfo.phone && !isPhoneValid ? 'border-red-400' : 'border-line'}
                            `}
                        />
                        {patientInfo.phone && !isPhoneValid && (
                            <p className="text-xs text-danger mt-1">8 оронтой дугаар оруулна уу</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-heading mb-1.5">
                            Имэйл <span className="text-faint font-normal">(заавал биш)</span>
                        </label>
                        <input
                            type="email"
                            value={patientInfo.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="name@example.com"
                            className="w-full px-4 py-3 border border-line rounded-control focus:ring-2 focus:ring-focus focus:border-transparent outline-none transition-all"
                        />

                    </div>

                    {submitError && (
                        <div className="rounded-xl border border-red-200 bg-danger-surface p-4" role="alert">
                            <p className="text-sm font-medium text-danger-text">{submitError}</p>
                            {needsNewTimeSlot && (
                                <button
                                    type="button"
                                    onClick={onPickAnotherTimeSlot}
                                    className="mt-3 w-full py-2.5 rounded-control bg-primary text-primary-text text-sm font-semibold active:scale-[0.98] transition-all"
                                >
                                    Өөр цаг сонгох
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
                    className="flex-1 flex flex-col justify-between items-center text-center w-full py-4"
                >
                    {/* Upper Center Section: Orange Check Badge & Status Text */}
                    <div className="flex-1 flex flex-col items-center justify-center my-auto">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                            className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 shadow-lg shadow-orange-200 mb-4"
                        >
                            <FiCheck className="h-10 w-10 text-white stroke-[2.5]" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-ink">Захиалга баталгаажлаа!</h2>
                        <p className="mt-2 text-sm text-muted"> Таны имэйл хаяг уруу цаг захиалгын хуудас илгээлээ.</p>
                    </div>

                    {/* Bottom Section: Pinned Action Buttons */}
                    <div className="flex flex-col gap-3 w-full max-w-xs mt-auto pt-6 pb-2">
                        <button
                            type="button"
                            onClick={onViewDetails}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-control font-semibold shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
                        >
                            Захиалгын дэлгэрэнгүй
                        </button>
                        <button
                            type="button"
                            onClick={onFinish}
                            className="w-full py-3 px-4 rounded-control border border-line text-heading font-medium hover:bg-hover-surface active:scale-[0.98] transition-colors"
                        >
                            Дуусгах
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
