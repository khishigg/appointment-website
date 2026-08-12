import { MapContainer, TileLayer } from 'react-leaflet';

import ClinicMarker from './ClinicMarker';
import MapViewportController from './MapViewportController';
import {
    defaultMapCenter,
    defaultMapZoom,
    osmTileProvider,
} from './mapConfig';

const hasValidCoordinates = (clinic) => {
    const { lat, lng } = clinic?.position || {};

    return Number.isFinite(lat) && Number.isFinite(lng);
};

export default function ClinicMap({
    clinics = [],
    selectedClinicId = null,
    focusedClinicId = selectedClinicId,
    onClinicSelect,
    className = '',
}) {
    const clinicsWithCoordinates = clinics.filter(hasValidCoordinates);

    return (
        <div
            className={`clinic-map ${className}`.trim()}
            aria-label="Эмнэлгүүдийн газрын зураг"
        >
            <MapContainer
                center={defaultMapCenter}
                zoom={defaultMapZoom}
                className="clinic-map__canvas"
                scrollWheelZoom
                zoomControl={false}
            >
                <TileLayer
                    url={osmTileProvider.url}
                    attribution={osmTileProvider.attribution}
                    maxZoom={osmTileProvider.maxZoom}
                />

                <MapViewportController
                    clinics={clinicsWithCoordinates}
                    focusedClinicId={focusedClinicId}
                />

                {clinicsWithCoordinates.map((clinic) => (
                    <ClinicMarker
                        key={clinic.id}
                        clinic={clinic}
                        isSelected={clinic.id === selectedClinicId}
                        onSelect={onClinicSelect}
                    />
                ))}
            </MapContainer>

            {clinicsWithCoordinates.length === 0 ? (
                <div className="clinic-map__empty">
                    Газрын зурагт харуулах байршилтай эмнэлэг олдсонгүй.
                </div>
            ) : null}
        </div>
    );
}
