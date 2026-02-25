import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Bed,
  Building2,
  DollarSign,
  Filter,
  Home,
  Landmark,
  Layers,
  Sparkles,
  Square,
  Star,
  X,
} from 'lucide-react';

import { Complex } from '../../api/apartments';
import { interpretVoiceQuery, isVoiceAiConfigured } from '../../utils/voiceSearchAi';
import VoiceSearch from '../ui/VoiceSearch';

export interface ApartmentFilterState {
  minPrice: string;
  maxPrice: string;
  minRooms: string;
  maxRooms: string;
  minArea: string;
  maxArea: string;
  minFloor: string;
  maxFloor: string;
  complexId: string;
  developerName: string;
  status: '' | 'active' | 'sold' | 'hidden';
  paymentPlan: 'any' | 'mortgage' | 'installments';
  badge: 'all' | 'featured' | 'recommended';
  sortBy: 'createdAt' | 'updatedAt' | 'price' | 'area' | 'rooms';
  sortOrder: 'asc' | 'desc';
  search: string;
}

export const DEFAULT_APARTMENT_FILTERS: ApartmentFilterState = {
  minPrice: '',
  maxPrice: '',
  minRooms: '',
  maxRooms: '',
  minArea: '',
  maxArea: '',
  minFloor: '',
  maxFloor: '',
  complexId: '',
  developerName: '',
  status: '',
  paymentPlan: 'any',
  badge: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  search: '',
};

const filterKeys = Object.keys(DEFAULT_APARTMENT_FILTERS) as Array<keyof ApartmentFilterState>;

interface ApartmentFiltersProps {
  complexes: Complex[];
  filters: ApartmentFilterState;
  onFilterChange: (filters: ApartmentFilterState) => void;
  onSearch: (search: string) => void;
  onReset: () => void;
}

interface PaymentOption {
  key: ApartmentFilterState['paymentPlan'];
  label: string;
  helper: string;
  icon: typeof Home;
}

interface BadgeOption {
  key: ApartmentFilterState['badge'];
  label: string;
  icon: typeof Star;
}

const roomShortcutButtons = [
  { label: '1 xona', value: '1' },
  { label: '2 xona', value: '2' },
  { label: '3 xona', value: '3' },
  { label: '4 xona', value: '4' },
  { label: '5+ xona', value: '5+' },
];

const paymentOptions: PaymentOption[] = [
  {
    key: 'any',
    label: "Barchasi",
    helper: "To'lov turi bo'yicha cheklanmasin",
    icon: Home,
  },
  {
    key: 'mortgage',
    label: 'Ipoteka',
    helper: 'Ipoteka uchun mos variantlar',
    icon: Landmark,
  },
  {
    key: 'installments',
    label: "Bo'lib to'lash",
    helper: "Muddatli to'lov imkoniyati bor",
    icon: Sparkles,
  },
];

const badgeOptions: BadgeOption[] = [
  { key: 'all', label: "Barcha e'lonlar", icon: Star },
  { key: 'featured', label: "Top e'lonlar", icon: Sparkles },
  { key: 'recommended', label: 'Tavsiya etilgan', icon: Star },
];

const PRICE_RANGE_MIN = 10000;
const PRICE_RANGE_MAX = 500000;
const PRICE_RANGE_STEP = 1000;

const ApartmentFilters = ({
  complexes,
  filters,
  onFilterChange,
  onSearch,
  onReset,
}: ApartmentFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const voiceAiEnabled = isVoiceAiConfigured();

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const parsePrice = (value: string, fallback: number) => {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const clampPrice = (value: number) => {
    return Math.min(PRICE_RANGE_MAX, Math.max(PRICE_RANGE_MIN, value));
  };

  const minPriceValue = clampPrice(parsePrice(filters.minPrice, PRICE_RANGE_MIN));
  const maxPriceValue = clampPrice(parsePrice(filters.maxPrice, PRICE_RANGE_MAX));
  const priceRangeMinValue = Math.min(minPriceValue, maxPriceValue);
  const priceRangeMaxValue = Math.max(minPriceValue, maxPriceValue);

  const pickName = (name: unknown) => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    if (typeof name === 'object') {
      const localized = name as Record<string, string | undefined>;
      return localized.uz || localized.ru || localized.en || '';
    }
    return '';
  };

  const findComplexIdByName = (spoken: string) => {
    const lowerQuery = spoken.toLowerCase();
    const match = complexes.find((complex) => {
      const candidate = pickName(complex.name).toLowerCase();
      return candidate && (lowerQuery.includes(candidate) || candidate.includes(lowerQuery));
    });
    return match?.id;
  };

  const extractRooms = (text: string) => {
    const match = text.match(/(\d+)\s*xona[a-z]*/i);
    return match ? Number.parseInt(match[1], 10) : undefined;
  };

  const extractArea = (text: string) => {
    const match = text.match(/(\d+(?:[.,]\d+)?)\s*(kv\\.?.?m|m2|metr|metre|kvadrat)/i);
    if (!match) return undefined;
    const parsed = Number(match[1].replace(',', '.'));
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const detectPaymentPlan = (text: string): ApartmentFilterState['paymentPlan'] | undefined => {
    const lower = text.toLowerCase();
    if (/ipoteka|mortgage|kredit|credit/.test(lower)) return 'mortgage';
    if (/bo'lib|installment|rassroch|muddatli/.test(lower)) return 'installments';
    return undefined;
  };

  const applyPatch = (patch: Partial<ApartmentFilterState>) => {
    onFilterChange({ ...filters, ...patch });
  };

  const handleInputChange = (field: keyof ApartmentFilterState, value: string) => {
    applyPatch({ [field]: value } as Partial<ApartmentFilterState>);
  };

  const handleMinPriceRangeChange = (value: string) => {
    const nextMin = clampPrice(Number(value));
    applyPatch({
      minPrice: Math.min(nextMin, priceRangeMaxValue).toString(),
      maxPrice: priceRangeMaxValue.toString(),
    });
  };

  const handleMaxPriceRangeChange = (value: string) => {
    const nextMax = clampPrice(Number(value));
    applyPatch({
      minPrice: priceRangeMinValue.toString(),
      maxPrice: Math.max(nextMax, priceRangeMinValue).toString(),
    });
  };

  const handleSearch = () => {
    setAiMessage(null);
    onSearch(searchInput.trim());
  };

  const handleQuickRoomSelect = (value: string) => {
    if (value === '5+') {
      applyPatch({ minRooms: '5', maxRooms: '' });
      return;
    }

    const shouldReset = filters.minRooms === value && filters.maxRooms === value;
    applyPatch({
      minRooms: shouldReset ? '' : value,
      maxRooms: shouldReset ? '' : value,
    });
  };

  const resetAll = () => {
    setSearchInput('');
    setAiMessage(null);
    onReset();
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
      const paymentPlan = detectPaymentPlan(spoken) || filters.paymentPlan;

      onFilterChange({
        ...filters,
        search: spoken,
        minRooms: rooms ? rooms.toString() : '',
        maxRooms: rooms ? rooms.toString() : '',
        minArea: area ? area.toString() : '',
        maxArea: area ? area.toString() : '',
        complexId,
        paymentPlan,
        sortBy: rooms ? 'rooms' : filters.sortBy,
        sortOrder: rooms ? 'asc' : filters.sortOrder,
      });
      return;
    }

    setIsAiSearching(true);
    try {
      const aiFilters = await interpretVoiceQuery(spoken);
      const resolvedSearch = (aiFilters.search ?? spoken).trim();
      setSearchInput(resolvedSearch);

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
          aiFilters.complexName = pickName(complexes.find((complex) => complex.id === complexId)?.name);
        }
      }

      const matchedComplexId =
        aiFilters.complexName
          ? findComplexIdByName(aiFilters.complexName)
          : findComplexIdByName(spoken) || filters.complexId;

      const paymentPlan = detectPaymentPlan(spoken) || filters.paymentPlan;

      const nextFilters: ApartmentFilterState = {
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
        paymentPlan,
        sortBy: aiFilters.sortBy ?? filters.sortBy,
        sortOrder: aiFilters.sortOrder ?? filters.sortOrder,
      };

      const roomsSpecified = aiFilters.minRooms !== undefined || aiFilters.maxRooms !== undefined;
      if (roomsSpecified) {
        nextFilters.sortBy = 'rooms';
        nextFilters.sortOrder = 'asc';
      }

      const areaSpecified = aiFilters.minArea !== undefined || aiFilters.maxArea !== undefined;
      if (!roomsSpecified && areaSpecified) {
        nextFilters.sortBy = 'area';
        nextFilters.sortOrder = 'asc';
      }

      onFilterChange(nextFilters);
      setAiMessage('AI qidiruvi asosida filtrlar yangilandi.');
    } catch (error) {
      console.error('AI voice search failed', error);
      setAiMessage("AI ishlamadi, oddiy qidiruv qo'llandi.");
      onFilterChange({ ...filters, search: spoken });
    } finally {
      setIsAiSearching(false);
    }
  };

  const hasActiveFilters = useMemo(
    () => filterKeys.some((key) => filters[key] !== DEFAULT_APARTMENT_FILTERS[key]),
    [filters]
  );

  const activeFilterCount = useMemo(
    () => filterKeys.filter((key) => filters[key] !== DEFAULT_APARTMENT_FILTERS[key]).length,
    [filters]
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 xl:sticky xl:top-24">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary-600" />
          <h2 className="text-base font-semibold text-gray-900">Katta Filter Panel</h2>
        </div>
        {hasActiveFilters && (
          <span className="text-xs font-semibold px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
            {activeFilterCount} ta faol
          </span>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-3 pb-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
            Aqlli va ovozli qidiruv
          </p>
          <VoiceSearch
            onSearch={handleVoiceSearch}
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Ovoz yoki matn bilan qidiring..."
            disabled={isAiSearching}
          />
          {voiceAiEnabled ? (
            <p className="text-xs text-gray-500">
              {isAiSearching ? 'AI filtr tayyorlamoqda...' : aiMessage || "Ovozli buyruq bo'yicha filter qo'llanadi."}
            </p>
          ) : (
            <p className="text-xs text-amber-600">
              AI kaliti yo`q. Oddiy ovozli qidiruv ishlaydi.
            </p>
          )}
          <p className="text-xs text-gray-500">
            Matn kiriting va `Enter` bosing yoki mikrofon orqali ayting.
          </p>
        </div>

        <div className="space-y-3 pb-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 flex items-center gap-2">
            <Bed className="h-3.5 w-3.5" />
            Xonalar
          </p>
          <div className="grid grid-cols-3 gap-2">
            {roomShortcutButtons.map((roomOption) => {
              const isExact = roomOption.value !== '5+'
                && filters.minRooms === roomOption.value
                && filters.maxRooms === roomOption.value;
              const isFivePlus = roomOption.value === '5+'
                && filters.minRooms === '5'
                && filters.maxRooms === '';
              const isActive = isExact || isFivePlus;

              return (
                <button
                  key={roomOption.value}
                  onClick={() => handleQuickRoomSelect(roomOption.value)}
                  className={`text-sm rounded-lg py-2 border transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400 hover:text-primary-700'
                  }`}
                >
                  {roomOption.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="1"
              placeholder="Min xona"
              value={filters.minRooms}
              onChange={(event) => handleInputChange('minRooms', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <input
              type="number"
              min="1"
              placeholder="Max xona"
              value={filters.maxRooms}
              onChange={(event) => handleInputChange('maxRooms', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="space-y-3 pb-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5" />
            Narx oralig'i
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min $"
              value={filters.minPrice}
              onChange={(event) => handleInputChange('minPrice', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <input
              type="number"
              placeholder="Max $"
              value={filters.maxPrice}
              onChange={(event) => handleInputChange('maxPrice', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="space-y-2 pt-1">
            <input
              type="range"
              min={PRICE_RANGE_MIN}
              max={PRICE_RANGE_MAX}
              step={PRICE_RANGE_STEP}
              value={priceRangeMinValue}
              onChange={(event) => handleMinPriceRangeChange(event.target.value)}
              className="w-full accent-blue-600"
            />
            <input
              type="range"
              min={PRICE_RANGE_MIN}
              max={PRICE_RANGE_MAX}
              step={PRICE_RANGE_STEP}
              value={priceRangeMaxValue}
              onChange={(event) => handleMaxPriceRangeChange(event.target.value)}
              className="w-full accent-blue-600"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>${priceRangeMinValue.toLocaleString()}</span>
              <span>${priceRangeMaxValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pb-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 flex items-center gap-2">
            <Square className="h-3.5 w-3.5" />
            Maydon (m2)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min m2"
              value={filters.minArea}
              onChange={(event) => handleInputChange('minArea', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <input
              type="number"
              placeholder="Max m2"
              value={filters.maxArea}
              onChange={(event) => handleInputChange('maxArea', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="space-y-3 pb-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" />
            Qavat oralig'i
          </p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min qavat"
              value={filters.minFloor}
              onChange={(event) => handleInputChange('minFloor', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
            <input
              type="number"
              placeholder="Max qavat"
              value={filters.maxFloor}
              onChange={(event) => handleInputChange('maxFloor', event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="space-y-3 pb-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" />
            Kompleks va holat
          </p>
          <select
            value={filters.complexId}
            onChange={(event) => handleInputChange('complexId', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Barcha komplekslar</option>
            {complexes.map((complex) => (
              <option key={complex.id} value={complex.id}>
                {pickName(complex.name) || 'Kompleks'}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => handleInputChange('status', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="sold">Sotilgan</option>
            <option value="hidden">Yashirilgan</option>
          </select>
          <input
            type="text"
            placeholder="Developer nomi"
            value={filters.developerName}
            onChange={(event) => handleInputChange('developerName', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="space-y-3 pb-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
            To'lov turi
          </p>
          <div className="space-y-2">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const isActive = filters.paymentPlan === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => handleInputChange('paymentPlan', option.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                    isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </div>
                  <p className={`text-xs mt-1 ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                    {option.helper}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pb-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">
            E'lon turi
          </p>
          <div className="space-y-2">
            {badgeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = filters.badge === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => handleInputChange('badge', option.key)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:border-primary-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pb-2">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500 flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Saralash
          </p>
          <select
            value={filters.sortBy}
            onChange={(event) => handleInputChange('sortBy', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="createdAt">Eng yangi</option>
            <option value="updatedAt">So'nggi yangilangan</option>
            <option value="price">Narx</option>
            <option value="area">Maydon</option>
            <option value="rooms">Xona soni</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(event) => handleInputChange('sortOrder', event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="desc">Kamayish tartibi</option>
            <option value="asc">O'sish tartibi</option>
          </select>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={handleSearch}
            className="flex-1 bg-primary-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Natijani yangilash
          </button>
          <button
            onClick={resetAll}
            className="px-3 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300 transition-colors"
            title="Clear all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApartmentFilters;

