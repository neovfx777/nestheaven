import apiClient from './client';
import { LoginInput, RegisterInput } from '../utils/validation';

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      isActive?: boolean;
    };
    token: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      role: string;
      isActive?: boolean;
      createdAt: string;
    };
    token: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
    role: string;
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export const authApi = {
  // Login user
  login: async (data: LoginInput): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', data);
      // Axios wraps the response, so response.data is the actual API response
      return response.data;
    } catch (error: any) {
      // Re-throw with better error info
      throw error;
    }
  },

  // Register user
  register: async (data: Omit<RegisterInput, 'confirmPassword'>): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Get user profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ProfileResponse>('/auth/profile');
    return response.data;
  },

  // Refresh token (if implemented in backend)
  refreshToken: async (token: string) => {
    const response = await apiClient.post('/auth/refresh', { token });
    return response.data;
  },
};
