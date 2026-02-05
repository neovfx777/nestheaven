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
          
          // Debug: log response to see what we're getting
          console.log('Login response:', response);

          // Backend returns { success: true, data: { user, token } }
          // Handle both success: true and direct data structure
          if (response) {
            // Case 1: Standard format { success: true, data: { user, token } }
            if (response.success === true && response.data) {
              set({
                user: response.data.user,
                token: response.data.token,
                isAuthenticated: true,
                error: null,
              });
              return; // Success, exit early
            }
            
            // Case 2: Direct data format { user, token } (without success wrapper)
            if ((response as any).user && (response as any).token) {
              set({
                user: (response as any).user,
                token: (response as any).token,
                isAuthenticated: true,
                error: null,
              });
              return; // Success, exit early
            }
            
            // Case 3: Error response { success: false, error: "..." }
            if (response.success === false) {
              const errorMsg = (response as any)?.error || 'Login failed. Please check your credentials.';
              set({ error: errorMsg });
              throw new Error(errorMsg);
            }
          }
          
          // If we get here, response structure is unexpected
          throw new Error('Unexpected response format from server');
        } catch (error: any) {
          console.error('Login error:', error);
          
          // Extract error message from various possible locations
          let message = 'Login failed. Please try again.';
          
          if (error.response) {
            // Axios error with response
            message =
              error.response.data?.error ||
              error.response.data?.message ||
              error.response.statusText ||
              message;

            // Friendly/localized message for invalid credentials
            if (
              error.response.status === 401 ||
              message.toLowerCase().includes('invalid email or password')
            ) {
              message = "Email yoki parol noto'g'ri";
            }
          } else if (error.message) {
            // Standard Error object
            if (error.message.toLowerCase().includes('invalid email or password')) {
              message = "Email yoki parol noto'g'ri";
            } else {
              message = error.message;
            }
          }

          set({ error: message });
          throw error;
        } finally {
          // Always stop loading, even if something unexpected happens
          set({ isLoading: false });
        }
      },

      registerUser: async (data: RegisterInput) => {
        set({ isLoading: true, error: null });
        try {
          // Remove confirmPassword before sending to backend
          const { confirmPassword, ...registerData } = data;
          
          const response = await authApi.register(registerData);
          
          console.log('Register response:', response);

          // Handle both success: true and direct data structure
          if (response) {
            // Case 1: Standard format { success: true, data: { user, token } }
            if (response.success === true && response.data) {
              set({
                user: response.data.user,
                token: response.data.token,
                isAuthenticated: true,
                error: null,
              });
              return; // Success, exit early
            }
            
            // Case 2: Direct data format { user, token } (without success wrapper)
            if ((response as any).user && (response as any).token) {
              set({
                user: (response as any).user,
                token: (response as any).token,
                isAuthenticated: true,
                error: null,
              });
              return; // Success, exit early
            }
            
            // Case 3: Error response { success: false, error: "..." }
            if (response.success === false) {
              const errorMsg = (response as any)?.error || 'Registration failed. Please check your data.';
              set({ error: errorMsg });
              throw new Error(errorMsg);
            }
          }
          
          throw new Error('Unexpected response format from server');
        } catch (error: any) {
          console.error('Register error:', error);
          
          let message = 'Registration failed. Please try again.';
          
          if (error.response) {
            message =
              error.response.data?.error ||
              error.response.data?.message ||
              error.response.statusText ||
              message;

            // Friendly message for duplicate email
            if (
              error.response.status === 409 ||
              message.toLowerCase().includes('email already registered')
            ) {
              message = 'Bu email bilan foydalanuvchi allaqachon mavjud';
            }
          } else if (error.message) {
            if (error.message.toLowerCase().includes('email already registered')) {
              message = 'Bu email bilan foydalanuvchi allaqachon mavjud';
            } else {
              message = error.message;
            }
          }

          set({ error: message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.getProfile();

          if (!response?.success || !response.data) {
            throw new Error('Failed to fetch profile.');
          }

          set({
            user: response.data,
            error: null,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.error ||
            error.message ||
            'Failed to fetch profile.';

          set({
            error: message,
          });
          throw error;
        } finally {
          set({ isLoading: false });
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