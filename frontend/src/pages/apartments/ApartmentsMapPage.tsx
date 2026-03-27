import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apartmentsApi, Apartment } from '../../api/apartments';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useApartmentMapSearchStore } from '../../stores/apartmentMapSearchStore';
import { ApartmentRadiusSearchMap } from '../../components/maps/apartments/ApartmentRadiusSearchMap';
import { ListingPurposeTabs } from '../../components/maps/apartments/ListingPurposeTabs';
import { MapTopControls } from '../../components/maps/apartments/MapTopControls';
import { RadiusControls } from '../../components/maps/apartments/RadiusControls';
import { SelectedApartmentCard } from '../../components/maps/apartments/SelectedApartmentCard';

export default function ApartmentsMapPage() {
  const center = useApartmentMapSearchStore((s) => s.center);
  const radiusKm = useApartmentMapSearchStore((s) => s.radiusKm);
  const purpose = useApartmentMapSearchStore((s) => s.purpose);
  const search = useApartmentMapSearchStore((s) => s.search);
  const selectedApartmentId = useApartmentMapSearchStore((s) => s.selectedApartmentId);
  const setSelectedApartmentId = useApartmentMapSearchStore((s) => s.setSelectedApartmentId);

  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedCenter = useDebouncedValue(center, 250);
  const debouncedRadius = useDebouncedValue(radiusKm, 250);
  const debouncedSearch = useDebouncedValue(search, 300);

  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 200,
      lat: debouncedCenter.lat,
      lng: debouncedCenter.lng,
      radius: debouncedRadius,
      purpose,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    }),
    [debouncedCenter.lat, debouncedCenter.lng, debouncedRadius, purpose, debouncedSearch]
  );

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['apartments', 'map', queryParams],
    queryFn: () => apartmentsApi.getApartments(queryParams),
    staleTime: 30_000,
  });

  const apartments = data?.apartments || [];
  const selectedApartment: Apartment | null =
    (selectedApartmentId && apartments.find((a) => a.id === selectedApartmentId)) || null;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-5">
      <div className="flex flex-col gap-3">
        <MapTopControls viewMode="map" onOpenFilters={() => setFiltersOpen((v) => !v)} />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <ListingPurposeTabs />
          <div className="md:w-[420px]">
            <RadiusControls />
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="h-[calc(100vh-320px)] min-h-[62vh] md:h-[calc(100vh-300px)]">
          <ApartmentRadiusSearchMap apartments={apartments} isLoading={isLoading || isFetching} />
        </div>

        {selectedApartment && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-[600] flex justify-center px-4">
            <SelectedApartmentCard
              apartment={selectedApartment}
              onClose={() => setSelectedApartmentId(null)}
            />
          </div>
        )}

        {isError && (
          <div className="absolute left-4 top-4 z-[650] w-[min(520px,calc(100vw-2rem))] rounded-2xl bg-white/95 p-4 text-sm text-red-600 shadow-md ring-1 ring-black/5 backdrop-blur">
            Xatolik: e&apos;lonlarni yuklab bo&apos;lmadi.
          </div>
        )}

        {!isLoading && !isFetching && !isError && apartments.length === 0 && (
          <div className="absolute left-4 top-4 z-[650] w-[min(520px,calc(100vw-2rem))] rounded-2xl bg-white/95 p-4 text-sm text-gray-700 shadow-md ring-1 ring-black/5 backdrop-blur">
            Bu radius ichida e&apos;lon topilmadi. Radiusni kattalashtiring yoki xaritani suring.
          </div>
        )}

        {filtersOpen && (
          <div className="absolute right-4 top-4 z-[700] w-[min(420px,calc(100vw-2rem))] rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/10">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Filtrlar</div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                Yopish
              </button>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Hozircha map qidiruv uchun asosiy filterlar: qidiruv, tab va radius.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
