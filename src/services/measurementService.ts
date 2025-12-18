/*import { apiClient } from './api';

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
};*/
//




import { apiClient } from './api';

// Shape returned by backend
export interface BackendMeasurement {
  _id: string;
  customer_id: string;
  customer_name: string;
  measurement_date: string;
  values: Record<string, string>;
  notes?: string;
}

export interface Measurement {
  id: string; // frontend ID (MongoDB _id)
  customer_id: string;
  customer_name: string;
  measurement_date: string;
  values: Record<string, string>;
  notes?: string;
}

export interface CreateMeasurementData {
  customer_id: string;
  customer_name: string;
  measurement_date?: string;
  values: Record<string, string>;
  notes?: string;
}

export interface UpdateMeasurementData extends Partial<CreateMeasurementData> {
  id: string;
}

// Helper to convert backend → frontend
const mapMeasurement = (m: BackendMeasurement): Measurement => ({
  id: m._id,
  customer_id: m.customer_id,
  customer_name: m.customer_name,
  measurement_date: m.measurement_date,
  values: m.values,
  notes: m.notes,
});

export const measurementService = {
  async getAll(): Promise<Measurement[]> {
    const response = await apiClient.get<{ data: BackendMeasurement[] }>('/measurements');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapMeasurement);
  },

  async getById(id: string): Promise<Measurement> {
    const response = await apiClient.get<{ data: BackendMeasurement }>(`/measurements/${id}`);
    return mapMeasurement(response.data);
  },

  async getByCustomer(customerId: string): Promise<Measurement[]> {
    const response = await apiClient.get<{ data: BackendMeasurement[] }>(`/measurements/customer/${customerId}`);
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapMeasurement);
  },

  async create(data: CreateMeasurementData): Promise<Measurement> {
    const response = await apiClient.post<{ data: BackendMeasurement }>('/measurements', data);
    return mapMeasurement(response.data);
  },

  async update(data: UpdateMeasurementData): Promise<Measurement> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<{ data: BackendMeasurement }>(`/measurements/${id}`, updateData);
    return mapMeasurement(response.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/measurements/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    if (!Array.isArray(ids)) return;
    await Promise.all(ids.map((id) => apiClient.delete(`/measurements/${id}`)));
  },
};







