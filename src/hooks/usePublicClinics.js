import { useCallback, useEffect, useState } from 'react';

import { getClinics, resolveClinicAssetUrl } from '../api/clinics';
import { getCoordinatePair } from '../components/map/locationData';

const asList = (data) => Array.isArray(data) ? data : data?.items || data?.data || [];

const getProductName = (product) => {
    if (typeof product === 'string') return product.trim();

    return String(
        product?.name
        ?? product?.Name
        ?? product?.productName
        ?? product?.ProductName
        ?? ''
    ).trim();
};

/**
 * Public clinic list-ийн нэг UI contract.
 * Home-ийн search болон санал болгож буй эмнэлгүүд ЯГ ижил API дата хэрэглэнэ.
 */
export const normalizePublicClinic = (tenant) => {
    const name = String(tenant?.name ?? tenant?.Name ?? 'Нэргүй эмнэлэг').trim();
    const logo = tenant?.logo ?? tenant?.Logo ?? '';
    const products = tenant?.products ?? tenant?.Products ?? [];

    return {
        id: tenant?.id ?? tenant?.Id,
        name,
        logoUrl: resolveClinicAssetUrl(logo),
        logoInitial: name.charAt(0).toUpperCase() || 'Э',
        address: tenant?.address ?? tenant?.Address ?? '',
        city: tenant?.city ?? tenant?.City ?? '',
        province: tenant?.province ?? tenant?.Province ?? tenant?.state ?? tenant?.State ?? '',
        phone: tenant?.phoneNumber ?? tenant?.PhoneNumber ?? tenant?.phone ?? tenant?.Phone ?? '',
        description: tenant?.description ?? tenant?.Description ?? '',
        email: tenant?.email ?? tenant?.Email ?? '',
        workingHours: tenant?.workingHoursJson ?? tenant?.WorkingHoursJson ?? '',
        position: getCoordinatePair(tenant),
        bookingEnabled: tenant?.bookingEnabled ?? tenant?.BookingEnabled ?? true,
        isSuggested: tenant?.isSuggested ?? tenant?.IsSuggested ?? false,
        productNames: Array.isArray(products)
            ? products.map(getProductName).filter(Boolean)
            : [],
    };
};

export default function usePublicClinics({ enabled = true } = {}) {
    const [clinics, setClinics] = useState([]);
    const [isLoading, setIsLoading] = useState(enabled);
    const [error, setError] = useState('');
    const [needsAuth, setNeedsAuth] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!enabled) return undefined;

        const controller = new AbortController();
        setIsLoading(true);
        setError('');
        setNeedsAuth(false);

        getClinics({ signal: controller.signal })
            .then((data) => {
                setClinics(
                    asList(data)
                        .map(normalizePublicClinic)
                        .filter((clinic) => clinic.id !== null && clinic.id !== undefined && clinic.id !== '')
                );
            })
            .catch((requestError) => {
                if (requestError.name === 'AbortError') return;

                setClinics([]);
                if (requestError.status === 401) {
                    setNeedsAuth(true);
                } else {
                    setError(requestError.message || 'Эмнэлгийн жагсаалт авахад алдаа гарлаа.');
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false);
            });

        return () => controller.abort();
    }, [enabled, reloadKey]);

    const retry = useCallback(() => setReloadKey((value) => value + 1), []);

    return { clinics, isLoading, error, needsAuth, retry };
}
