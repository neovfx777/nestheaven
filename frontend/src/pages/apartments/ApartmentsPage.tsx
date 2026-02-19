import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Filter, Loader2, Save, SlidersHorizontal } from 'lucide-react';

import ApartmentCard from '../../components/apartments/ApartmentCard';
import ApartmentFilters, {
  ApartmentFilterState,
  DEFAULT_APARTMENT_FILTERS,
} from '../../components/apartments/ApartmentFilters';
import { SaveSearchModal } from '../../components/apartments/SaveSearchModal';
import { Modal } from '../../components/ui/Modal';
import { Apartment, apartmentsApi, FilterParams as ApiFilterParams } from '../../api/apartments';
import { useAuthStore } from '../../stores/authStore';

const pageSize = 12;
const filterKeys = Object.keys(DEFAULT_APARTMENT_FILTERS) as Array<keyof ApartmentFilterState>;

const parsePage = (value: string | null) => {
  const parsed = Number.parseInt(value || '1', 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
};

const parseNumberFilter = (value: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const readLocalizedText = (value: unknown) => {
  if (!value) return '';

  if (typeof value === 'string') {
    if (!value.trim().startsWith('{')) return value;

    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed) {
        const localized = parsed as Record<string, string | undefined>;
        return [localized.uz, localized.ru, localized.en].filter(Boolean).join(' ');
      }
    } catch {
      return value;
    }

    return value;
  }

  if (typeof value === 'object') {
    const localized = value as Record<string, string | undefined>;
    return [localized.uz, localized.ru, localized.en].filter(Boolean).join(' ');
  }

  return '';
};

const buildSearchParams = (filters: ApartmentFilterState, page: number) => {
  const nextParams: Record<string, string> = {};

  filterKeys.forEach((key) => {
    const value = filters[key];
    const defaultValue = DEFAULT_APARTMENT_FILTERS[key];

    if (value && value !== defaultValue) {
      nextParams[key] = value;
    }
  });

  if (page > 1) {
    nextParams.page = page.toString();
  }

  return nextParams;
};

const parseSortBy = (value: string | null): ApartmentFilterState['sortBy'] => {
  if (value === 'price' || value === 'area' || value === 'rooms' || value === 'createdAt' || value === 'updatedAt') {
    return value;
  }
  return DEFAULT_APARTMENT_FILTERS.sortBy;
};

const parseSortOrder = (value: string | null): ApartmentFilterState['sortOrder'] => {
  if (value === 'asc' || value === 'desc') {
    return value;
  }
  return DEFAULT_APARTMENT_FILTERS.sortOrder;
};

const parseStatus = (value: string | null): ApartmentFilterState['status'] => {
  if (value === 'active' || value === 'sold' || value === 'hidden') {
    return value;
  }
  return '';
};

const parsePaymentPlan = (value: string | null): ApartmentFilterState['paymentPlan'] => {
  if (value === 'mortgage' || value === 'installments') {
    return value;
  }
  return 'any';
};

const parseBadge = (value: string | null): ApartmentFilterState['badge'] => {
  if (value === 'featured' || value === 'recommended') {
    return value;
  }
  return 'all';
};

const ApartmentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<ApartmentFilterState>(() => ({
    ...DEFAULT_APARTMENT_FILTERS,
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRooms: searchParams.get('minRooms') || '',
    maxRooms: searchParams.get('maxRooms') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    minFloor: searchParams.get('minFloor') || '',
    maxFloor: searchParams.get('maxFloor') || '',
    complexId: searchParams.get('complexId') || '',
    developerName: searchParams.get('developerName') || '',
    status: parseStatus(searchParams.get('status')),
    paymentPlan: parsePaymentPlan(searchParams.get('paymentPlan')),
    badge: parseBadge(searchParams.get('badge')),
    sortBy: parseSortBy(searchParams.get('sortBy')),
    sortOrder: parseSortOrder(searchParams.get('sortOrder')),
    search: searchParams.get('search') || '',
  }));

  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const currentPage = parsePage(searchParams.get('page'));

  const serverFilters = useMemo<ApiFilterParams>(() => {
    const minPrice = parseNumberFilter(filters.minPrice);
    const maxPrice = parseNumberFilter(filters.maxPrice);

    return {
      page: 1,
      limit: 200,
      ...(minPrice !== undefined && { minPrice }),
      ...(maxPrice !== undefined && { maxPrice }),
      ...(filters.complexId && { complexId: filters.complexId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
    };
  }, [filters.minPrice, filters.maxPrice, filters.complexId, filters.status, filters.search]);

  const { data: complexes = [] } = useQuery({
    queryKey: ['complexes'],
    queryFn: apartmentsApi.getComplexes,
  });

  const {
    data: apartmentsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['apartments', serverFilters],
    queryFn: () => apartmentsApi.getApartments(serverFilters),
    placeholderData: (previousData) => previousData,
  });

  const hasActiveFilters = useMemo(
    () => filterKeys.some((key) => filters[key] !== DEFAULT_APARTMENT_FILTERS[key]),
    [filters]
  );

  const filteredApartments = useMemo(() => {
    const apartments = apartmentsData?.apartments || [];

    const minRooms = parseNumberFilter(filters.minRooms);
    const maxRooms = parseNumberFilter(filters.maxRooms);
    const minArea = parseNumberFilter(filters.minArea);
    const maxArea = parseNumberFilter(filters.maxArea);
    const minFloor = parseNumberFilter(filters.minFloor);
    const maxFloor = parseNumberFilter(filters.maxFloor);

    const developerFilter = filters.developerName.trim().toLowerCase();
    const searchFilter = filters.search.trim().toLowerCase();

    const filtered = apartments.filter((apartment) => {
      if (minRooms !== undefined && apartment.rooms < minRooms) return false;
      if (maxRooms !== undefined && apartment.rooms > maxRooms) return false;

      if (minArea !== undefined && apartment.area < minArea) return false;
      if (maxArea !== undefined && apartment.area > maxArea) return false;

      const floor = apartment.floor ?? 0;
      if (minFloor !== undefined && floor < minFloor) return false;
      if (maxFloor !== undefined && floor > maxFloor) return false;

      if (filters.complexId && apartment.complexId !== filters.complexId) return false;

      if (filters.status) {
        const apartmentStatus = apartment.status.toString().toLowerCase();
        if (apartmentStatus !== filters.status) return false;
      }

      if (developerFilter && !String(apartment.developerName || '').toLowerCase().includes(developerFilter)) {
        return false;
      }

      const searchableBlob = [
        readLocalizedText(apartment.title),
        readLocalizedText(apartment.description),
        readLocalizedText(apartment.complex?.name),
        readLocalizedText(apartment.complex?.address),
        apartment.address || '',
        apartment.developerName || '',
      ]
        .join(' ')
        .toLowerCase();

      if (searchFilter && !searchableBlob.includes(searchFilter)) {
        return false;
      }

      if (filters.paymentPlan === 'mortgage') {
        if (!/ipoteka|mortgage|kredit|credit/.test(searchableBlob)) {
          return false;
        }
      }

      if (filters.paymentPlan === 'installments') {
        if (!/bo'lib|installment|rassroch|muddatli/.test(searchableBlob)) {
          return false;
        }
      }

      if (filters.badge === 'featured' && !apartment.isFeatured) {
        return false;
      }

      if (filters.badge === 'recommended' && !apartment.isRecommended) {
        return false;
      }

      return true;
    });

    const sortFactor = filters.sortOrder === 'asc' ? 1 : -1;

    filtered.sort((first, second) => {
      if (filters.sortBy === 'price') return (first.price - second.price) * sortFactor;
      if (filters.sortBy === 'area') return (first.area - second.area) * sortFactor;
      if (filters.sortBy === 'rooms') return (first.rooms - second.rooms) * sortFactor;
      if (filters.sortBy === 'updatedAt') {
        const firstUpdated = new Date(first.updatedAt).getTime();
        const secondUpdated = new Date(second.updatedAt).getTime();
        return (firstUpdated - secondUpdated) * sortFactor;
      }

      const firstDate = new Date(first.createdAt).getTime();
      const secondDate = new Date(second.createdAt).getTime();
      return (firstDate - secondDate) * sortFactor;
    });

    return filtered;
  }, [apartmentsData?.apartments, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredApartments.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (safePage !== currentPage) {
      setSearchParams(buildSearchParams(filters, safePage));
    }
  }, [safePage, currentPage, filters, setSearchParams]);

  const paginatedApartments = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredApartments.slice(start, start + pageSize);
  }, [filteredApartments, safePage]);

  const paginationButtons = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + 4);
    const offset = Math.max(1, end - 4);

    return Array.from({ length: end - offset + 1 }, (_, index) => offset + index);
  }, [safePage, totalPages]);

  const handleFilterChange = (nextFilters: ApartmentFilterState) => {
    setFilters(nextFilters);
    setSearchParams(buildSearchParams(nextFilters, 1));
  };

  const handleSearch = (search: string) => {
    const nextFilters = { ...filters, search };
    setFilters(nextFilters);
    setSearchParams(buildSearchParams(nextFilters, 1));
  };

  const handleReset = () => {
    setFilters(DEFAULT_APARTMENT_FILTERS);
    setSearchParams({});
  };

  const handlePageChange = (nextPage: number) => {
    const clampedPage = Math.max(1, Math.min(nextPage, totalPages));
    setSearchParams(buildSearchParams(filters, clampedPage));
  };

  if (isLoading && !apartmentsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Apartments
          </h2>
          <p className="text-gray-600 mb-4">
            Please try again later.
          </p>
          <button
            onClick={() => refetch()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Apartments</h1>
            <p className="text-gray-600 mt-2">Chap tomondagi katta filter panel orqali tez tanlang.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center text-gray-700">
              <Filter className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {filteredApartments.length} ta mos e'lon
              </span>
            </div>

            <button
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className="xl:hidden inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showMobileFilters ? 'Filterni yopish' : 'Filterni ochish'}
            </button>

            {isAuthenticated && hasActiveFilters && (
              <button
                onClick={() => setShowSaveSearchModal(true)}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Save className="h-4 w-4" />
                Save Search
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <aside className={`${showMobileFilters ? 'block' : 'hidden'} xl:block`}>
          <ApartmentFilters
            complexes={complexes}
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            onReset={handleReset}
          />
        </aside>

        <section>
          {filteredApartments.length > 0 && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 font-semibold flex items-center justify-between gap-3">
              <span>Topildi: {filteredApartments.length} ta e'lon</span>
              <button
                onClick={() => setShowFoundModal(true)}
                className="text-sm font-semibold px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Hammasini ko'rish
              </button>
            </div>
          )}

          {paginatedApartments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No apartments found</h3>
              <button
                onClick={handleReset}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedApartments.map((apartment) => (
                  <ApartmentCard key={apartment.id} apartment={apartment} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePageChange(safePage - 1)}
                    disabled={safePage <= 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Oldingi
                  </button>

                  {paginationButtons.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        pageNumber === safePage
                          ? 'border-primary-600 bg-primary-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Keyingi
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <SaveSearchModal
        isOpen={showSaveSearchModal}
        onClose={() => setShowSaveSearchModal(false)}
        filters={filters}
      />

      <Modal isOpen={showFoundModal} onClose={() => setShowFoundModal(false)} size="xl">
        <div className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Topilgan e'lonlar</h3>
              <p className="text-sm text-gray-600">
                Jami: {filteredApartments.length} ta
              </p>
            </div>
            <button
              onClick={() => setShowFoundModal(false)}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Yopish
            </button>
          </div>

          {filteredApartments.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
              {filteredApartments.map((apartment: Apartment) => (
                <ApartmentCard key={apartment.id} apartment={apartment} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600">Hech narsa topilmadi.</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ApartmentsPage;

