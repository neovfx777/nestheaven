import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL || 'http://45.92.173.175:3000/api';

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout for mobile networks
});

export function getAssetUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = apiBaseUrl.replace(/\/api\/?$/, '');
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
}

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string | undefined = error.config?.url;
    const message = (
      error.response?.data?.message || error.response?.data?.error || ''
    ).toString();

    // Log network errors for debugging
    if (!error.response) {
      console.error('Network error:', error.message, 'URL:', apiBaseUrl + (url || ''));
    }

    const isAuthEndpoint =
      url?.includes('/auth/login') || url?.includes('/auth/register');

    if (
      (status === 401 ||
        (status === 403 && message.toLowerCase().includes('deactivated'))) &&
      !isAuthEndpoint
    ) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default apiClient;
