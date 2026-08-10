import { useEffect, useMemo, useState } from 'react';
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import { FiClock, FiMapPin, FiPhone } from 'react-icons/fi';

import {
    createCircleMarkerIcon,
    defaultMapCenter,
    getGoogleMapsApiKey,
    googleMapStyles,
    hasGoogleMapsApiKey,
} from '../map/googleMapConfig';
import { buildLocationItems } from '../map/locationData';
import useResolvedLocationItems from '../map/useResolvedLocationItems';
import { hospitals } from '../../data/hospitals';
import { getTelHref, getWorkingHours } from './clinicFormat';

// GoogleMap нь эцэг элементийн БОДИТ өндрийг шаарддаг тул өндрийг wrapper div дээр
// Tailwind-ээр (responsive) өгч, энд 100% болгов. Wrapper-ийн h-* заавал байх ёстой.
const inlineMapContainerStyle = {
    width: '100%',
    height: '100%',
};

// Газрын зургийн responsive өндөр — map, fallback, loading гурав ижил байх ёстой.
const MAP_HEIGHT = 'h-[154px] md:h-[260px] lg:h-[300px]';

const defaultClinic = {
    id: 'mock-clinic',
    name: 'Dr.Angel Dental Clinic',
    address: 'Улаанбаатар, Сүхбаатар дүүрэг, 1-р хороо',
};

const defaultBranches = [
    {
        id: 1,
        name: 'Сүхбаатар салбар',
        address: '1-р хороо, Энхтайвны өргөн чөлөө',
        phone: '7000-7000',
        workingHours: '09:00 - 18:00',
        geo: { lat: 47.9185, lng: 106.9135 },
        isOpen: true,
    },
    {
        id: 2,
        name: 'Баянзүрх салбар',
        address: '3-р хороо, Зайсангийн гудамж',
        phone: '7000-7001',
        workingHours: '09:00 - 18:00',
        geo: { lat: 47.9048, lng: 106.9038 },
        isOpen: true,
    },
];

const LocationMap = ({ items, isResolving }) => {
    const [map, setMap] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const markers = items.filter((item) => item.position);

    useEffect(() => {
        if (!map || markers.length === 0 || !window.google?.maps?.LatLngBounds) return;

        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach((item) => bounds.extend(item.position));
        map.fitBounds(bounds);

        if (markers.length === 1) {
            map.setZoom(15);
        }
    }, [map, markers]);

    return (
        <div className={`relative ${MAP_HEIGHT} overflow-hidden rounded-panel border border-line-soft bg-surface shadow-overlay`}>
            <GoogleMap
                mapContainerStyle={inlineMapContainerStyle}
                center={markers[0]?.position || defaultMapCenter}
                zoom={13}
                onLoad={setMap}
                options={{
                    disableDefaultUI: true,
                    styles: googleMapStyles,
                    clickableIcons: false,
                    gestureHandling: 'greedy',
                }}
                onClick={() => setSelectedItem(null)}
            >
                {markers.map((item) => (
                    <Marker
                        key={`${item.type}-${item.id}`}
                        position={item.position}
                        onClick={() => setSelectedItem(item)}
                        icon={createCircleMarkerIcon({
                            color: item.type === 'clinic' ? '#0F172A' : '#0F5D8C',
                            scale: item.type === 'clinic' ? 10 : 8,
                        })}
                    />
                ))}

                {selectedItem?.position ? (
                    <InfoWindow
                        position={selectedItem.position}
                        onCloseClick={() => setSelectedItem(null)}
                    >
                        <div className="max-w-[190px]">
                            <p className="mb-1 text-xs font-semibold text-ink">
                                {selectedItem.name}
                            </p>
                            {selectedItem.address ? (
                                <p className="m-0 text-label leading-4 text-muted">
                                    {selectedItem.address}
                                </p>
                            ) : null}
                        </div>
                    </InfoWindow>
                ) : null}
            </GoogleMap>

            {markers.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/85 px-6 text-center text-xs font-medium leading-5 text-muted backdrop-blur-sm">
                    Байршил тодорхойлох мэдээлэл олдсонгүй.
                </div>
            ) : null}

            {isResolving ? (
                <div className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1.5 text-label font-semibold text-muted shadow-sm backdrop-blur">
                    Байршил тодорхойлж байна...
                </div>
            ) : null}
        </div>
    );
};

const MapFallback = () => (
    <div className={`flex ${MAP_HEIGHT} flex-col items-center justify-center gap-2 rounded-panel border border-line-soft bg-surface px-6 text-center shadow-overlay`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-heading">
            <FiMapPin size={20} />
        </div>
        <p className="text-sm font-semibold text-heading">
            Google Map тохиргоо хийгдээгүй байна.
        </p>
        <p className="text-xs leading-5 text-muted">
            VITE_GOOGLE_MAPS_API_KEY тохируулсны дараа газрын зураг харагдана.
        </p>
    </div>
);

const MapLoading = () => (
    <div className={`flex ${MAP_HEIGHT} items-center justify-center rounded-panel border border-line-soft bg-surface text-sm font-semibold text-faint shadow-overlay`}>
        Газрын зураг ачаалж байна...
    </div>
);

const LocationMapWithLoader = ({ items }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: getGoogleMapsApiKey(),
    });
    const {
        items: resolvedItems,
        isResolving,
    } = useResolvedLocationItems({
        items,
        enabled: isLoaded,
    });

    if (!isLoaded) {
        return <MapLoading />;
    }

    return <LocationMap items={resolvedItems} isResolving={isResolving} />;
};

const LocationMapArea = ({ items }) => {
    if (!hasGoogleMapsApiKey()) {
        return <MapFallback />;
    }

    return <LocationMapWithLoader items={items} />;
};

const BranchLocationCard = ({ item, onBookBranch }) => {
    const hasPhone = Boolean(item.phone);
    const telHref = getTelHref(item.phone);
    const workingHours = getWorkingHours(item);

    return (
        <article className="rounded-panel border border-line-soft bg-surface p-4 shadow-overlay">
            <h3 className="text-[16px] font-semibold leading-tight text-heading">
                {item.name || 'Салбар'}
            </h3>

            {item.address ? (
                <div className="mt-3 flex items-start gap-2 text-caption leading-5 text-muted">
                    <FiMapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-faint" />
                    <span>{item.address}</span>
                </div>
            ) : null}

            {workingHours ? (
                <div className="mt-2 flex items-center gap-2 text-caption font-medium leading-5 text-muted">
                    <FiClock className="h-4 w-4 text-faint" />
                    <span>{workingHours}</span>
                </div>
            ) : null}

            {item.phone ? (
                <div className="mt-2 flex items-center gap-2 text-caption font-medium leading-5 text-muted">
                    <FiPhone className="h-4 w-4 text-faint" />
                    <span>{item.phone}</span>
                </div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                    type="button"
                    className="min-h-11 rounded-control bg-primary px-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                    onClick={() => onBookBranch?.(item.source)}
                >
                    Цаг захиалах
                </button>
                {hasPhone && telHref ? (
                    <a
                        href={telHref}
                        className="flex min-h-11 items-center justify-center rounded-control border border-line px-3 text-center text-sm font-semibold text-heading no-underline transition-colors hover:bg-canvas"
                    >
                        Залгах
                    </a>
                ) : (
                    <button
                        type="button"
                        className="min-h-11 rounded-control border border-line-soft px-3 text-sm font-semibold text-faint"
                        disabled
                    >
                        Залгах
                    </button>
                )}
            </div>
        </article>
    );
};

export default function LocationSelector({
    clinic,
    branches = [],
    isLoading = false,
    error = '',
    onRetry,
    onBookBranch,
    useMockData = false,
}) {
    const displayClinic = clinic || (useMockData ? defaultClinic : null);
    const displayBranches = branches.length > 0 ? branches : (useMockData ? defaultBranches : []);
    const dynamicLocationItems = useMemo(
        () => buildLocationItems({ clinic: displayClinic, branches: displayBranches }),
        [displayClinic, displayBranches]
    );
    const legacyMapItems = useMemo(
        () => buildLocationItems({ branches: hospitals }),
        []
    );
    const mapItems = legacyMapItems;
    const branchItems = (useMockData ? legacyMapItems : dynamicLocationItems)
        .filter((item) => item.type === 'branch');

    if (isLoading) {
        return <div className="booking-data-state">Байршлын мэдээллийг уншиж байна...</div>;
    }

    if (error) {
        return (
            <div className="booking-data-state booking-data-state--error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={onRetry}>Дахин оролдох</button>
            </div>
        );
    }

    if (mapItems.length === 0 && branchItems.length === 0) {
        return (
            <div className="booking-data-empty">
                Байршлын мэдээлэл олдсонгүй.
            </div>
        );
    }

    return (
        <section id="location" className="bg-canvas px-4 py-5 md:px-6 lg:px-0">
            <div className="mx-auto max-w-md md:max-w-3xl lg:max-w-none">
                <div className="mb-4">
                    <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-heading">
                        Хаяг
                    </h2>
                    <p className="mt-2 text-body-sm leading-5 text-muted">
                        Эмнэлгийн байршил болон салбаруудын мэдээлэл
                    </p>
                </div>

                <LocationMapArea items={mapItems} />

                <div className="mt-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start">
                    {branchItems.length > 0 ? (
                        branchItems.map((item) => (
                            <BranchLocationCard
                                key={`${item.type}-${item.id}`}
                                item={item}
                                onBookBranch={onBookBranch}
                            />
                        ))
                    ) : (
                        <div className="booking-data-empty">
                            Бүртгэлтэй салбар олдсонгүй.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
