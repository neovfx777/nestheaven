import apiClient from './client';

export interface UserFavorite {
  id: string;
  userId: string;
  apartmentId: string;
  apartment: any;
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
  apartments: any[];
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
  isActive?: boolean;
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
  isActive?: boolean;
}

export const usersApi = {
  addFavorite: async (apartmentId: string) => {
    const response = await apiClient.post<{ success: boolean; data: UserFavorite }>(
      '/users/favorites',
      { apartmentId }
    );
    return response.data;
  },

  removeFavorite: async (apartmentId: string) => {
    const response = await apiClient.delete<{ success: boolean; data: { success: boolean } }>(
      `/users/favorites/${apartmentId}`
    );
    return response.data;
  },

  getFavorites: async (page: number = 1, limit: number = 20): Promise<FavoritesResponse> => {
    const response = await apiClient.get<{ success: boolean; data: FavoritesResponse }>(
      '/users/favorites',
      { params: { page, limit } }
    );
    return response.data.data;
  },

  checkFavoriteStatus: async (apartmentId: string): Promise<{ isFavorite: boolean }> => {
    const response = await apiClient.get<{ success: boolean; data: { isFavorite: boolean } }>(
      `/users/favorites/status/${apartmentId}`
    );
    return response.data.data;
  },

  batchCheckFavoriteStatus: async (apartmentIds: string[]): Promise<Record<string, boolean>> => {
    const response = await apiClient.post<{ success: boolean; data: Record<string, boolean> }>(
      '/users/favorites/batch-status',
      { apartmentIds }
    );
    return response.data.data;
  },

  saveSearch: async (name: string, filters: Record<string, any>) => {
    const response = await apiClient.post<{ success: boolean; data: SavedSearch }>(
      '/users/saved-searches',
      { name, filters }
    );
    return response.data;
  },

  getSavedSearches: async (): Promise<SavedSearch[]> => {
    const response = await apiClient.get<{ success: boolean; data: SavedSearch[] }>(
      '/users/saved-searches'
    );
    return response.data.data;
  },

  updateSavedSearch: async (id: string, data: { name?: string; filters?: Record<string, any> }) => {
    const response = await apiClient.put<{ success: boolean; data: SavedSearch }>(
      `/users/saved-searches/${id}`,
      data
    );
    return response.data;
  },

  deleteSavedSearch: async (id: string) => {
    const response = await apiClient.delete<{ success: boolean; data: { success: boolean } }>(
      `/users/saved-searches/${id}`
    );
    return response.data;
  },

  updateLastUsed: async (id: string) => {
    const response = await apiClient.put<{ success: boolean; data: SavedSearch }>(
      `/users/saved-searches/${id}/last-used`
    );
    return response.data;
  },

  getAdminUsers: async (params?: {
    role?: string;
    searchTerm?: string;
    searchBy?: string;
    mode?: string;
  }): Promise<AdminUsersResponse> => {
    const response = await apiClient.get<{ success: boolean; data: AdminUsersResponse }>(
      '/admin/users',
      { params }
    );
    return response.data.data;
  },

  createAdminUser: async (userData: CreateUserData) => {
    const response = await apiClient.post<{ success: boolean; data: AdminUser }>(
      '/admin/users',
      userData
    );
    return response.data;
  },

  getAdminUserById: async (id: string): Promise<AdminUser> => {
    const response = await apiClient.get<{ success: boolean; data: AdminUser }>(
      `/admin/users/${id}`
    );
    return response.data.data;
  },

  updateAdminUser: async (id: string, userData: UpdateUserData): Promise<AdminUser> => {
    const response = await apiClient.patch<{ success: boolean; data: AdminUser }>(
      `/admin/users/${id}`,
      userData
    );
    return response.data.data;
  },

  deleteAdminUser: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete<{ success: boolean; data: { success: boolean } }>(
      `/admin/users/${id}`
    );
    return response.data.data;
  },
};
