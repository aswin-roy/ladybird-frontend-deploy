/*import { apiClient } from './api';
import { Worker } from '../types/types';

export interface CreateWorkerData {
  name: string;
  role: string;
}

export interface UpdateWorkerData extends Partial<CreateWorkerData> {
  id: number;
}

export const workerService = {
  async getAll(): Promise<Worker[]> {
    return apiClient.get<Worker[]>('/workers');
  },

  async getById(id: number): Promise<Worker> {
    return apiClient.get<Worker>(`/workers/${id}`);
  },

  async create(data: CreateWorkerData): Promise<Worker> {
    return apiClient.post<Worker>('/workers', data);
  },

  async update(data: UpdateWorkerData): Promise<Worker> {
    const { id, ...updateData } = data;
    return apiClient.put<Worker>(`/workers/${id}`, updateData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/workers/${id}`);
  },
};*/
///


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
};








