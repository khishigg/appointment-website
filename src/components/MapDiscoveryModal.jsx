import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiMapPin, FiPhone, FiSearch, FiX } from 'react-icons/fi';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import ClinicMap from './map/ClinicMap';

const matchesSearch = (clinic, query) => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return true;

    return [clinic.name, clinic.address]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase().includes(normalizedQuery));
};

const ClinicLogo = ({ clinic }) => {
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [clinic.logoUrl]);

    if (!clinic.logoUrl || failed) {
        return (
            <span className="hospital-logo-fallback" aria-hidden="true">
                {clinic.logoInitial || clinic.name?.trim().charAt(0).toUpperCase() || 'Э'}
            </span>
        );
    }

    return (
        <img
            src={clinic.logoUrl}
            alt={`${clinic.name} logo`}
            className="hospital-logo-image"
            onError={() => setFailed(true)}
        />
    );
};

const MapDiscoveryModal = ({ isOpen, onClose, clinics = [] }) => {
    const navigate = useNavigate();
    const [selectedClinicId, setSelectedClinicId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const visibleClinics = useMemo(
        () => clinics.filter((clinic) => matchesSearch(clinic, searchQuery)),
        [clinics, searchQuery]
    );
    const selectedClinic = visibleClinics.find((clinic) => clinic.id === selectedClinicId) || null;

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (selectedClinicId && !selectedClinic) {
            setSelectedClinicId(null);
        }
    }, [selectedClinic, selectedClinicId]);

    if (!isOpen) return null;

    const handleBook = () => {
        if (!selectedClinic?.bookingEnabled) return;

        onClose();
        navigate(`/booking?clinicId=${encodeURIComponent(selectedClinic.id)}`, {
            state: { clinic: selectedClinic },
        });
    };

    return createPortal(
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-modal)] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Газрын зургаар эмнэлэг хайх"
        >
            <div className="map-discovery-topbar">
                <div className="map-discovery-search">
                    <FiSearch
                        className="text-faint"
                        size={20}
                        aria-hidden="true"
                    />
                    <input
                        autoFocus
                        type="search"
                        placeholder="Эмнэлэг эсвэл хаягаар хайх..."
                        className="w-full border-none bg-transparent text-body font-medium text-heading outline-none placeholder:text-faint"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        aria-label="Эмнэлэг эсвэл хаягаар хайх"
                    />
                </div>
                <div className="map-discovery-close">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-full w-full items-center justify-center border-none text-gray-800 outline-none transition-all hover:bg-white/20 active:scale-90"
                        aria-label="Хаах"
                    >
                        <FiX size={20} />
                    </button>
                </div>
            </div>

            <div className="relative flex-1 overflow-hidden">
                <ClinicMap
                    clinics={visibleClinics}
                    selectedClinicId={selectedClinicId}
                    onClinicSelect={(clinic) => setSelectedClinicId(clinic.id)}
                    className="clinic-map--discovery"
                />
            </div>

            <AnimatePresence>
                {selectedClinic ? (
                    <Motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="hospital-details-modal"
                    >
                        <div className="hospital-details-card">
                            <div aria-hidden="true" className="hospital-sheet-handle" />

                            <div className="hospital-details-header">
                                <div className="hospital-header-content">
                                    <span className="hospital-type-badge">
                                        {selectedClinic.bookingEnabled
                                            ? 'Онлайн цаг авах боломжтой'
                                            : 'Онлайн цаг авахгүй'}
                                    </span>
                                    <h3 className="hospital-name-title">
                                        {selectedClinic.name}
                                    </h3>
                                </div>
                                <div className="hospital-logo-container">
                                    <ClinicLogo clinic={selectedClinic} />
                                </div>
                            </div>

                            <div className="hospital-info-section">
                                {selectedClinic.address ? (
                                    <div className="hospital-info-item">
                                        <FiMapPin className="hospital-info-icon" size={18} />
                                        <p className="hospital-info-text">
                                            {selectedClinic.address}
                                        </p>
                                    </div>
                                ) : null}

                                {selectedClinic.phone ? (
                                    <div className="hospital-info-item">
                                        <FiPhone className="hospital-info-icon" size={18} />
                                        <p className="hospital-info-text hospital-info-phone">
                                            {selectedClinic.phone}
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            {!selectedClinic.bookingEnabled ? (
                                <p className="m-0 text-sm font-medium text-slate-600">
                                    Энэ эмнэлэг одоогоор онлайн цаг захиалга авахгүй байна.
                                </p>
                            ) : null}

                            <div className="hospital-actions-bar">
                                <button
                                    type="button"
                                    disabled={!selectedClinic.bookingEnabled}
                                    onClick={handleBook}
                                    className="hospital-btn-book"
                                >
                                    Цаг захиалах
                                </button>
                            </div>
                        </div>
                    </Motion.div>
                ) : null}
            </AnimatePresence>
        </Motion.div>,
        document.body
    );
};

export default MapDiscoveryModal;
