import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Building2, Loader2, Filter } from 'lucide-react';
import ApartmentCard from '../../components/apartments/ApartmentCard';
import ApartmentFilters from '../../components/apartments/ApartmentFilters';
import { apartmentsApi, FilterParams as ApiFilterParams } from '../../api/apartments';

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

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;

  // Fetch complexes for filter dropdown
  const { data: complexes = [] } = useQuery('complexes', apartmentsApi.getComplexes);

  // Fetch apartments
  const {
    data: apartmentsData,
    isLoading,
    isError,
    refetch,
  } = useQuery(
    ['apartments', page, filters],
    () => {
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
    {
      keepPreviousData: true,
    }
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params);
  }, [filters, page, setSearchParams]);

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
    setSearchParams({ ...Object.fromEntries(searchParams), page: newPage.toString() });
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
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Apartments</h2>
          <p className="text-gray-600">Please try again later.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Apartments</h1>
            <p className="text-gray-600 mt-2">
              Find your perfect newly built apartment
            </p>
          </div>
          <div className="flex items-center text-gray-700">
            <Filter className="h-5 w-5 mr-2" />
            <span className="font-medium">
              {apartmentsData?.pagination.total || 0} apartments found
            </span>
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
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No apartments found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search criteria
          </p>
          <button
            onClick={handleReset}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* Apartment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {apartmentsData?.apartments.map((apartment) => (
              <ApartmentCard key={apartment.id} apartment={apartment} />
            ))}
          </div>

          {/* Pagination */}
          {apartmentsData && apartmentsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * limit, apartmentsData.pagination.total)}
                </span>{' '}
                of <span className="font-medium">{apartmentsData.pagination.total}</span> results
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, apartmentsData.pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (apartmentsData.pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= apartmentsData.pagination.totalPages - 2) {
                    pageNum = apartmentsData.pagination.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === apartmentsData.pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApartmentsPage;