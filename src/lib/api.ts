import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';
import { User, Trade, CalendarMetric, TradingStats, AccountListItem, TradingAccount, AccountSummary } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let cachedToken: string | null = null;
supabase.auth.onAuthStateChange((_, session) => {
  cachedToken = session?.access_token ?? null;
});

api.interceptors.request.use((config) => {
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 && error.response?.data?.error === 'ACCOUNT_PENDING') {
      window.location.href = '/pending';
    }
    return Promise.reject(error);
  }
);

export default api;

// --- SERVICIOS ---

export const userService = {
  getMe: () => api.get<{ user: User }>('/users/me'),
  updateMe: (data: Partial<User>) => api.patch('/users/me', data),
};

export const adminService = {
  getAllUsers: (page = 1, limit = 20) =>
    api.get<{ data: User[]; meta: { total: number; page: number; limit: number } }>(
      `/admin/users?page=${page}&limit=${limit}`
    ),
  getUser: (id: string) => api.get<{ user: User }>(`/admin/users/${id}`),
  updateUser: (id: string, data: Partial<User>) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

export const accountService = {
  getAll: () =>
    api.get<{ accounts: AccountListItem[] }>('/accounts'),

  getById: (id: string) =>
    api.get<{ account: TradingAccount; summary: AccountSummary }>(`/accounts/${id}`),

  create: (data: {
    name: string;
    broker: string;
    account_type: string;
    initial_balance: number;
    profit_target?: number;
    max_drawdown_limit?: number;
    currency?: string;
  }) => api.post<{ account: TradingAccount }>('/accounts', data),

  update: (id: string, data: {
    name?: string;
    broker?: string;
    status?: string;
    profit_target?: number;
    max_drawdown_limit?: number;
  }) => api.patch<{ account: TradingAccount }>(`/accounts/${id}`, data),

  delete: (id: string) => api.delete(`/accounts/${id}`),
};

export const tradeService = {
  getAll: (accountId: string, page = 1, limit = 10) =>
    api.get<{ data: Trade[]; meta: { total: number; page: number; limit: number } }>(
      `/accounts/${accountId}/trades?page=${page}&limit=${limit}`
    ),

  getById: (accountId: string, tradeId: string) =>
    api.get<{ trade: Trade }>(`/accounts/${accountId}/trades/${tradeId}`),

  create: (accountId: string, data: Partial<Trade>) =>
    api.post(`/accounts/${accountId}/trades`, data),

  update: (accountId: string, tradeId: string, data: Partial<Trade>) =>
    api.patch(`/accounts/${accountId}/trades/${tradeId}`, data),

  delete: (accountId: string, tradeId: string) =>
    api.delete(`/accounts/${accountId}/trades/${tradeId}`),
};

export const dashboardService = {
  getCalendarMetrics: (accountId: string, startDate?: string, endDate?: string) =>
    api.get<{ data: CalendarMetric[] }>(`/accounts/${accountId}/dashboard/calendar`, {
      params: { start_date: startDate, end_date: endDate },
    }),

  getStats: (accountId: string, startDate?: string, endDate?: string) =>
    api.get<{ stats: TradingStats }>(`/accounts/${accountId}/dashboard/stats`, {
      params: { start_date: startDate, end_date: endDate },
    }),
};
