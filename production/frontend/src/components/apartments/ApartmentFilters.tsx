import { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Complex } from '../../api/apartments';
import { interpretVoiceQuery, isVoiceAiConfigured } from '../../utils/voiceSearchAi';
import VoiceSearch from '../ui/VoiceSearch';

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
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const voiceAiEnabled = isVoiceAiConfigured();

  const pickName = (name: any) => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    if (typeof name === 'object') return name.uz || name.ru || name.en || '';
    return '';
  };

  const findComplexIdByName = (spoken: string) => {
    const lowerQuery = spoken.toLowerCase();
    const match = complexes.find((c) => {
      const candidate = pickName(c.name).toLowerCase();
      return candidate && (lowerQuery.includes(candidate) || candidate.includes(lowerQuery));
    });
    return match?.id;
  };

  const extractRooms = (text: string) => {
    const m = text.match(/(\d+)\s*xona[a-z]*/i);
    return m ? parseInt(m[1]) : undefined;
  };

  const extractArea = (text: string) => {
    const m = text.match(/(\d+(?:[.,]\d+)?)\s*(kv\\.?.?m|m2|metr|metre|kvadrat)/i);
    if (!m) return undefined;
    const num = Number(m[1].replace(',', '.'));
    return Number.isNaN(num) ? undefined : num;
  };

  const handleInputChange = (field: keyof FilterParams, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    setAiMessage(null);
    onSearch(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVoiceSearch = async (query: string) => {
    const spoken = query.trim();
    setSearchInput(spoken);
    setAiMessage(null);

    if (!spoken) return;

    if (!voiceAiEnabled) {
      const rooms = extractRooms(spoken);
      const area = extractArea(spoken);
      const complexId = findComplexIdByName(spoken) || filters.complexId;

      const nextFilters = {
        ...filters,
        search: spoken,
        minRooms: rooms ? rooms.toString() : '',
        maxRooms: rooms ? rooms.toString() : '',
        minArea: area ? area.toString() : '',
        maxArea: area ? area.toString() : '',
        complexId,
        sortBy: rooms ? 'rooms' : filters.sortBy,
        sortOrder: rooms ? 'asc' : filters.sortOrder,
      };

      onFilterChange(nextFilters);
      return;
    }

    setIsAiSearching(true);
    try {
      const aiFilters = await interpretVoiceQuery(spoken);
      const resolvedSearch = (aiFilters.search ?? spoken).trim();
      setSearchInput(resolvedSearch);

      // Fallback: if AI missed some fields, enrich from speech
      const spokenRooms = extractRooms(spoken);
      if (aiFilters.minRooms === undefined && aiFilters.maxRooms === undefined && spokenRooms !== undefined) {
        aiFilters.minRooms = spokenRooms;
        aiFilters.maxRooms = spokenRooms;
      }
      if (aiFilters.minArea === undefined && aiFilters.maxArea === undefined) {
        const spokenArea = extractArea(spoken);
        if (spokenArea !== undefined) {
          aiFilters.minArea = spokenArea;
        }
      }
      if (!aiFilters.complexName) {
        const complexId = findComplexIdByName(spoken);
        if (complexId) {
          aiFilters.complexName = pickName(complexes.find(c => c.id === complexId)?.name);
        }
      }

      const matchedComplexId =
        aiFilters.complexName
          ? findComplexIdByName(aiFilters.complexName)
          : findComplexIdByName(spoken) || filters.complexId;

      const nextFilters: FilterParams = {
        ...filters,
        search: resolvedSearch,
        minPrice: aiFilters.minPrice !== undefined ? aiFilters.minPrice.toString() : '',
        maxPrice: aiFilters.maxPrice !== undefined ? aiFilters.maxPrice.toString() : '',
        minRooms: aiFilters.minRooms !== undefined ? aiFilters.minRooms.toString() : '',
        maxRooms: aiFilters.maxRooms !== undefined ? aiFilters.maxRooms.toString() : '',
        minArea: aiFilters.minArea !== undefined ? aiFilters.minArea.toString() : '',
        maxArea: aiFilters.maxArea !== undefined ? aiFilters.maxArea.toString() : '',
        developerName: aiFilters.developerName ?? '',
        complexId: matchedComplexId ?? '',
        sortBy: aiFilters.sortBy ?? filters.sortBy,
        sortOrder: aiFilters.sortOrder ?? filters.sortOrder,
      };

      // If user asked for specific rooms, prioritize those results first
      const roomsSpecified = aiFilters.minRooms !== undefined || aiFilters.maxRooms !== undefined;
      if (roomsSpecified) {
        nextFilters.sortBy = 'rooms';
        nextFilters.sortOrder = 'asc';
      }
      // If area specified but no room request, sort by area asc
      const areaSpecified = aiFilters.minArea !== undefined || aiFilters.maxArea !== undefined;
      if (!roomsSpecified && areaSpecified) {
        nextFilters.sortBy = 'area';
        nextFilters.sortOrder = 'asc';
      }

      onFilterChange(nextFilters);
      setAiMessage("AI qidiruvi asosida filtrlar qo'llandi.");
    } catch (error) {
      console.error('AI voice search failed', error);
      setAiMessage("AI ishlamadi, oddiy qidiruv qo'llandi.");
      onFilterChange({ ...filters, search: spoken });
    } finally {
      setIsAiSearching(false);
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== 'price' && value !== 'desc'
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="space-y-3">
          {/* Voice Search */}
          <VoiceSearch 
            onSearch={handleVoiceSearch}
            placeholder="Search apartments by title, description, or address..."
            disabled={isAiSearching}
            className="mb-3"
          />
          {voiceAiEnabled ? (
            <p className="text-xs text-gray-500">
              {isAiSearching
                ? 'AI qidiryapti...'
                : aiMessage || "Ovozli buyruqdan so'ng AI filtrlashga yordam beradi."}
            </p>
          ) : (
            <p className="text-xs text-amber-600">
              AI kaliti topilmadi. VITE_OPENROUTER_API_KEY qo'shilmagani uchun oddiy ovozli qidiruv ishlaydi.
            </p>
          )}
          
          {/* Traditional Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Or type your search here..."
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
                  {typeof complex.name === 'string' ? complex.name : complex.name?.en || 'Unknown Complex'} ({complex._count?.apartments || 0})
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
