import apiClient from './client';
import { LoginInput, RegisterInput } from '../utils/validation';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  token?: string;
  user?: AuthUser;
  success?: boolean;
  requiresEmailVerification?: boolean;
  email?: string;
  message?: string;
}

export interface ProfileResponse {
  user: AuthUser & {
    phone?: string | null;
    updatedAt?: string;
  };
}

export interface BasicMessageResponse {
  success: boolean;
  message: string;
}

interface FirebaseRegisterPayload {
  idToken: string;
  fullName?: string;
  phone?: string;
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
    const response = await apiClient.get<ProfileResponse>('/auth/me');
    return response.data;
  },

  loginWithFirebase: async (idToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { idToken });
    return response.data;
  },

  registerWithFirebase: async (payload: FirebaseRegisterPayload): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', payload);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<BasicMessageResponse> => {
    const response = await apiClient.get<BasicMessageResponse>('/auth/verify-email', {
      params: { token },
    });
    return response.data;
  },

  resendVerification: async (email: string): Promise<BasicMessageResponse> => {
    const response = await apiClient.post<BasicMessageResponse>('/auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<BasicMessageResponse> => {
    const response = await apiClient.post<BasicMessageResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<BasicMessageResponse> => {
    const response = await apiClient.post<BasicMessageResponse>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  // Refresh token (if implemented in backend)
  refreshToken: async (token: string) => {
    const response = await apiClient.post('/auth/refresh', { token });
    return response.data;
  },
};
