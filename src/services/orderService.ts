import { apiClient } from './api';
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
};




