export const googleMapStyles = [
    {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#616161' }],
    },
    {
        featureType: 'all',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f5f5f5' }],
    },
    {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#eeeeee' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#c9e2ff' }],
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ visibility: 'off' }],
    },
];

export const googleMapContainerStyle = {
    width: '100%',
    height: '100%',
};

export const defaultMapCenter = {
    lat: 47.918,
    lng: 106.917,
};

export const getGoogleMapsApiKey = () =>
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';

export const hasGoogleMapsApiKey = () => Boolean(getGoogleMapsApiKey());

export const createCircleMarkerIcon = ({
    color = '#007AFF',
    scale = 10,
} = {}) => {
    if (typeof window === 'undefined') return undefined;

    const circlePath = window.google?.maps?.SymbolPath?.CIRCLE;
    if (!circlePath) return undefined;

    return {
        path: circlePath,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: '#FFFFFF',
        scale,
    };
};
