import axios from 'axios';
import { HealthResponse, User, DeveloperProfile, RepositorySummary } from '../types';

export const api = axios.create({
  baseURL: '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if stored in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stackpulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const apiService = {
  // System Health
  getHealth: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  },

  // Authentication
  register: async (data: { email: string; password: string; name?: string }): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },

  login: async (data: { email: string; password: string }): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  // Developer Profile & Intelligence
  getDeveloper: async (username: string, refresh = false): Promise<DeveloperProfile> => {
    const response = await api.get(`/developers/${encodeURIComponent(username)}`, {
      params: refresh ? { refresh: 'true' } : {},
    });
    return response.data.data;
  },

  getDeveloperRepos: async (
    username: string,
    params: {
      q?: string;
      language?: string;
      sortBy?: 'stars' | 'pushed' | 'name';
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ repositories: RepositorySummary[]; totalCount: number; page: number; totalPages: number }> => {
    const response = await api.get(`/developers/${encodeURIComponent(username)}/repos`, { params });
    return response.data.data;
  },

  refreshDeveloper: async (username: string): Promise<DeveloperProfile> => {
    const response = await api.post(`/developers/${encodeURIComponent(username)}/refresh`);
    return response.data.data;
  },
};

export default api;
