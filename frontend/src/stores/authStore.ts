import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';
import { LoginInput, RegisterInput } from '../utils/validation';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  
  // API actions
  loginUser: (data: LoginInput) => Promise<void>;
  registerUser: (data: RegisterInput) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (user: User, token: string) =>
        set({ user, token, isAuthenticated: true, error: null }),

      logout: () => {
        // Clear everything on logout
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          error: null 
        });
        // Optional: Clear any other stored data
        localStorage.removeItem('auth-storage');
      },

      setUser: (user: User) => set({ user }),

      clearError: () => set({ error: null }),

      // API Actions
      loginUser: async (data: LoginInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          if (response.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Login failed. Please try again.',
          });
          throw error;
        }
      },

      registerUser: async (data: RegisterInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          if (response.success) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Registration failed. Please try again.',
          });
          throw error;
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.getProfile();
          if (response.success) {
            set({
              user: response.data,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Failed to fetch profile.',
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);