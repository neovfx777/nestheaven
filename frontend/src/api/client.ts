import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Create axios instance
<<<<<<< HEAD
// Default: local backend for development. Set VITE_API_URL for production (e.g. http://45.92.173.175:3000/api).
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
=======
// In production, always use same-origin '/api' (served via Nginx proxy).
// In local dev, allow VITE_API_URL override.
const envApiBaseUrl = (import.meta.env.VITE_API_URL || '').trim();
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const apiBaseUrl = isLocalhost ? envApiBaseUrl || '/api' : '/api';
>>>>>>> 0abd38e674230bb7faff8463c1a7d98e727441ff
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getAssetUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = apiBaseUrl.replace(/\/api\/?$/, '');
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors on protected routes only
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string | undefined = error.config?.url;
    const message = (error.response?.data?.message || error.response?.data?.error || '').toString();

    // Don't auto-logout on auth endpoints themselves
    const isAuthEndpoint =
      url?.includes('/auth/login') || url?.includes('/auth/register');
    const isAuthFlowEndpoint =
      isAuthEndpoint ||
      url?.includes('/auth/verify-email') ||
      url?.includes('/auth/resend-verification') ||
      url?.includes('/auth/forgot-password') ||
      url?.includes('/auth/reset-password');

    if ((status === 401 || (status === 403 && message.toLowerCase().includes('deactivated'))) && !isAuthFlowEndpoint) {
      // Token expired or invalid on protected route
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
