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
  id: String;
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
};
//
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
  id: string; // <-- use string _id
}

// Backend order shape
interface BackendOrder {
  _id: string;
  customer: string;
  phone?: string;
  item: string;
  status?: string;
  delivery_date?: string;
  workers?: Array<{ name: string; task: 'Cutting' | 'Stitching'; commission: number }>;
}

// Convert backend → frontend
const mapOrder = (o: BackendOrder): Order => ({
  id: o._id, // <-- use real MongoDB _id
  customer: o.customer,
  phone: o.phone ?? '',
  item: o.item,
  status: o.status ?? 'Pending',
  delivery_date: o.delivery_date ?? '',
  workers: o.workers ?? [],
});

export const orderService = {
  // GET all orders
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: BackendOrder[] }>('/orders');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapOrder);
  },

  // GET order by ID
  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<{ data: BackendOrder }>(`/orders/${id}`);
    return mapOrder(response.data);
  },

  // CREATE order
  async create(data: CreateOrderData): Promise<Order> {
    const response = await apiClient.post<{ data: BackendOrder }>('/orders', data);
    return mapOrder(response.data);
  },

  // UPDATE order
  async update(data: UpdateOrderData): Promise<Order> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<{ data: BackendOrder }>(`/orders/${id}`, updateData);
    return mapOrder(response.data);
  },

  // DELETE order
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },

  // BULK delete (sequential)
  async bulkDelete(ids: string[]): Promise<void> {
    if (!Array.isArray(ids)) return;
    await Promise.all(ids.map((id) => apiClient.delete(`/orders/${id}`)));
  },
};*/

















