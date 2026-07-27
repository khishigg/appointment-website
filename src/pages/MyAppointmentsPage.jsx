import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiCalendar,
    FiClock,
    FiUser,
    FiMapPin,
    FiPlus,
    FiArrowLeft,
    FiCheckCircle,
    FiPhone,
    FiMail
} from 'react-icons/fi';

// Sample mock/history appointments data (Can be populated from backend API or local storage in full integration)
const INITIAL_APPOINTMENTS = [
    {
        id: '69',
        aptNum: '69',
        date: '2026-07-29',
        time: '11:30',
        doctorName: 'test Tetst',
        specialty: 'Нүүр амны гажиг засалч',
        clinicName: 'AshidDental',
        branchName: 'Салбар 1',
        address: 'Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо',
        serviceName: 'Өөрөө түгжээтэй аппарат',
        duration: '30 мин',
        price: '2,235,000₮',
        patientName: 'Test test',
        phone: '34334554',
        email: 'teee@gmail.com',
        status: 'confirmed',
        statusLabel: 'Баталгаажсан',
        createdAt: '2026-07-27',
    }
];

export default function MyAppointmentsPage() {
    const navigate = useNavigate();
    const [appointments] = useState(INITIAL_APPOINTMENTS);

    return (
        <div className="min-h-screen bg-canvas pt-24 pb-16 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-1.5 rounded-pill text-muted hover:text-ink hover:bg-hover-surface transition-colors"
                                title="Буцах"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-ink">Захиалгын түүх</h1>
                        </div>
                        <p className="text-sm text-muted">Таны хийсэн цаг захиалгуудын жагсаалт ба дэлгэрэнгүй</p>
                    </div>

                    <Link
                        to="/booking"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-text rounded-control font-medium hover:bg-primary-hover active:scale-[0.98] transition-all text-sm shadow-sm"
                    >
                        <FiPlus className="w-4 h-4" />
                        Шинэ цаг авах
                    </Link>
                </div>

                {/* Appointments List */}
                {appointments.length === 0 ? (
                    <div className="bg-surface rounded-panel border border-line p-12 text-center shadow-card">
                        <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mx-auto mb-4 text-faint">
                            <FiCalendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-ink">Түүх байхгүй байна</h3>
                        <p className="text-sm text-muted mt-1 mb-6">Та одоогоор ямар нэгэн цаг захиалаагүй байна.</p>
                        <Link
                            to="/booking"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-text rounded-control font-semibold hover:bg-primary-hover transition-all"
                        >
                            Цаг захиалах
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((apt) => (
                            <motion.div
                                key={apt.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-surface rounded-panel border border-line p-5 md:p-6 shadow-card space-y-4"
                            >
                                {/* Card Header: Status & ID */}
                                <div className="flex items-center justify-between border-b border-line-soft pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                                            <FiCheckCircle className="w-3.5 h-3.5" />
                                            {apt.statusLabel}
                                        </span>
                                        <span className="text-xs font-medium text-faint">
                                            Захиалгын дугаар: #{apt.aptNum}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted">
                                        {apt.createdAt}
                                    </span>
                                </div>

                                {/* Main Grid Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {/* Date & Time */}
                                    <div className="flex items-start gap-3 p-3 rounded-control bg-canvas">
                                        <FiCalendar className="w-5 h-5 text-muted mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Огноо & Цаг</p>
                                            <p className="font-semibold text-ink mt-0.5">
                                                {apt.date} {apt.time}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Doctor */}
                                    <div className="flex items-start gap-3 p-3 rounded-control bg-canvas">
                                        <FiUser className="w-5 h-5 text-muted mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Эмч</p>
                                            <p className="font-semibold text-ink mt-0.5">{apt.doctorName}</p>
                                            {apt.specialty && (
                                                <p className="text-xs text-muted">{apt.specialty}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location / Clinic */}
                                    <div className="flex items-start gap-3 p-3 rounded-control bg-canvas">
                                        <FiMapPin className="w-5 h-5 text-muted mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Байршил</p>
                                            <p className="font-semibold text-ink mt-0.5">{apt.branchName} ({apt.clinicName})</p>
                                            {apt.address && (
                                                <p className="text-xs text-muted truncate max-w-xs">{apt.address}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Service */}
                                    <div className="flex items-start gap-3 p-3 rounded-control bg-canvas">
                                        <FiCheckCircle className="w-5 h-5 text-muted mt-0.5" />
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Үйлчилгээ</p>
                                            <p className="font-semibold text-ink mt-0.5">
                                                {apt.serviceName} {apt.duration ? `• ${apt.duration}` : ''}
                                            </p>
                                            <p className="text-xs font-medium text-primary mt-0.5">{apt.price}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Patient Info Footer */}
                                <div className="pt-3 border-t border-line-soft flex flex-wrap items-center justify-between text-xs text-muted gap-2">
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium text-ink">
                                            Өвчтөн: {apt.patientName}
                                        </span>
                                        {apt.phone && (
                                            <span className="flex items-center gap-1">
                                                <FiPhone className="w-3 h-3" />
                                                {apt.phone}
                                            </span>
                                        )}
                                        {apt.email && (
                                            <span className="flex items-center gap-1">
                                                <FiMail className="w-3 h-3" />
                                                {apt.email}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => navigate('/booking')}
                                        className="text-xs font-semibold text-ink hover:underline"
                                    >
                                        Дахин цаг авах →
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
