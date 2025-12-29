import { apiClient } from './api';
import { Worker } from '../types/types';

export interface CreateWorkerData {
  name: string;
  role: string;
}

export interface UpdateWorkerData extends Partial<CreateWorkerData> {
  id: string; // MongoDB _id
}

// Backend worker structure
interface BackendWorker {
  _id: string;
  name: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
}

// Convert backend → frontend
const mapWorker = (w: BackendWorker): Worker => ({
  id: w._id,
  _id: w._id,
  name: w.name || '',
  role: w.role || '',
  active_orders: 0,
  completed_orders: 0,
  total_commission: 0,
  cutting_earnings: 0,
  stitching_earnings: 0,
});

export const workerService = {
  // ===== CRUD operations =====
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

  // ===== Worker reports with filters =====
  async getReports(params?: {
    type?: string;
    date?: string;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<Worker[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.type) query.append('type', params.type);
      if (params.date) query.append('date', params.date);
      if (params.month) query.append('month', params.month.toString());
      if (params.year) query.append('year', params.year.toString());
      if (params.startDate) query.append('startDate', params.startDate);
      if (params.endDate) query.append('endDate', params.endDate);
    }

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const response = await apiClient.get<any>(`/worker-reports${queryString}`);

    const list = Array.isArray(response.workers) ? response.workers : [];

    return list.map((item: any) => {
      const w = item.worker || {};
      return {
        id: w._id || w.id || '',
        _id: w._id || w.id || '',
        name: w.name || '',
        role: w.role || '',
        active_orders: w.active_orders ?? 0,
        completed_orders: w.completed_orders ?? 0,
        total_commission: item.totalCommission ?? 0,
        cutting_earnings: item.totalsByTask?.Cutting ?? 0,
        stitching_earnings: item.totalsByTask?.Stitching ?? 0,
      };
    });
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
















