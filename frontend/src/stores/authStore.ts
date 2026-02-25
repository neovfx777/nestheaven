import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { authApi } from '../api/auth';
import { LoginInput, RegisterInput } from '../utils/validation';
import { firebaseAuth } from '../lib/firebase';

interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

interface RegisterResult {
  requiresEmailVerification: boolean;
  email?: string;
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
  registerUser: (data: RegisterInput) => Promise<RegisterResult>;
  fetchProfile: () => Promise<void>;
}

function normalizeUser(raw: any): User {
  const fullName =
    raw?.fullName ||
    [raw?.firstName, raw?.lastName].filter(Boolean).join(' ').trim() ||
    raw?.email ||
    'User';

  return {
    id: raw.id,
    email: raw.email,
    fullName,
    firstName: raw.firstName ?? null,
    lastName: raw.lastName ?? null,
    role: raw.role,
    isActive: raw.isActive,
    emailVerified: raw.emailVerified,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (user: User, token: string) =>
        set({ user, token, isAuthenticated: true, error: null }),

      logout: () => {
        signOut(firebaseAuth).catch(() => {});
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
          let signedInWithFirebase = false;
          let response: any = null;

          try {
            const credential = await signInWithEmailAndPassword(
              firebaseAuth,
              data.email.trim(),
              data.password
            );
            signedInWithFirebase = true;

            if (!credential.user.emailVerified) {
              try {
                await sendEmailVerification(credential.user);
              } catch (sendError) {
                console.warn('Verification email send failed:', sendError);
              }
              await signOut(firebaseAuth);
              const verifyError = new Error('Please verify your email before logging in');
              (verifyError as any).code = 'EMAIL_NOT_VERIFIED';
              throw verifyError;
            }

            const idToken = await credential.user.getIdToken();
            response = await authApi.loginWithFirebase(idToken);
          } catch (firebaseError: any) {
            const code = String(firebaseError?.code || '');
            const canFallbackToLegacy =
              code === 'auth/invalid-credential' ||
              code === 'auth/user-not-found' ||
              code === 'auth/wrong-password';

            if (!canFallbackToLegacy) {
              throw firebaseError;
            }

            // Fallback for legacy users that still exist only in local DB.
            response = await authApi.login(data);

            // If local login succeeded, backend syncs user into Firebase.
            // Next login/reset flow will go through Firebase normally.
            if (signedInWithFirebase) {
              await signOut(firebaseAuth);
            }
          }

          if (!response?.user || !response?.token) {
            throw new Error('Unexpected response format from server');
          }

          set({
            user: normalizeUser(response.user),
            token: response.token,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          console.error('Login error:', error);
          
          // Extract error message from various possible locations
          let message = 'Login failed. Please try again.';
          const code = String(error?.code || '');

          if (
            code === 'auth/invalid-credential' ||
            code === 'auth/user-not-found' ||
            code === 'auth/wrong-password' ||
            code === 'auth/invalid-email'
          ) {
            message = "Email yoki parol noto'g'ri";
          }

          if (code === 'auth/too-many-requests') {
            message = "Ko'p urinish bo'ldi. Keyinroq qayta urinib ko'ring.";
          }

          if (code === 'EMAIL_NOT_VERIFIED') {
            message = 'Emailingizni tasdiqlang. Tasdiqlash havolasi qayta yuborildi.';
          }
          
          if (error.response) {
            // Axios error with response
            message =
              error.response.data?.message ||
              error.response.data?.error ||
              error.response.statusText ||
              message;

            // Friendly/localized message for invalid credentials
            if (
              error.response.status === 401 ||
              message.toLowerCase().includes('invalid email or password')
            ) {
              message = "Email yoki parol noto'g'ri";
            }
            if (error.response.status === 403 && message.toLowerCase().includes('deactivated')) {
              message = 'Akkountingiz deaktiv qilingan';
            }
            if (
              error.response.status === 403 &&
              (error.response.data?.code === 'EMAIL_NOT_VERIFIED' ||
                message.toLowerCase().includes('verify your email'))
            ) {
              message = 'Emailingizni tasdiqlang. Keyin kirishingiz mumkin.';
            }
          } else if (error.message && !code.startsWith('auth/')) {
            // Standard Error object
            if (error.message.toLowerCase().includes('invalid email or password')) {
              message = "Email yoki parol noto'g'ri";
            } else if (error.message.toLowerCase().includes('deactivated')) {
              message = 'Akkountingiz deaktiv qilingan';
            } else if (error.message.toLowerCase().includes('verify your email')) {
              message = 'Emailingizni tasdiqlang. Keyin kirishingiz mumkin.';
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
          const credential = await createUserWithEmailAndPassword(
            firebaseAuth,
            registerData.email.trim(),
            registerData.password
          );

          if (registerData.fullName?.trim()) {
            await updateProfile(credential.user, {
              displayName: registerData.fullName.trim(),
            });
          }

          await sendEmailVerification(credential.user);
          const idToken = await credential.user.getIdToken();
          const response = await authApi.registerWithFirebase({
            idToken,
            fullName: registerData.fullName,
            phone: registerData.phone,
          });

          // Users should verify email first. Keep app logged out after register.
          await signOut(firebaseAuth);

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });

          if (response.user && response.token && credential.user.emailVerified) {
            set({
              user: normalizeUser(response.user),
              token: response.token,
              isAuthenticated: true,
              error: null,
            });
            return { requiresEmailVerification: false };
          }

          return {
            requiresEmailVerification: true,
            email: response.email || registerData.email,
          };
        } catch (error: any) {
          console.error('Register error:', error);
          
          let message = 'Registration failed. Please try again.';
          const code = String(error?.code || '');

          if (code === 'auth/email-already-in-use') {
            message = 'Bu email bilan foydalanuvchi allaqachon mavjud';
          } else if (code === 'auth/invalid-email') {
            message = "Email formati noto'g'ri";
          } else if (code === 'auth/weak-password') {
            message = "Parol kuchsiz. Kuchliroq parol kiriting.";
          }
          
          if (error.response) {
            message =
              error.response.data?.message ||
              error.response.data?.error ||
              error.response.statusText ||
              message;

            // Friendly message for duplicate email
            if (
              error.response.status === 409 ||
              message.toLowerCase().includes('email already registered')
            ) {
              message = 'Bu email bilan foydalanuvchi allaqachon mavjud';
            }
          } else if (error.message && !code.startsWith('auth/')) {
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

          if (!response?.user) {
            throw new Error('Failed to fetch profile.');
          }

          set({
            user: normalizeUser(response.user),
            error: null,
          });
        } catch (error: any) {
          const message =
            error.response?.data?.message ||
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
