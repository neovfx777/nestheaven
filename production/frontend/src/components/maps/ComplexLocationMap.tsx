import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface ComplexLocationMapProps {
  latitude: number;
  longitude: number;
  locationText?: string;
  complexName?: string;
  heightClassName?: string;
  zoom?: number;
}

const DEFAULT_CENTER = { lat: 41.3111, lng: 69.2797 }; // Tashkent default

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [map, lat, lng]);
  return null;
}

export function ComplexLocationMap({
  latitude,
  longitude,
  locationText,
  complexName,
  heightClassName = 'h-64',
  zoom = 15,
}: ComplexLocationMapProps) {
  const center = useMemo(() => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { lat: latitude, lng: longitude };
    }
    return DEFAULT_CENTER;
  }, [latitude, longitude]);

  const hasValidCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  if (!hasValidCoordinates) {
    return (
      <div className={`w-full ${heightClassName} bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200`}>
        <div className="text-center text-gray-500">
          <p className="text-sm">Location coordinates not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden rounded-lg border border-gray-200 ${heightClassName}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={center.lat} lng={center.lng} />
        <Marker position={[center.lat, center.lng]}>
          <Popup>
            <div className="text-center">
              {complexName && <div className="font-semibold text-sm mb-1">{complexName}</div>}
              {locationText && <div className="text-xs text-gray-600">{locationText}</div>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
