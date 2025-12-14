import { apiClient } from './api';
import { DashboardStats } from '../types/types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },
};




