import { apiClient } from './api';
import { Worker } from '../types/types';

export interface CreateWorkerData {
  name: string;
  role: string;
}

export interface UpdateWorkerData extends Partial<CreateWorkerData> {
  id: string;
}

// Backend worker structure
interface BackendWorker {
  _id: string;
  name: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
  // Optional report fields (from worker-reports endpoint)
  active_orders?: number;
  completed_orders?: number;
  total_commission?: number;
  cutting_earnings?: number;
  stitching_earnings?: number;
  totalsByTask?: {
    Cutting?: number;
    Stitching?: number;
    [key: string]: number | undefined;
  };
}

// Helper to map backend worker to frontend format
const mapWorker = (backendWorker: BackendWorker): Worker => {
  const workerId = backendWorker._id || '';

  // Extract earnings from totalsByTask if available
  const cuttingEarnings = backendWorker.cutting_earnings ?? backendWorker.totalsByTask?.Cutting ?? 0;
  const stitchingEarnings = backendWorker.stitching_earnings ?? backendWorker.totalsByTask?.Stitching ?? 0;
  const totalCommission = backendWorker.total_commission ?? (cuttingEarnings + stitchingEarnings);

  return {
    id: workerId,
    _id: backendWorker._id,
    name: backendWorker.name || '',
    role: backendWorker.role || '',
    active_orders: backendWorker.active_orders ?? 0,
    completed_orders: backendWorker.completed_orders ?? 0,
    total_commission: totalCommission,
    cutting_earnings: cuttingEarnings,
    stitching_earnings: stitchingEarnings,
  };
};

export const workerService = {
  async getAll(): Promise<Worker[]> {
    // Fetch from worker-reports to get commission data
    const response = await apiClient.get<any>('/worker-reports');
    // response.data is { totalsByTask: {...}, totalCommission: ..., workers: [...] }
    // We need to map the workers array

    if (!response.data || !Array.isArray(response.data.workers)) {
      return [];
    }

    return response.data.workers.map((item: any) => {
      const w = item.worker;
      return {
        id: w.id || w._id,
        _id: w.id || w._id,
        name: w.name || '',
        role: w.role || '',
        active_orders: 0, // Not provided by this endpoint currently
        completed_orders: 0,
        total_commission: item.totalCommission || 0,
        cutting_earnings: item.totalsByTask?.Cutting || 0,
        stitching_earnings: item.totalsByTask?.Stitching || 0,
      };
    });
  },

  async getById(id: string): Promise<Worker> {
    const response = await apiClient.get<{ data: BackendWorker }>(`/workers/${id}`);
    return mapWorker(response.data);
  },

  async create(data: CreateWorkerData): Promise<Worker> {
    const response = await apiClient.post<{ data: BackendWorker }>('/workers', data);
    return mapWorker(response.data);
  },

  async update(data: UpdateWorkerData): Promise<Worker> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<{ data: BackendWorker }>(`/workers/${id}`, updateData);
    return mapWorker(response.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/workers/${id}`);
  },
};





///

/*
import { apiClient } from './api';
import { Worker } from '../types/types';

export interface CreateWorkerData {
  name: string;
  role: string;
}

export interface UpdateWorkerData extends Partial<CreateWorkerData> {
  id: string; // Use string for MongoDB _id
}

// Backend worker shape
interface BackendWorker {
  _id: string;
  name: string;
  role: string;
}

// Convert backend → frontend
const mapWorker = (w: BackendWorker): Worker => ({
  id: w._id,
  name: w.name || '',
  role: w.role || '',
});

export const workerService = {
  async getAll(): Promise<Worker[]> {
    const response = await apiClient.get<{ data: BackendWorker[] }>('/workers');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapWorker);
  },

  async getById(id: string): Promise<Worker> {
    const response = await apiClient.get<{ data: BackendWorker }>(`/workers/${id}`);
    return mapWorker(response.data);
  },

  async create(data: CreateWorkerData): Promise<Worker> {
    const response = await apiClient.post<{ data: BackendWorker }>('/workers', data);
    return mapWorker(response.data);
  },

  async update(data: UpdateWorkerData): Promise<Worker> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<{ data: BackendWorker }>(`/workers/${id}`, updateData);
    return mapWorker(response.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/workers/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    if (!Array.isArray(ids)) return;
    await Promise.all(ids.map((id) => apiClient.delete(`/workers/${id}`)));
  },
};*/
















///

/*
import { apiClient } from './api';
import { Worker } from '../types/types';

export interface CreateWorkerData {
  name: string;
  role: string;
}

export interface UpdateWorkerData extends Partial<CreateWorkerData> {
  id: string; // Use string for MongoDB _id
}

// Backend worker shape
interface BackendWorker {
  _id: string;
  name: string;
  role: string;
}

// Convert backend → frontend
const mapWorker = (w: BackendWorker): Worker => ({
  id: w._id,
  name: w.name || '',
  role: w.role || '',
});

export const workerService = {
  async getAll(): Promise<Worker[]> {
    const response = await apiClient.get<{ data: BackendWorker[] }>('/workers');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapWorker);
  },

  async getById(id: string): Promise<Worker> {
    const response = await apiClient.get<{ data: BackendWorker }>(`/workers/${id}`);
    return mapWorker(response.data);
  },

  async create(data: CreateWorkerData): Promise<Worker> {
    const response = await apiClient.post<{ data: BackendWorker }>('/workers', data);
    return mapWorker(response.data);
  },

  async update(data: UpdateWorkerData): Promise<Worker> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<{ data: BackendWorker }>(`/workers/${id}`, updateData);
    return mapWorker(response.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/workers/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    if (!Array.isArray(ids)) return;
    await Promise.all(ids.map((id) => apiClient.delete(`/workers/${id}`)));
  },
};*/












