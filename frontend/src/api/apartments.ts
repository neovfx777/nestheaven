import apiClient from './client';

export interface Apartment {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  price: number;
  rooms: number;
  area: number;
  floor: number;
  address: string;
  status: 'ACTIVE' | 'HIDDEN' | 'SOLD';
  developerName: string;
  complex: {
    id: string;
    name: string;
    coverImage: string | null;
  } | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApartmentDetail extends Apartment {
  descriptionUz: string | null;
  descriptionRu: string | null;
  descriptionEn: string | null;
  latitude: number | null;
  longitude: number | null;
  airQualityIndex: number | null;
  airQualitySource: string | null;
  infrastructure: any;
  investmentGrowthPercent: number | null;
  contactInfo?: {
    phone: string;
    telegram: string | null;
    whatsapp: string | null;
    email: string | null;
  };
  images: Array<{
    id: string;
    url: string;
    orderIndex: number;
    captionUz: string | null;
    captionRu: string | null;
    captionEn: string | null;
  }>;
  seller: {
    id: string;
    fullName: string;
  };
  multiLanguageContent: {
    uz: {
      title: string;
      description: string | null;
      materials: string | null;
      infrastructureNote: string | null;
      investmentGrowthNote: string | null;
    };
    ru: {
      title: string;
      description: string | null;
      materials: string | null;
      infrastructureNote: string | null;
      investmentGrowthNote: string | null;
    };
    en: {
      title: string;
      description: string | null;
      materials: string | null;
      infrastructureNote: string | null;
      investmentGrowthNote: string | null;
    };
  };
  installmentOptions: any;
}

export interface PaginatedResponse<T> {
  apartments: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterParams {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minArea?: number;
  maxArea?: number;
  status?: string;
  complexId?: string;
  developerName?: string;
  search?: string;
  sortBy?: 'price' | 'area' | 'rooms' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface Complex {
  id: string;
  name: string;
  coverImage: string | null;
  _count: {
    apartments: number;
  };
}

export const apartmentsApi = {
  // Get apartments with filtering
  getApartments: async (params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Apartment> }>('/apartments', { params });
    return response.data.data;
  },

  // Get apartment by ID
  getApartmentById: async (id: string): Promise<ApartmentDetail> => {
    const response = await apiClient.get<{ success: boolean; data: ApartmentDetail }>(`/apartments/${id}`);
    return response.data.data;
  },

  // Get complexes
  getComplexes: async (): Promise<Complex[]> => {
    const response = await apiClient.get<{ success: boolean; data: Complex[] }>('/complexes');
    return response.data.data;
  },

  // Get other apartments in same complex
  getOtherApartments: async (apartmentId: string, limit: number = 6) => {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/complexes/apartments/${apartmentId}/other`,
      { params: { limit } }
    );
    return response.data.data;
  },

  // Search apartments
  searchApartments: async (query: string, params: FilterParams = {}) => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Apartment> }>('/apartments', {
      params: { ...params, search: query }
    });
    return response.data.data;
  },
};