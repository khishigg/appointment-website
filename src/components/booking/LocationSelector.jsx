import { useEffect, useMemo, useState } from 'react';
import { GoogleMap, InfoWindow, Marker, useJsApiLoader } from '@react-google-maps/api';
import { FiMapPin, FiPhone } from 'react-icons/fi';

import {
    createCircleMarkerIcon,
    defaultMapCenter,
    getGoogleMapsApiKey,
    googleMapStyles,
    hasGoogleMapsApiKey,
} from '../map/googleMapConfig';
import { buildLocationItems } from '../map/locationData';
import useResolvedLocationItems from '../map/useResolvedLocationItems';

const inlineMapContainerStyle = {
    width: '100%',
    height: '220px',
};

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
        geo: { lat: 47.9185, lng: 106.9135 },
        isOpen: true,
    },
    {
        id: 2,
        name: 'Баянзүрх салбар',
        address: '3-р хороо, Зайсангийн гудамж',
        phone: '7000-7001',
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
        <div className="relative overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
            <GoogleMap
                mapContainerStyle={inlineMapContainerStyle}
                center={markers[0]?.position || defaultMapCenter}
                zoom={13}
                onLoad={setMap}
                options={{
                    disableDefaultUI: true,
                    styles: googleMapStyles,
                    clickableIcons: false,
                }}
                onClick={() => setSelectedItem(null)}
            >
                {markers.map((item) => (
                    <Marker
                        key={`${item.type}-${item.id}`}
                        position={item.position}
                        onClick={() => setSelectedItem(item)}
                        icon={createCircleMarkerIcon({
                            color: item.type === 'clinic' ? '#0F172A' : '#007AFF',
                            scale: item.type === 'clinic' ? 11 : 9,
                        })}
                    />
                ))}

                {selectedItem?.position ? (
                    <InfoWindow
                        position={selectedItem.position}
                        onCloseClick={() => setSelectedItem(null)}
                    >
                        <div className="max-w-[200px]">
                            <p className="mb-1 text-sm font-semibold text-slate-800">
                                {selectedItem.name}
                            </p>
                            {selectedItem.address ? (
                                <p className="m-0 text-xs leading-5 text-slate-500">
                                    {selectedItem.address}
                                </p>
                            ) : null}
                        </div>
                    </InfoWindow>
                ) : null}
            </GoogleMap>

            {markers.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 px-6 text-center text-sm font-medium text-slate-500 backdrop-blur-sm">
                    Байршил тодорхойлох мэдээлэл олдсонгүй.
                </div>
            ) : null}

            {isResolving ? (
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
                    Байршил тодорхойлж байна...
                </div>
            ) : null}
        </div>
    );
};

const MapFallback = () => (
    <div className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-[24px] border border-slate-100 bg-white px-6 text-center shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <FiMapPin size={22} />
        </div>
        <p className="text-sm font-semibold text-slate-700">
            Google Map тохиргоо хийгдээгүй байна.
        </p>
        <p className="text-xs leading-5 text-slate-400">
            VITE_GOOGLE_MAPS_API_KEY тохируулсны дараа газрын зураг харагдана.
        </p>
    </div>
);

const MapLoading = () => (
    <div className="flex h-[220px] items-center justify-center rounded-[24px] border border-slate-100 bg-white text-sm font-semibold text-slate-400 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
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

    return (
        <article className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
            <h3 className="text-lg font-semibold leading-tight text-slate-800">
                {item.name || 'Салбар'}
            </h3>

            {item.address ? (
                <div className="mt-3 flex items-start gap-2 text-sm leading-5 text-slate-500">
                    <FiMapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                    <span>{item.address}</span>
                </div>
            ) : null}

            {item.phone ? (
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <FiPhone className="h-4 w-4 text-slate-400" />
                    <span>{item.phone}</span>
                </div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                    onClick={() => onBookBranch?.(item.source)}
                >
                    Цаг захиалах
                </button>
                {hasPhone ? (
                    <a
                        href={`tel:${item.phone}`}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 no-underline transition-colors hover:bg-slate-50"
                    >
                        Залгах
                    </a>
                ) : (
                    <button
                        type="button"
                        className="rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-300"
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
    const locationItems = useMemo(
        () => buildLocationItems({ clinic: displayClinic, branches: displayBranches }),
        [displayClinic, displayBranches]
    );
    const branchItems = locationItems.filter((item) => item.type === 'branch');

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

    if (locationItems.length === 0) {
        return (
            <div className="booking-data-empty">
                Байршлын мэдээлэл олдсонгүй.
            </div>
        );
    }

    return (
        <section id="location" className="bg-gray-50 px-4 py-5 md:px-6">
            <div className="mx-auto max-w-md">
                <div className="mb-4">
                    <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-slate-800">
                        Хаяг
                    </h2>
                    <p className="mt-2 text-sm leading-5 text-slate-500">
                        Эмнэлгийн байршил болон салбаруудын мэдээлэл
                    </p>
                </div>

                <LocationMapArea items={locationItems} />

                <div className="mt-4 flex flex-col gap-4">
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
