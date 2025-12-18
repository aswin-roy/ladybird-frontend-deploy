/*import { apiClient } from './api';
import { Order } from '../types/types';

export interface CreateOrderData {
  customer: string;
  phone?: string;
  item: string;
  status?: Order['status'];
  delivery_date?: string;
  workers?: Array<{
    name: string;
    task: 'Cutting' | 'Stitching';
    commission: number;
  }>;
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  id: number;
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders');
  },

  async getById(id: number): Promise<Order> {
    return apiClient.get<Order>(`/orders/${id}`);
  },

  async create(data: CreateOrderData): Promise<Order> {
    return apiClient.post<Order>('/orders', data);
  },

  async update(data: UpdateOrderData): Promise<Order> {
    const { id, ...updateData } = data;
    return apiClient.put<Order>(`/orders/${id}`, updateData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/orders/${id}`);
  },
};*/

// final
import { apiClient } from './api';
import { Order } from '../types/types';

// Backend order shape
interface BackendOrder {
  _id: string;
  customer: string;
  phone?: string;
  item: string;
  status?: string;
  delivery_date?: string;
  workers?: Array<{
    name: string;
    task: 'Cutting' | 'Stitching';
    commission: number;
  }>;
}

// Map backend → frontend
const mapOrder = (o: BackendOrder, index: number): Order => ({
  id: index + 1, // UI-only id
  customer: o.customer,
  phone: o.phone ?? '',
  item: o.item,
  status: (o.status as Order['status']) ?? 'Pending',
  delivery_date: o.delivery_date ?? '',
  workers: o.workers ?? [],
});

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: BackendOrder[] }>('/orders');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapOrder);
  },

  async getById(id: number): Promise<Order> {
    const response = await apiClient.get<{ data: BackendOrder }>(`/orders/${id}`);
    return mapOrder(response.data, 0);
  },

  async create(data: Omit<Order, 'id'>): Promise<Order> {
    const payload: BackendOrder = {
      ...data,
      _id: '', // backend will generate
    };
    const response = await apiClient.post<{ data: BackendOrder }>('/orders', payload);
    return mapOrder(response.data, 0);
  },

  async update(data: Partial<Order> & { id: number }): Promise<Order> {
    const { id, ...rest } = data;
    const payload: Partial<BackendOrder> = { ...rest };
    const response = await apiClient.put<{ data: BackendOrder }>(`/orders/${id}`, payload);
    return mapOrder(response.data, 0);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};






