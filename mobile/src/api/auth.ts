import apiClient from './client';
import { LoginInput } from '../utils/validation';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isActive?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ProfileResponse {
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

function normalizeUser(user: AuthUser): AuthUser {
  if (!user) return user;
  const composedName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return {
    ...user,
    fullName: user.fullName || composedName || undefined,
  };
}

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return {
      ...response.data,
      user: normalizeUser(response.data.user),
    };
  },

  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return {
      ...response.data,
      user: normalizeUser(response.data.user),
    };
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ProfileResponse>('/auth/me');
    return {
      user: normalizeUser(response.data.user),
    };
  },

  refreshToken: async (token: string) => {
    const response = await apiClient.post('/auth/refresh', { token });
    return response.data;
  },
};
