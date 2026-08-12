import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

export default function MapViewportController({
    clinics = [],
    focusedClinicId = null,
}) {
    const map = useMap();
    const lastFittedLocationsRef = useRef('');

    useEffect(() => {
        const positions = clinics
            .filter((clinic) => clinic.position)
            .map((clinic) => [clinic.position.lat, clinic.position.lng]);
        const locationsKey = positions
            .map(([lat, lng]) => `${lat},${lng}`)
            .sort()
            .join('|');

        if (!locationsKey || locationsKey === lastFittedLocationsRef.current) {
            return;
        }

        lastFittedLocationsRef.current = locationsKey;

        if (positions.length === 1) {
            map.setView(positions[0], 15);
            return;
        }

        map.fitBounds(L.latLngBounds(positions), {
            // Discovery map-ийн search bar-ийн доор marker label давхарлахгүйн тулд
            // top edge-д илүү safe area үлдээнэ.
            paddingTopLeft: [32, 104],
            paddingBottomRight: [32, 32],
            maxZoom: 15,
        });
    }, [clinics, map]);

    useEffect(() => {
        if (!focusedClinicId) return;

        const focusedClinic = clinics.find((clinic) => clinic.id === focusedClinicId);
        if (!focusedClinic?.position) return;

        map.flyTo(
            [focusedClinic.position.lat, focusedClinic.position.lng],
            Math.max(map.getZoom(), 15),
            { duration: 0.35 }
        );
    }, [clinics, focusedClinicId, map]);

    return null;
}
