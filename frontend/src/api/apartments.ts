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
  seller?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface ApartmentDetail {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  descriptionUz: string | null;
  descriptionRu: string | null;
  descriptionEn: string | null;
  price: number;
  rooms: number;
  area: number;
  floor: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: 'ACTIVE' | 'HIDDEN' | 'SOLD';
  developerName: string;
  developerId: string | null;
  airQualityIndex: number | null;
  airQualitySource: string | null;
  infrastructure: any;
  investmentGrowthPercent: number | null;
  contactPhone: string;
  contactTelegram: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
  complex: {
    id: string;
    name: string;
    coverImage: string | null;
  } | null;
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
    email: string;
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
  contactInfo?: {
    phone: string;
    telegram: string | null;
    whatsapp: string | null;
    email: string | null;
  };
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

export interface CreateApartmentData {
  title: { uz: string; ru: string; en: string };
  description?: { uz: string; ru: string; en: string };
  price: number;
  rooms: number;
  area: number;
  floor: number;
  address: string;
  latitude?: number;
  longitude?: number;
  developerName: string;
  developerId?: string;
  complexId?: string;
  airQualityIndex?: number;
  airQualitySource?: string;
  infrastructure?: any;
  infrastructureNote?: { uz: string; ru: string; en: string };
  investmentGrowthPercent?: number;
  investmentGrowthNote?: { uz: string; ru: string; en: string };
  contactPhone: string;
  contactTelegram?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  installmentOptions?: any;
  materials?: { uz: string; ru: string; en: string };
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
  getOtherApartments: async (apartmentId: string, limit: number = 6): Promise<Apartment[]> => {
    const response = await apiClient.get<{ success: boolean; data: Apartment[] }>(
      `/complexes/apartments/${apartmentId}/other`,
      { params: { limit } }
    );
    return response.data.data;
  },

  // Search apartments
  searchApartments: async (query: string, params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Apartment> }>('/apartments', {
      params: { ...params, search: query }
    });
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
  },

  // Update apartment
  updateApartment: async (id: string, data: UpdateApartmentData): Promise<ApartmentDetail> => {
    const response = await apiClient.put<{ success: boolean; data: ApartmentDetail }>(`/apartments/${id}`, data);
    return response.data.data;
  },

  // Delete apartment
  deleteApartment: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/apartments/${id}`);
    return response.data;
  },

  // Get seller's apartments
  getMyListings: async (): Promise<Apartment[]> => {
    const response = await apiClient.get<{ success: boolean; data: Apartment[] }>('/apartments/seller/my');
    return response.data.data;
  },

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
  
  // Get all apartments for admin (includes hidden)
  getAllApartments: async (params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Apartment> }>(
      '/apartments', 
      { 
        params: { 
          ...params, 
          status: params.status || undefined // Don't filter by default for admin
        } 
      }
    );
    return response.data.data;
  },

  // Get admin statistics
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get<{ success: boolean; data: AdminStats }>('/admin/stats');
    return response.data.data;
  },

  // Get apartments by status for admin
  getApartmentsByStatus: async (status: string, params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<Apartment> }>(
      '/apartments', 
      { 
        params: { 
          ...params, 
          status 
        } 
      }
    );
    return response.data.data;
  },

  // Get apartments needing review (admin)
  getPendingReviews: async (params: FilterParams = {}): Promise<PaginatedResponse<Apartment>> => {
    // This endpoint needs to be implemented in backend
    // For now, we'll filter active apartments without images or with incomplete info
    const allApartments = await apartmentsApi.getAllApartments(params);
    const pending = allApartments.apartments.filter(apt => {
      // Simple logic: apartments that might need review
      return apt.status === 'ACTIVE' && (!apt.coverImage || !apt.titleUz || !apt.titleRu || !apt.titleEn);
    });
    
    return {
      apartments: pending,
      pagination: allApartments.pagination
    };
  },

  // Get flagged content (admin)
  getFlaggedContent: async (): Promise<any[]> => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/admin/flagged-content');
    return response.data.data;
  },

  // Export apartments data (admin)
  exportApartments: async (format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    const response = await apiClient.get(`/admin/export/apartments`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },
};