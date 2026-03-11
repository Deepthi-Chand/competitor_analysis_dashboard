import axios, { AxiosResponse } from 'axios';
import { DashboardMeta, DashboardData, DashboardFilters } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    const axiosError = error as { response?: { data?: unknown }; message?: string };
    console.error('API Error:', axiosError.response?.data || axiosError.message);
    return Promise.reject(error);
  }
);

export const fetchDashboardMeta = async (): Promise<DashboardMeta> => {
  const response = await api.get<DashboardMeta>('/dashboard/meta');
  return response.data;
};

export const fetchDashboardData = async (filters: Partial<DashboardFilters> = {}): Promise<DashboardData> => {
  const response = await api.get<DashboardData>('/dashboard/data', { params: filters });
  return response.data;
};

export const fetchChartData = async (chartId: string): Promise<unknown> => {
  const response = await api.get(`/dashboard/${chartId}`);
  return response.data;
};

export const checkHealth = async (): Promise<unknown> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
