import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Loader2, Filter, Save } from 'lucide-react';

import ApartmentCard from '../../components/apartments/ApartmentCard';
import ApartmentFilters from '../../components/apartments/ApartmentFilters';
import { SaveSearchModal } from '../../components/apartments/SaveSearchModal';
import { apartmentsApi, FilterParams as ApiFilterParams } from '../../api/apartments';
import { useAuthStore } from '../../stores/authStore';

const ApartmentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRooms: searchParams.get('minRooms') || '',
    maxRooms: searchParams.get('maxRooms') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    complexId: searchParams.get('complexId') || '',
    developerName: searchParams.get('developerName') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    search: searchParams.get('search') || '',
  });

  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;

  /* =========================
     Queries
     ========================= */

  const { data: complexes = [] } = useQuery({
    queryKey: ['complexes'],
    queryFn: apartmentsApi.getComplexes
  });

  const {
    data: apartmentsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['apartments', page, filters],
    queryFn: () => {
      const apiFilters: ApiFilterParams = {
        page,
        limit,
        ...(filters.minPrice && { minPrice: parseInt(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: parseInt(filters.maxPrice) }),
        ...(filters.minRooms && { minRooms: parseInt(filters.minRooms) }),
        ...(filters.maxRooms && { maxRooms: parseInt(filters.maxRooms) }),
        ...(filters.minArea && { minArea: parseInt(filters.minArea) }),
        ...(filters.maxArea && { maxArea: parseInt(filters.maxArea) }),
        ...(filters.complexId && { complexId: filters.complexId }),
        ...(filters.developerName && { developerName: filters.developerName }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy as any,
        sortOrder: filters.sortOrder as any,
      };

      return apartmentsApi.getApartments(apiFilters);
    },
    placeholderData: (previousData) => previousData,
  });

  /* =========================
     URL Sync
     ========================= */

  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });

    if (page > 1) params.set('page', page.toString());

    setSearchParams(params);
  }, [filters, page, setSearchParams]);

  /* =========================
     Handlers
     ========================= */

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setSearchParams({ page: '1', ...newFilters });
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
    setSearchParams({ page: '1', ...filters, search });
  };

  const handleReset = () => {
    const resetFilters = {
      minPrice: '',
      maxPrice: '',
      minRooms: '',
      maxRooms: '',
      minArea: '',
      maxArea: '',
      complexId: '',
      developerName: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: '',
    };

    setFilters(resetFilters);
    setSearchParams({ page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
    });
  };

  /* =========================
     Loading & Error States
     ========================= */

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

  /* =========================
     Render
     ========================= */

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Browse Apartments
            </h1>
            <p className="text-gray-600 mt-2">
              Find your perfect newly built apartment
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-700">
              <Filter className="h-5 w-5 mr-2" />
              <span className="font-medium">
                {apartmentsData?.pagination.total || 0} apartments found
              </span>
            </div>

            {isAuthenticated &&
              Object.values(filters).some(
                value => value !== '' && value !== null && value !== undefined
              ) && (
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

      {/* Filters */}
      <ApartmentFilters
        complexes={complexes}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Results */}
      {apartmentsData?.apartments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No apartments found
          </h3>
          <button
            onClick={handleReset}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {apartmentsData?.apartments.map(apartment => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
              />
            ))}
          </div>
        </>
      )}

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={showSaveSearchModal}
        onClose={() => setShowSaveSearchModal(false)}
        filters={filters}
      />
    </div>
  );
};

export default ApartmentsPage;
