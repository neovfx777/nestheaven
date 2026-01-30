import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Create axios instance
// Default backend URL points to local development API; can be overridden via VITE_API_URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

    // Don't auto-logout on auth endpoints themselves
    const isAuthEndpoint =
      url?.includes('/auth/login') || url?.includes('/auth/register');

    if (status === 401 && !isAuthEndpoint) {
      // Token expired or invalid on protected route
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;