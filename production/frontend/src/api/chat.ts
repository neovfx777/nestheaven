import apiClient from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantFilterPatch {
  minPrice?: string;
  maxPrice?: string;
  minRooms?: string;
  maxRooms?: string;
  minArea?: string;
  maxArea?: string;
  status?: 'active' | 'sold' | 'hidden';
  search?: string;
}

export interface ChatApartmentMatch {
  id: string;
  title: string;
  price: number;
  rooms: number;
  area: number;
  floor?: number | null;
  status: string;
  coverImage?: string | null;
  complexName?: string;
  city?: string;
  locationText?: string;
  metroDistanceMeters?: number | null;
  url: string;
}

export interface ApartmentAssistantResponse {
  reply: string;
  matches: ChatApartmentMatch[];
  appliedFilters: AssistantFilterPatch;
  source: 'database_only';
  totalCandidatesChecked: number;
}

interface ApartmentAssistantPayload {
  message: string;
  history?: ChatMessage[];
  language?: 'uz' | 'ru' | 'en';
  limit?: number;
}

export const chatApi = {
  askApartmentAssistant: async (
    payload: ApartmentAssistantPayload
  ): Promise<ApartmentAssistantResponse> => {
    const response = await apiClient.post<{ success: boolean; data: ApartmentAssistantResponse }>(
      '/chat/apartments-assistant',
      payload
    );
    return response.data.data;
  },
};

