import { apiClient } from './api';

export interface Measurement {
  id: number;
  customer_id: number;
  customer_name: string;
  measurement_date: string;
  values: Record<string, string>;
  notes?: string;
}

export interface CreateMeasurementData {
  customer_id: number;
  customer_name: string;
  measurement_date?: string;
  values: Record<string, string>;
  notes?: string;
}

export interface UpdateMeasurementData extends Partial<CreateMeasurementData> {
  id: number;
}

export const measurementService = {
  async getAll(): Promise<Measurement[]> {
    return apiClient.get<Measurement[]>('/measurements');
  },

  async getById(id: number): Promise<Measurement> {
    return apiClient.get<Measurement>(`/measurements/${id}`);
  },

  async getByCustomer(customerId: number): Promise<Measurement[]> {
    return apiClient.get<Measurement[]>(`/measurements/customer/${customerId}`);
  },

  async create(data: CreateMeasurementData): Promise<Measurement> {
    return apiClient.post<Measurement>('/measurements', data);
  },

  async update(data: UpdateMeasurementData): Promise<Measurement> {
    const { id, ...updateData } = data;
    return apiClient.put<Measurement>(`/measurements/${id}`, updateData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/measurements/${id}`);
  },
};




