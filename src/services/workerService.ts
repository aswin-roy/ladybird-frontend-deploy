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
  async getAll(inputParams?: {
    type?: string;
    date?: string;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Worker[]> {
    const params = new URLSearchParams();
    if (inputParams) {
      if (inputParams.type) params.append('type', inputParams.type);
      if (inputParams.date) params.append('date', inputParams.date);
      if (inputParams.month) params.append('month', inputParams.month.toString());
      if (inputParams.year) params.append('year', inputParams.year.toString());
      if (inputParams.startDate) params.append('startDate', inputParams.startDate);
      if (inputParams.endDate) params.append('endDate', inputParams.endDate);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<any>(`/worker-reports${queryString}`);

    const workersList = response.workers || (response.data && response.data.workers) || [];

    if (!Array.isArray(workersList)) return [];

    return workersList.map((item: any) => {
      // Safely handle either item.worker or item itself
      const w = item.worker || item || {};
      const workerId = w.id || w._id || '';

      return {
        id: workerId,
        _id: workerId,
        name: w.name || '',
        role: w.role || '',
        active_orders: w.active_orders ?? 0,
        completed_orders: w.completed_orders ?? 0,
        total_commission: item.totalCommission ?? (w.cutting_earnings ?? 0) + (w.stitching_earnings ?? 0),
        cutting_earnings: item.totalsByTask?.Cutting ?? w.cutting_earnings ?? 0,
        stitching_earnings: item.totalsByTask?.Stitching ?? w.stitching_earnings ?? 0,
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















