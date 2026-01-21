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
    createdAt: string;
    updatedAt: string;
  };
}

export const authApi = {
  // Login user
  login: async (data: LoginInput): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // Register user
  register: async (data: RegisterInput): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
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