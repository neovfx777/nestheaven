import apiClient from './client';

export interface UserFavorite {
  id: string;
  userId: string;
  apartmentId: string;
  apartment: any; // This will be the apartment object
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: Record<string, any>;
  resultsCount?: number;
  lastUsed: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoritesResponse {
  apartments: any[]; // Array of apartment objects with favorite metadata
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  filters: {
    role: string | null;
    searchTerm: string | null;
    searchBy: string;
  };
  search: {
    term: string | null;
    by: string;
    performed: boolean;
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

export const usersApi = {
  // Add apartment to favorites
  addFavorite: async (apartmentId: string) => {
    const response = await apiClient.post<{ success: boolean; data: UserFavorite }>('/users/favorites', {
      apartmentId,
    });
    return response.data;
  },

  // Remove apartment from favorites
  removeFavorite: async (apartmentId: string) => {
    const response = await apiClient.delete<{ success: boolean; data: { success: boolean } }>(
      `/users/favorites/${apartmentId}`
    );
    return response.data;
  },

  // Get user favorites
  getFavorites: async (page: number = 1, limit: number = 20): Promise<FavoritesResponse> => {
    const response = await apiClient.get<{ success: boolean; data: FavoritesResponse }>('/users/favorites', {
      params: { page, limit },
    });
    return response.data.data;
  },

  // Check if apartment is in favorites
  checkFavoriteStatus: async (apartmentId: string): Promise<{ isFavorite: boolean }> => {
    const response = await apiClient.get<{ success: boolean; data: { isFavorite: boolean } }>(
      `/users/favorites/status/${apartmentId}`
    );
    return response.data.data;
  },

  // Batch check favorite status for multiple apartments
  batchCheckFavoriteStatus: async (apartmentIds: string[]): Promise<Record<string, boolean>> => {
    const response = await apiClient.post<{ success: boolean; data: Record<string, boolean> }>(
      '/users/favorites/batch-status',
      { apartmentIds }
    );
    return response.data.data;
  },

  // Save search
  saveSearch: async (name: string, filters: Record<string, any>) => {
    const response = await apiClient.post<{ success: boolean; data: SavedSearch }>('/users/saved-searches', {
      name,
      filters,
    });
    return response.data;
  },

  // Get saved searches
  getSavedSearches: async (): Promise<SavedSearch[]> => {
    const response = await apiClient.get<{ success: boolean; data: SavedSearch[] }>('/users/saved-searches');
    return response.data.data;
  },

  // Update saved search
  updateSavedSearch: async (id: string, data: { name?: string; filters?: Record<string, any> }) => {
    const response = await apiClient.put<{ success: boolean; data: SavedSearch }>(`/users/saved-searches/${id}`, data);
    return response.data;
  },

  // Delete saved search
  deleteSavedSearch: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; data: { success: boolean } }>(
      `/users/saved-searches/${id}`
    );
    return response.data;
  },

  // Update last used time for saved search
  updateLastUsed: async (id: string) => {
    const response = await apiClient.put<{ success: boolean; data: SavedSearch }>(
      `/users/saved-searches/${id}/last-used`
    );
    return response.data;
  },

  // ADMIN FUNCTIONS - User Management
  
  // Get all users (admin only)
  getAdminUsers: async (params?: {
    role?: string;
    searchTerm?: string;
    searchBy?: string;
  }): Promise<AdminUsersResponse> => {
    const response = await apiClient.get<{ success: boolean; data: AdminUsersResponse }>('/admin/users', {
      params,
    });
    return response.data.data;
  },

  // Create user (admin only)
  createAdminUser: async (userData: CreateUserData) => {
    const response = await apiClient.post<{ success: boolean; data: AdminUser }>('/admin/users', userData);
    return response.data;
  },

  // Get user by ID (admin only)
  getAdminUserById: async (id: string): Promise<AdminUser> => {
    const response = await apiClient.get<{ success: boolean; data: AdminUser }>(`/admin/users/${id}`);
    return response.data.data;
  },

  // Update user (admin only)
  updateAdminUser: async (id: string, userData: UpdateUserData): Promise<AdminUser> => {
    const response = await apiClient.patch<{ success: boolean; data: AdminUser }>(`/admin/users/${id}`, userData);
    return response.data.data;
  },

  // Delete user (admin only)
  deleteAdminUser: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean; data: { success: boolean } }>(`/admin/users/${id}`);
    return response.data.data;
  },
};