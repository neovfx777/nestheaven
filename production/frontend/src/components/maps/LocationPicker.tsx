import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
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

export interface MapLocation {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: MapLocation;
  onChange: (value: MapLocation) => void;
  heightClassName?: string;
  zoom?: number;
}

const DEFAULT_CENTER: MapLocation = { lat: 41.3111, lng: 69.2797 };

function Recenter({ value }: { value: MapLocation }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(value.lat) && Number.isFinite(value.lng)) {
      map.setView([value.lat, value.lng], map.getZoom(), { animate: true });
    }
  }, [map, value.lat, value.lng]);
  return null;
}

function ClickHandler({
  value,
  onChange,
}: {
  value: MapLocation;
  onChange: (value: MapLocation) => void;
}) {
  useMapEvents({
    click: (event) => {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return (
    <Marker
      position={[value.lat, value.lng]}
      draggable
      eventHandlers={{
        dragend: (event) => {
          const marker = event.target as L.Marker;
          const next = marker.getLatLng();
          onChange({ lat: next.lat, lng: next.lng });
        },
      }}
    />
  );
}

export function LocationPicker({
  value,
  onChange,
  heightClassName = 'h-80',
  zoom = 13,
}: LocationPickerProps) {
  const center = useMemo(() => {
    if (Number.isFinite(value.lat) && Number.isFinite(value.lng)) {
      return value;
    }
    return DEFAULT_CENTER;
  }, [value]);

  return (
    <div className={`w-full overflow-hidden rounded-lg border border-gray-200 ${heightClassName}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter value={center} />
        <ClickHandler value={center} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
