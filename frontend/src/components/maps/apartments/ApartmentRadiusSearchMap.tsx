import { useEffect, useMemo, useState } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Apartment } from '../../../api/apartments';
import { useApartmentMapSearchStore } from '../../../stores/apartmentMapSearchStore';
import { createPriceMarkerIcon } from './PriceMarkerIcon';

const DEFAULT_CENTER = { lat: 41.3111, lng: 69.2797 }; // Tashkent

function CenterSync() {
  const center = useApartmentMapSearchStore((s) => s.center);
  const setCenter = useApartmentMapSearchStore((s) => s.setCenter);
  const setSelectedApartmentId = useApartmentMapSearchStore((s) => s.setSelectedApartmentId);

  useMapEvents({
    moveend: (event) => {
      const c = event.target.getCenter();
      setCenter({ lat: c.lat, lng: c.lng });
    },
    click: (event) => {
      setCenter({ lat: event.latlng.lat, lng: event.latlng.lng });
      setSelectedApartmentId(null);
    },
  });

  return null;
}

function PanToCenter() {
  const center = useApartmentMapSearchStore((s) => s.center);
  const map = useMap();

  useEffect(() => {
    const current = map.getCenter();
    const delta = Math.abs(current.lat - center.lat) + Math.abs(current.lng - center.lng);
    if (delta < 1e-7) return;
    map.panTo([center.lat, center.lng], { animate: true, duration: 0.25 });
  }, [center.lat, center.lng, map]);

  return null;
}

function createCenterIcon() {
  return L.divIcon({
    className: 'nh-center-marker',
    html: '<span class="nh-center-marker__dot"></span>',
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

function apartmentCoords(apartment: Apartment) {
  const lat = apartment.complex?.locationLat ?? null;
  const lng = apartment.complex?.locationLng ?? null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat: lat as number, lng: lng as number };
}

export function ApartmentRadiusSearchMap({
  apartments,
  isLoading,
}: {
  apartments: Apartment[];
  isLoading: boolean;
}) {
  const center = useApartmentMapSearchStore((s) => s.center);
  const radiusKm = useApartmentMapSearchStore((s) => s.radiusKm);
  const selectedApartmentId = useApartmentMapSearchStore((s) => s.selectedApartmentId);
  const setSelectedApartmentId = useApartmentMapSearchStore((s) => s.setSelectedApartmentId);
  const setCenter = useApartmentMapSearchStore((s) => s.setCenter);

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const mapCenter = useMemo(() => {
    if (Number.isFinite(center.lat) && Number.isFinite(center.lng)) return center;
    return DEFAULT_CENTER;
  }, [center]);

  const circleMeters = radiusKm * 1000;
  const centerIcon = useMemo(() => createCenterIcon(), []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-50">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CenterSync />
        <PanToCenter />

        <Circle
          center={[mapCenter.lat, mapCenter.lng]}
          radius={circleMeters}
          pathOptions={{
            color: '#facc15',
            weight: 2,
            fillColor: '#fde047',
            fillOpacity: 0.12,
          }}
        />

        <Marker
          position={[mapCenter.lat, mapCenter.lng]}
          draggable
          icon={centerIcon}
          eventHandlers={{
            dragend: (event) => {
              const next = (event.target as L.Marker).getLatLng();
              setCenter({ lat: next.lat, lng: next.lng });
            },
          }}
        />

        {apartments.map((apartment) => {
          const coords = apartmentCoords(apartment);
          if (!coords) return null;

          const selected = apartment.id === selectedApartmentId;
          const hovered = apartment.id === hoveredId;
          const icon = createPriceMarkerIcon({ price: apartment.price, selected, hovered });

          return (
            <Marker
              key={apartment.id}
              position={[coords.lat, coords.lng]}
              icon={icon}
              eventHandlers={{
                click: () => setSelectedApartmentId(apartment.id),
                mouseover: () => setHoveredId(apartment.id),
                mouseout: () => setHoveredId((prev) => (prev === apartment.id ? null : prev)),
              }}
            />
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center justify-end">
        <div
          className={[
            'rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm ring-1 ring-black/5 backdrop-blur',
            isLoading ? 'opacity-100' : 'opacity-90',
          ].join(' ')}
        >
          {isLoading ? 'Yuklanmoqda...' : `${apartments.length} ta e'lon`}
        </div>
      </div>
    </div>
  );
}
