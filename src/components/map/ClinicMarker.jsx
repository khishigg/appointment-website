import { CircleMarker, Tooltip } from 'react-leaflet';

export default function ClinicMarker({
    clinic,
    isSelected = false,
    onSelect,
}) {
    const { position, name } = clinic;

    if (!position) return null;

    return (
        <CircleMarker
            center={[position.lat, position.lng]}
            radius={isSelected ? 11 : 8}
            pathOptions={{
                color: '#ffffff',
                fillColor: isSelected ? '#d97706' : '#0f5d8c',
                fillOpacity: 1,
                weight: 3,
            }}
            eventHandlers={{
                click: () => onSelect?.(clinic),
            }}
        >
            {clinic.bookingEnabled ? (
                <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -8]}
                    opacity={1}
                    className="clinic-map-marker-label"
                >
                    {name}
                </Tooltip>
            ) : null}
        </CircleMarker>
    );
}
