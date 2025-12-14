import { apiClient } from './api';
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
};




