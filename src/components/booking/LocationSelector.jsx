import { useMemo, useState } from 'react';
import { FiClock, FiMapPin, FiPhone } from 'react-icons/fi';

import ClinicMap from '../map/ClinicMap';
import { buildLocationItems } from '../map/locationData';
import { getWorkingHours } from './clinicFormat';

const getMapItemId = (item) => `${item.type}-${item.id}`;

const BranchLocationCard = ({
    item,
    isSelected,
    onBookBranch,
    onShowOnMap,
}) => {
    const workingHours = getWorkingHours(item.source);

    return (
        <article
            className={`rounded-panel border bg-surface p-4 shadow-overlay transition-shadow ${
                isSelected ? 'booking-selection-border' : 'border-line-soft'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <h3 className="text-[16px] font-semibold leading-tight text-heading">
                    {item.name || 'Салбар'}
                </h3>
                {item.position ? (
                    <button
                        type="button"
                        onClick={onShowOnMap}
                        className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-control px-2 text-xs font-semibold text-primary transition-colors hover:bg-canvas"
                    >
                        <FiMapPin aria-hidden="true" />
                        Газрын зураг
                    </button>
                ) : null}
            </div>

            {item.address ? (
                <div className="mt-3 flex items-start gap-2 text-caption leading-5 text-muted">
                    <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
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

            <div className="mt-4">
                <button
                    type="button"
                    className="booking-cta-primary min-h-11 w-full rounded-control px-3 text-sm font-semibold"
                    onClick={() => onBookBranch?.(item.source)}
                >
                    Цаг захиалах
                </button>
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
}) {
    const [selectedMapItemId, setSelectedMapItemId] = useState(null);
    const locationItems = useMemo(
        () => buildLocationItems({ clinic, branches }),
        [branches, clinic]
    );
    const mapClinics = useMemo(
        () => locationItems.map((item) => ({
            ...item,
            id: getMapItemId(item),
        })),
        [locationItems]
    );
    const branchItems = locationItems.filter((item) => item.type === 'branch');

    if (isLoading) {
        return <div className="booking-data-state">Байршлын мэдээллийг уншиж байна...</div>;
    }

    if (error) {
        return (
            <div className="booking-data-state booking-data-state--error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={onRetry} className="booking-cta-outline rounded-control px-3 py-2 text-xs font-bold">Дахин оролдох</button>
            </div>
        );
    }

    if (locationItems.length === 0 && branchItems.length === 0) {
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

                <ClinicMap
                    clinics={mapClinics}
                    selectedClinicId={selectedMapItemId}
                    onClinicSelect={(item) => setSelectedMapItemId(item.id)}
                />

                <div className="mt-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:items-start">
                    {branchItems.length > 0 ? (
                        branchItems.map((item) => {
                            const mapItemId = getMapItemId(item);

                            return (
                                <BranchLocationCard
                                    key={mapItemId}
                                    item={item}
                                    isSelected={selectedMapItemId === mapItemId}
                                    onBookBranch={onBookBranch}
                                    onShowOnMap={() => setSelectedMapItemId(mapItemId)}
                                />
                            );
                        })
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
