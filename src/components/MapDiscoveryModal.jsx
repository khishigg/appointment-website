import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { FiClock, FiMapPin, FiNavigation, FiPhone, FiSearch, FiX } from 'react-icons/fi';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { hospitals } from '../data/hospitals';
import {
    createCircleMarkerIcon,
    defaultMapCenter,
    getGoogleMapsApiKey,
    googleMapContainerStyle,
    googleMapStyles,
    hasGoogleMapsApiKey,
} from './map/googleMapConfig';

const GoogleMapFallback = () => (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <FiMapPin size={24} />
        </div>
        <p className="text-sm font-semibold text-gray-700">
            Google Map тохиргоо хийгдээгүй байна.
        </p>
        <p className="max-w-xs text-xs leading-5 text-gray-400">
            Газрын зураг харахын тулд VITE_GOOGLE_MAPS_API_KEY тохируулна.
        </p>
    </div>
);

const GoogleMapLoading = () => (
    <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500" />
        <p className="animate-pulse font-medium text-gray-400">
            Газрын зураг ачаалж байна...
        </p>
    </div>
);

const MapCanvas = ({
    searchQuery,
    selectedHospital,
    setSelectedHospital,
}) => {
    const [map, setMap] = useState(null);
    const [showSearchAreaBtn, setShowSearchAreaBtn] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: getGoogleMapsApiKey(),
    });

    const handleMarkerClick = (hospital) => {
        setSelectedHospital(hospital);
        if (map) {
            map.panTo(hospital.geo);
            map.setZoom(15);
        }
    };

    const handleMyLocation = () => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const nextLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(nextLocation);
                if (map) {
                    map.panTo(nextLocation);
                    map.setZoom(15);
                }
            },
            () => {
                alert('Байршил тогтооход алдаа гарлаа.');
            }
        );
    };

    if (!isLoaded) {
        return <GoogleMapLoading />;
    }

    return (
        <GoogleMap
            mapContainerStyle={googleMapContainerStyle}
            center={selectedHospital?.geo || defaultMapCenter}
            zoom={13}
            onLoad={setMap}
            options={{
                disableDefaultUI: true,
                styles: googleMapStyles,
                clickableIcons: false,
            }}
            onCenterChanged={() => {
                if (map && !showSearchAreaBtn) setShowSearchAreaBtn(true);
            }}
            onClick={() => setSelectedHospital(null)}
        >
            <div className="absolute bottom-10 right-4 z-[1000] h-14 w-14 overflow-hidden rounded-full bg-white/90 shadow-sm backdrop-blur-2xl">
                <button
                    type="button"
                    onClick={handleMyLocation}
                    className="flex h-full w-full items-center justify-center border-none text-navy-900 outline-none transition-all hover:bg-gray-50/50 active:scale-90"
                    aria-label="Миний байршил"
                >
                    <FiMapPin size={24} />
                </button>
            </div>

            {userLocation ? (
                <Marker
                    position={userLocation}
                    icon={createCircleMarkerIcon({ scale: 8 })}
                />
            ) : null}

            {hospitals
                .filter((hospital) =>
                    hospital.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((hospital) => (
                    <Marker
                        key={hospital.id}
                        position={hospital.geo}
                        onClick={() => handleMarkerClick(hospital)}
                        icon={createCircleMarkerIcon({ scale: 10 })}
                    />
                ))}
        </GoogleMap>
    );
};

const MapDiscoveryModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const canLoadGoogleMap = hasGoogleMapsApiKey();

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col"
        >
            <div className="absolute left-4 right-4 top-6 z-[1000] flex items-center gap-3">
                <div className="left-4 flex flex-1 items-center gap-4 rounded-full border-none bg-white/90 px-6 py-2 shadow-sm backdrop-blur-2xl">
                    <FiSearch
                        className="text-gray-400"
                        size={20}
                        style={{ position: 'relative', left: '15px' }}
                    />
                    <input
                        type="text"
                        placeholder="Эмнэлэг хайх..."
                        className="w-full border-none bg-transparent text-[15px] font-medium text-navy-900 outline-none placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </div>
                <div className="h-11 w-11 overflow-hidden rounded-full bg-white/90 shadow-sm backdrop-blur-2xl">
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
                {canLoadGoogleMap ? (
                    <MapCanvas
                        searchQuery={searchQuery}
                        selectedHospital={selectedHospital}
                        setSelectedHospital={setSelectedHospital}
                    />
                ) : (
                    <GoogleMapFallback />
                )}
            </div>

            <AnimatePresence>
                {selectedHospital && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="hospital-details-modal"
                    >
                        <div className="hospital-details-card">
                            <div className="hospital-details-header">
                                <div className="hospital-header-content">
                                    <span className="hospital-type-badge">
                                        {selectedHospital.type}
                                    </span>
                                    <h3 className="hospital-name-title">
                                        {selectedHospital.name}
                                    </h3>
                                </div>
                                <div className="hospital-logo-container">
                                    {selectedHospital.logo}
                                </div>
                            </div>

                            <div className="hospital-info-section">
                                <div className="hospital-info-item">
                                    <FiMapPin className="hospital-info-icon" size={18} />
                                    <p className="hospital-info-text">
                                        {selectedHospital.address}
                                    </p>
                                </div>

                                <div className="hospital-info-item">
                                    <FiClock className="hospital-info-icon" size={18} />
                                    <p className="hospital-info-text">
                                        {selectedHospital.hours}
                                    </p>
                                </div>

                                <div className="hospital-info-item">
                                    <FiPhone className="hospital-info-icon" size={18} />
                                    <p className="hospital-info-text hospital-info-phone">
                                        {selectedHospital.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="hospital-actions-bar">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        navigate('/booking', { state: { hospital: selectedHospital } });
                                    }}
                                    className="hospital-btn-book"
                                >
                                    Цаг захиалах
                                </button>
                                <button type="button" className="hospital-btn-nav">
                                    <FiNavigation size={18} />
                                    Чиглэл
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>,
        document.body
    );
};

export default MapDiscoveryModal;
