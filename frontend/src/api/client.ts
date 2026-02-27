import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Create axios instance
// Default: local backend for development. Set VITE_API_URL for production (e.g. http://45.92.173.175:3000/api).
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getAssetUrl(url?: string | null) {
  if (!url) return null;
  const base = apiBaseUrl.replace(/\/api\/?$/, '');
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Normalize local absolute URLs (localhost/127.0.0.1) to current API origin.
    // This avoids broken images when stored host differs from current runtime host.
    try {
      const incoming = new URL(url);
      const current = new URL(base);
      const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0']);
      const sameHost = incoming.hostname === current.hostname;
      const bothLocal = localHosts.has(incoming.hostname) && localHosts.has(current.hostname);
      if (sameHost || bothLocal) {
        return `${current.origin}${incoming.pathname}${incoming.search}${incoming.hash}`;
      }
    } catch {
      // Keep original URL if parsing fails.
    }
    return url;
  }
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
