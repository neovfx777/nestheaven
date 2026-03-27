import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ListingPurpose = 'sale' | 'rent' | 'daily' | 'buyers';

export interface LatLng {
  lat: number;
  lng: number;
}

interface ApartmentMapSearchState {
  center: LatLng;
  radiusKm: number;
  purpose: ListingPurpose;
  search: string;
  selectedApartmentId: string | null;

  setCenter: (center: LatLng) => void;
  setRadiusKm: (radiusKm: number) => void;
  setPurpose: (purpose: ListingPurpose) => void;
  setSearch: (search: string) => void;
  setSelectedApartmentId: (id: string | null) => void;
}

const DEFAULT_CENTER: LatLng = { lat: 41.3111, lng: 69.2797 }; // Tashkent

function clampRadiusKm(value: number) {
  if (!Number.isFinite(value)) return 3;
  return Math.min(25, Math.max(0.5, value));
}

export const useApartmentMapSearchStore = create<ApartmentMapSearchState>()(
  persist(
    (set) => ({
      center: DEFAULT_CENTER,
      radiusKm: 3,
      purpose: 'sale',
      search: '',
      selectedApartmentId: null,

      setCenter: (center) => set({ center }),
      setRadiusKm: (radiusKm) => set({ radiusKm: clampRadiusKm(radiusKm) }),
      setPurpose: (purpose) => set({ purpose }),
      setSearch: (search) => set({ search }),
      setSelectedApartmentId: (id) => set({ selectedApartmentId: id }),
    }),
    {
      name: 'apartment-map-search',
      partialize: (state) => ({
        center: state.center,
        radiusKm: state.radiusKm,
        purpose: state.purpose,
        search: state.search,
      }),
    }
  )
);

