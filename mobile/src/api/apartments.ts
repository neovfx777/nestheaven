import apiClient from './client';

export interface Apartment {
  id: string;
  title: { uz: string; ru: string; en: string };
  description?: { uz: string; ru: string; en: string };
  price: number;
  rooms: number;
  area: number;
  floor: number;
  totalFloors?: number;
  status: 'ACTIVE' | 'HIDDEN' | 'SOLD' | 'active' | 'hidden' | 'sold';
  complexId: string;
  sellerId: string;
  complex?: {
    id: string;
    name: { uz: string; ru: string; en: string };
    address?: { uz: string; ru: string; en: string };
    city: string;
    coverImage: string | null;
    title?: string;
    locationText?: string;
    bannerImageUrl?: string | null;
    walkabilityRating?: number | null;
    airQualityRating?: number | null;
  } | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  materials?: { uz: string; ru: string; en: string };
  infrastructureNote?: { uz: string; ru: string; en: string };
  isFeatured?: boolean;
  isRecommended?: boolean;
  images?: Array<{
    id: string;
    url: string;
    order: number;
  }>;
  seller?: {
    id: string;
    fullName: string;
    email: string;
  };
  titleUz?: string;
  titleRu?: string;
  titleEn?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  address?: string;
  developerName?: string;
}

export interface ApartmentDetail {
  id: string;
  title: { uz: string; ru: string; en: string };
  description?: { uz: string; ru: string; en: string };
  price: number;
  rooms: number;
  area: number;
  floor: number;
  totalFloors?: number;
  status: 'active' | 'hidden' | 'sold';
  complexId: string;
  sellerId: string;
  materials?: { uz: string; ru: string; en: string };
  infrastructureNote?: { uz: string; ru: string; en: string };
  isFeatured?: boolean;
  isRecommended?: boolean;
  complex?: {
    id: string;
    name: { uz: string; ru: string; en: string };
    address?: { uz: string; ru: string; en: string };
    city: string;
    coverImage: string | null;
    title?: string;
    locationText?: string;
    bannerImageUrl?: string | null;
    walkabilityRating?: number | null;
    airQualityRating?: number | null;
  } | null;
  images: Array<{
    id: string;
    url: string;
    order: number;
  }>;
  seller: {
    id: string;
    fullName: string;
    email: string;
  };
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
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
  status?: 'active' | 'hidden' | 'sold' | 'ACTIVE' | 'HIDDEN' | 'SOLD';
  complexId?: string;
  developerName?: string;
  search?: string;
  sortBy?: 'price' | 'area' | 'rooms' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface Complex {
  id: string;
  name: { uz: string; ru: string; en: string } | string;
  address?: { uz: string; ru: string; en: string } | string;
  city: string;
  coverImage: string | null;
  title?: string;
  locationText?: string;
  locationLat?: number;
  locationLng?: number;
  bannerImageUrl?: string | null;
  permission1Url?: string | null;
  permission2Url?: string | null;
  permission3Url?: string | null;
  walkabilityRating?: number | null;
  airQualityRating?: number | null;
  nearbyNote?: string | null;
  nearbyPlaces?: Array<{
    name: string;
    distanceMeters: number;
    note?: string | null;
  }>;
  amenities?: string[];
  _count?: {
    apartments: number;
  };
}

export interface CreateApartmentData {
  title: { uz: string; ru: string; en: string };
  description?: { uz: string; ru: string; en: string };
  price: number;
  rooms: number;
  area: number;
  floor: number;
  address: string;
  developerName: string;
  contactPhone: string;
  contactTelegram?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  materials?: { uz: string; ru: string; en: string };
  complexId?: string;
}

export interface UpdateApartmentData extends Partial<CreateApartmentData> {}

export interface AdminStats {
  totalListings: number;
  activeListings: number;
  hiddenListings: number;
  soldListings: number;
  pendingReviews: number;
  todayApprovals: number;
  todayRejections: number;
  flaggedContent: number;
}

export interface SellerListingsResponse {
  success: boolean;
  data: {
    apartments: Apartment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

export const apartmentsApi = {
  getApartments: async (params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    try {
      const processedParams = {
        ...params,
        limit: params.limit ? parseInt(params.limit.toString(), 10) : 20,
        page: params.page ? parseInt(params.page.toString(), 10) : 1,
      };

      const response = await apiClient.get<{
        success: boolean;
        data: PaginatedResponse<Apartment>;
      }>('/apartments', {
        params: processedParams,
      });

      return (
        response.data.data || {
          apartments: [],
          pagination: {
            page: processedParams.page || 1,
            limit: processedParams.limit || 20,
            total: 0,
            totalPages: 0,
          },
        }
      );
    } catch (error) {
      return {
        apartments: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
          totalPages: 0,
        },
      };
    }
  },

  getAllApartments: async (params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    return apartmentsApi.getApartments({ ...params, limit: 1000 });
  },

  getApartmentById: async (id: string): Promise<ApartmentDetail> => {
    const response = await apiClient.get<{
      success: boolean;
      data: ApartmentDetail;
    }>(`/apartments/${id}`);

    if (response.data.success) {
      return response.data.data;
    }

    if ((response.data as any)?.data) {
      return (response.data as any).data;
    }

    throw new Error('Failed to fetch apartment details');
  },

  getComplexes: async (): Promise<Complex[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Complex[] }>(
        '/complexes'
      );
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  },

  getComplexById: async (id: string): Promise<Complex | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Complex }>(
        `/complexes/${id}`
      );
      return response.data.data || null;
    } catch (error) {
      return null;
    }
  },

  getOtherApartments: async (apartmentId: string, limit: number = 6): Promise<Apartment[]> => {
    const response = await apiClient.get<{ success: boolean; data: Apartment[] }>(
      `/complexes/apartments/${apartmentId}/other`,
      { params: { limit } }
    );
    return response.data.data;
  },

  searchApartments: async (
    query: string,
    params: FilterParams = {}
  ): Promise<PaginatedResponse<Apartment>> => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: PaginatedResponse<Apartment>;
      }>('/apartments', {
        params: { ...params, search: query },
      });
      return (
        response.data.data || {
          apartments: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        }
      );
    } catch (error) {
      return {
        apartments: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }
  },

  createApartment: async (data: CreateApartmentData, images: UploadFile[] = []) => {
    const formData = new FormData();
    formData.append('apartment', JSON.stringify(data));
    images.forEach((image) => {
      formData.append('images', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    });

    const response = await apiClient.post<{ success: boolean; data: ApartmentDetail }>(
      '/apartments',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  },

  updateApartment: async (id: string, data: UpdateApartmentData) => {
    const response = await apiClient.put<{ success: boolean; data: ApartmentDetail }>(
      `/apartments/${id}`,
      data
    );
    return response.data.data;
  },

  deleteApartment: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      `/apartments/${id}`
    );
    return response.data;
  },

  getMyListings: async (): Promise<Apartment[]> => {
    try {
      const response = await apiClient.get<SellerListingsResponse>('/apartments/seller/my');
      if (response.data.success && response.data.data) {
        return response.data.data.apartments || [];
      }
      if (response.data.success && Array.isArray((response.data as any).data)) {
        return (response.data as any).data;
      }
      return [];
    } catch (error) {
      return [];
    }
  },

  uploadImages: async (apartmentId: string, images: UploadFile[]) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', {
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    });

    const response = await apiClient.post<{ success: boolean; data: ApartmentDetail }>(
      `/apartments/${apartmentId}/images`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  },

  deleteImage: async (apartmentId: string, imageId: string) => {
    const response = await apiClient.delete<{ success: boolean }>(
      `/apartments/${apartmentId}/images/${imageId}`
    );
    return response.data;
  },

  reorderImages: async (apartmentId: string, imageIds: string[]) => {
    const response = await apiClient.put<{ success: boolean; data: ApartmentDetail }>(
      `/apartments/${apartmentId}/images/reorder`,
      { imageIds }
    );
    return response.data.data;
  },

  getApartmentsByStatus: async (status: string, params: FilterParams = {}) => {
    return apartmentsApi.getAllApartments({ ...params, status });
  },

  getAdminStats: async (): Promise<AdminStats> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: AdminStats }>(
        '/admin/stats'
      );
      return response.data.data;
    } catch (error) {
      return {
        totalListings: 0,
        activeListings: 0,
        hiddenListings: 0,
        soldListings: 0,
        pendingReviews: 0,
        todayApprovals: 0,
        todayRejections: 0,
        flaggedContent: 0,
      };
    }
  },

  exportApartments: async (format: 'csv' | 'json' = 'csv') => {
    const response = await apiClient.get(`/admin/export/apartments`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
