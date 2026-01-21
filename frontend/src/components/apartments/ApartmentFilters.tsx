import { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Complex } from '../../api/apartments';

interface FilterParams {
  minPrice: string;
  maxPrice: string;
  minRooms: string;
  maxRooms: string;
  minArea: string;
  maxArea: string;
  complexId: string;
  developerName: string;
  sortBy: string;
  sortOrder: string;
  search: string;
}

interface ApartmentFiltersProps {
  complexes: Complex[];
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  onSearch: (search: string) => void;
  onReset: () => void;
}

const ApartmentFilters = ({
  complexes,
  filters,
  onFilterChange,
  onSearch,
  onReset,
}: ApartmentFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleInputChange = (field: keyof FilterParams, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== 'price' && value !== 'desc'
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search apartments by title, description, or address..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-1.5 rounded-md hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-gray-700 hover:text-primary-600 transition-colors"
        >
          <Filter className="h-5 w-5 mr-2" />
          <span className="font-medium">Advanced Filters</span>
          {hasActiveFilters && (
            <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range ($)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rooms
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minRooms}
                onChange={(e) => handleInputChange('minRooms', e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxRooms}
                onChange={(e) => handleInputChange('maxRooms', e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area (m²)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minArea}
                onChange={(e) => handleInputChange('minArea', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxArea}
                onChange={(e) => handleInputChange('maxArea', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Complex */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complex
            </label>
            <select
              value={filters.complexId}
              onChange={(e) => handleInputChange('complexId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Complexes</option>
              {complexes.map((complex) => (
                <option key={complex.id} value={complex.id}>
                  {complex.name} ({complex._count.apartments})
                </option>
              ))}
            </select>
          </div>

          {/* Developer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Developer
            </label>
            <input
              type="text"
              placeholder="Developer name"
              value={filters.developerName}
              onChange={(e) => handleInputChange('developerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="createdAt">Newest</option>
              <option value="price">Price</option>
              <option value="area">Area</option>
              <option value="rooms">Rooms</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleInputChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* Apply Filters Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-primary-600 text-white py-2.5 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentFilters;