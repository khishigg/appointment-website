import { useEffect, useMemo, useRef, useState } from 'react';

const geocodeCache = new Map();

const getCacheKey = (item) =>
    `${item.type || 'location'}:${item.address || ''}`.toLowerCase();

const createInitialItems = (items) =>
    items.map((item) => {
        if (item.position) {
            return { ...item, geocodeStatus: 'resolved' };
        }

        if (!item.needsGeocoding) {
            return { ...item, geocodeStatus: 'skipped' };
        }

        const cached = geocodeCache.get(getCacheKey(item));
        if (cached) {
            return {
                ...item,
                position: cached.position,
                geocodeStatus: cached.status,
            };
        }

        return { ...item, geocodeStatus: 'pending' };
    });

const geocodeAddress = (geocoder, address) =>
    new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
            const location = results?.[0]?.geometry?.location;

            if (status === 'OK' && location) {
                resolve({
                    position: {
                        lat: location.lat(),
                        lng: location.lng(),
                    },
                    status: 'resolved',
                });
                return;
            }

            resolve({
                position: null,
                status: 'failed',
            });
        });
    });

export default function useResolvedLocationItems({ items = [], enabled = false } = {}) {
    const requestIdRef = useRef(0);
    const [resolvedItems, setResolvedItems] = useState(() => createInitialItems(items));
    const [isResolving, setIsResolving] = useState(false);

    const itemSignature = useMemo(
        () => items.map((item) => `${item.type}:${item.id}:${item.address}:${Boolean(item.position)}`).join('|'),
        [items]
    );

    useEffect(() => {
        const requestId = ++requestIdRef.current;
        const initialItems = createInitialItems(items);
        setResolvedItems(initialItems);

        const pendingItems = initialItems.filter((item) => item.geocodeStatus === 'pending');
        const canGeocode =
            enabled &&
            pendingItems.length > 0 &&
            typeof window !== 'undefined' &&
            window.google?.maps?.Geocoder;

        if (!canGeocode) {
            setIsResolving(false);
            return undefined;
        }

        const geocoder = new window.google.maps.Geocoder();
        setIsResolving(true);

        Promise.all(
            pendingItems.map(async (item) => {
                const cacheKey = getCacheKey(item);
                const result = await geocodeAddress(geocoder, item.address);
                geocodeCache.set(cacheKey, result);

                return {
                    cacheKey,
                    result,
                };
            })
        ).then(() => {
            if (requestId !== requestIdRef.current) return;

            setResolvedItems((currentItems) =>
                currentItems.map((item) => {
                    if (item.geocodeStatus !== 'pending') return item;

                    const cached = geocodeCache.get(getCacheKey(item));
                    if (!cached) return item;

                    return {
                        ...item,
                        position: cached.position,
                        geocodeStatus: cached.status,
                    };
                })
            );
            setIsResolving(false);
        });

        return () => {
            requestIdRef.current += 1;
            setIsResolving(false);
        };
    }, [enabled, itemSignature, items]);

    const resolvedCount = resolvedItems.filter((item) => item.position).length;
    const failedCount = resolvedItems.filter((item) => item.geocodeStatus === 'failed').length;

    return {
        items: resolvedItems,
        isResolving,
        resolvedCount,
        failedCount,
    };
}
