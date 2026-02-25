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
  constructionStatus?: 'available' | 'built' | null;
  readyByYear?: number | null;
  readyByMonth?: number | null;
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
  // Legacy fields
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
  constructionStatus?: 'available' | 'built' | null;
  readyByYear?: number | null;
  readyByMonth?: number | null;
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
    locationLat?: number | null;
    locationLng?: number | null;
    nearbyPlaces?: Array<{
      name: string;
      distanceMeters: number;
      note?: string | null;
    }> | null;
    nearbyNote?: string | null;
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
  title?: { uz: string; ru: string; en: string } | string;
  description?: { uz: string; ru: string; en: string } | string | null;
  developer?: string | null;
  blockCount?: number;
  locationText?: string;
  locationLat?: number;
  locationLng?: number;
  location?: {
    lat: number;
    lng: number;
    address: { uz: string; ru: string; en: string };
  };
  /** Banner image URL – returned by API as bannerImage */
  bannerImage?: string | null;
  bannerImageUrl?: string | null;
  permission1Url?: string | null;
  permission2Url?: string | null;
  permission3Url?: string | null;
  permissions?: {
    permission1: string;
    permission2: string;
    permission3: string;
  } | null;
  walkability?: number | null;
  airQuality?: number | null;
  walkabilityRating?: number | null; // Legacy field
  airQualityRating?: number | null; // Legacy field
  nearbyNote?: string | null;
  nearbyPlaces?: Array<{
    name: string;
    type?: string;
    distanceMeters?: number;
    distanceKm?: number;
    note?: string | null;
  }> | null;
  nearby?: Array<{
    name: string;
    type?: string;
    distanceMeters?: number;
    distanceKm?: number;
    note?: string | null;
  }> | null;
  amenities?: string[];
  allowedSellers?: string[];
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
  totalFloors?: number;
  address: string;
  developerName?: string;
  developer?: string;
  contactPhone: string;
  contactTelegram?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  materials?: { uz: string; ru: string; en: string };
  infrastructureNote?: { uz: string; ru: string; en: string };
  complexId?: string;
  constructionStatus?: 'available' | 'built';
  readyByYear?: number | null;
  readyByMonth?: number | null;
}

export interface UpdateApartmentData extends Partial<CreateApartmentData> { }

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

export const apartmentsApi = {
  // Get apartments with filtering - MUHIM O'ZGARTIRISH
  getApartments: async (params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    try {
      // ADMIN uchun max limit 1000, oddiy foydalanuvchilar uchun 100
      const isAdminRequest = params.limit && params.limit > 100;

      // Limitni string bo'lsa numberga aylantiramiz
      const processedParams = {
        ...params,
        limit: params.limit ? parseInt(params.limit.toString()) : 20,
        page: params.page ? parseInt(params.page.toString()) : 1
      };

      // Admin uchun yuborayotgan requestda limit 1000 bo'lsa, backend bizning yangi validatsiyamizda (1000 gacha) qabul qiladi
      const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Apartment> }>('/apartments', {
        params: processedParams
      });

      return response.data.data || {
        apartments: [],
        pagination: {
          page: processedParams.page || 1,
          limit: processedParams.limit || 20,
          total: 0,
          totalPages: 0
        }
      };
    } catch (error: any) {
      console.error('Failed to fetch apartments:', error);

      // Agar 400 xatosi bo'lsa (masalan, limit juda katta)
      if (error.response?.status === 400) {
        // Limitni kamaytirib qayta urinib ko'ramiz
        const retryParams = { ...params, limit: 100 };
        try {
          const retryResponse = await apiClient.get<{ success: boolean; data: PaginatedResponse<Apartment> }>('/apartments', {
            params: retryParams
          });
          return retryResponse.data.data || { apartments: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } };
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
      }

      return {
        apartments: [],
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  // Admin uchun maxsus method - butun listni olish
  getAllApartments: async (params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    return apartmentsApi.getApartments({ ...params, limit: 1000 });
  },

  getApartmentById: async (id: string): Promise<ApartmentDetail> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: ApartmentDetail }>(`/apartments/${id}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to fetch apartment details');
      }
    } catch (error: any) {
      console.error('Failed to fetch apartment by ID:', error);

      // Agar backend noto'g'ri formatda qaytarsa, biz structure'ni to'ldiramiz
      if (error.response?.data) {
        const data = error.response.data;
        if (data.data) {
          // Backend { success: true, data: apartment } formatida qaytarsa
          return data.data;
        } else if (data.success && data.data) {
          return data.data;
        } else if (data.apartment) {
          return data.apartment as ApartmentDetail;
        }
      }

      throw error;
    }
  },

  // Get complexes
  getComplexes: async (): Promise<Complex[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Complex[] }>('/complexes');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch complexes:', error);
      return [];
    }
  },

  // Get complexes for seller (only complexes where seller is in allowedSellers)
  getComplexesForSeller: async (): Promise<Complex[]> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Complex[] }>('/complexes/for-seller');
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch complexes for seller:', error);
      return [];
    }
  },

  // Get other apartments in same complex
  getOtherApartments: async (apartmentId: string, limit: number = 6): Promise<Apartment[]> => {
    const response = await apiClient.get<{ success: boolean; data: Apartment[] }>(
      `/complexes/apartments/${apartmentId}/other`,
      { params: { limit } }
    );
    return response.data.data;
  },

  // Search apartments
  searchApartments: async (query: string, params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Apartment> }>('/apartments', {
        params: { ...params, search: query }
      });
      return response.data.data || { apartments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    } catch (error) {
      console.error('Failed to search apartments:', error);
      return { apartments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
    }
  },

<<<<<<< HEAD
  getById: async (id: string): Promise<ApartmentDetail> => apartmentsApi.getApartmentById(id),

  create: async (data: Record<string, unknown>): Promise<ApartmentDetail> => {
    const response = await apiClient.post<{ success: boolean; data: ApartmentDetail }>('/apartments', data);
    return response.data.data;
  },

  update: async (id: string, data: Record<string, unknown>): Promise<ApartmentDetail> => {
    const response = await apiClient.patch<{ success: boolean; data: ApartmentDetail }>(`/apartments/${id}`, data);
    return response.data.data;
  },

  // Create apartment (seller only)
  createApartment: async (data: CreateApartmentData, images: File[] = []): Promise<ApartmentDetail> => {
    const formData = new FormData();

    // Append apartment data as JSON
    formData.append('apartment', JSON.stringify(data));

    // Append images
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await apiClient.post<{ success: boolean; data: ApartmentDetail }>('/apartments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
=======
  // Create apartment (seller/owner admin)
  createApartment: async (data: CreateApartmentData): Promise<ApartmentDetail> => {
    const response = await apiClient.post<ApartmentDetail>('/apartments', data);
    return response.data;
>>>>>>> 0abd38e674230bb7faff8463c1a7d98e727441ff
  },

  // Update apartment
  updateApartment: async (id: string, data: UpdateApartmentData): Promise<ApartmentDetail> => {
    const response = await apiClient.patch<ApartmentDetail>(`/apartments/${id}`, data);
    return response.data;
  },

  // Delete apartment
  deleteApartment: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/apartments/${id}`);
    return response.data;
  },

  // Get seller's apartments
  getMyListings: async (): Promise<Apartment[]> => {
    try {
      const response = await apiClient.get<SellerListingsResponse>('/apartments/seller/my');

      if (response.data.success && response.data.data) {
        return response.data.data.apartments || [];
      } else if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch seller listings:', error);
      return [];
    }
  },

  // Backward-compatible aliases used by dashboard forms
  getById: async (id: string): Promise<ApartmentDetail> => apartmentsApi.getApartmentById(id),
  create: async (data: CreateApartmentData): Promise<ApartmentDetail> => apartmentsApi.createApartment(data),
  update: async (id: string, data: UpdateApartmentData): Promise<ApartmentDetail> =>
    apartmentsApi.updateApartment(id, data),

  // Upload images for apartment
  uploadImages: async (apartmentId: string, images: File[]): Promise<ApartmentDetail> => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await apiClient.post<{ success: boolean; data: ApartmentDetail }>(
      `/apartments/${apartmentId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // Delete image
  deleteImage: async (apartmentId: string, imageId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean }>(`/apartments/${apartmentId}/images/${imageId}`);
    return response.data;
  },

  // Reorder images
  reorderImages: async (apartmentId: string, imageIds: string[]): Promise<ApartmentDetail> => {
    const response = await apiClient.put<{ success: boolean; data: ApartmentDetail }>(
      `/apartments/${apartmentId}/images/reorder`,
      { imageIds }
    );
    return response.data.data;
  },

  // === ADMIN METHODS ===

  // Get apartments by status for admin
  getApartmentsByStatus: async (status: string, params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    return apartmentsApi.getAllApartments({ ...params, status });
  },

  // Get admin statistics
  getAdminStats: async (): Promise<AdminStats> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: AdminStats }>('/analytics/stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      return {
        totalListings: 0,
        activeListings: 0,
        hiddenListings: 0,
        soldListings: 0,
        pendingReviews: 0,
        todayApprovals: 0,
        todayRejections: 0,
        flaggedContent: 0
      };
    }
  },

  // Export apartments data (admin) - TODO: Implement this endpoint in backend
  exportApartments: async (format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    // This endpoint doesn't exist yet in the backend
    throw new Error('Export endpoint not implemented yet');
    // const response = await apiClient.get(`/admin/export/apartments`, {
    //   params: { format },
    //   responseType: 'blob'
    // });
    // return response.data;
  },
};
