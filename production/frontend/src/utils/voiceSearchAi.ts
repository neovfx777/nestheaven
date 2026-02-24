import { FilterParams } from '../api/apartments';
import { chatApi } from '../api/chat';

export interface VoiceAiFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minArea?: number;
  maxArea?: number;
  developerName?: string;
  complexName?: string;
  sortBy?: FilterParams['sortBy'];
  sortOrder?: FilterParams['sortOrder'];
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return undefined;
};

export const isVoiceAiConfigured = () => true;

export const interpretVoiceQuery = async (query: string): Promise<VoiceAiFilters> => {
  const response = await chatApi.askApartmentAssistant({
    message: query,
    history: [{ role: 'user', content: query }],
    limit: 5,
  });

  const appliedFilters = response?.appliedFilters || {};

  return {
    search: typeof appliedFilters.search === 'string' ? appliedFilters.search : query,
    minPrice: toNumber(appliedFilters.minPrice),
    maxPrice: toNumber(appliedFilters.maxPrice),
    minRooms: toNumber(appliedFilters.minRooms),
    maxRooms: toNumber(appliedFilters.maxRooms),
    minArea: toNumber(appliedFilters.minArea),
    maxArea: toNumber(appliedFilters.maxArea),
  };
};
