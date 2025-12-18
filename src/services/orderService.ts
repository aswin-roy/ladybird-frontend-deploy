/*import { apiClient } from './api';
import { Order } from '../types/types';

/* Backend order shape */
interface BackendOrder {
  _id: string;
  customer: string;
  phone?: string;
  item: string;
  status?: Order['status'];
  delivery_date?: string;
  workers?: any[];
}

/* Map backend → frontend */
const mapOrder = (o: BackendOrder): Order => ({
  id: o._id,                 // IMPORTANT: use Mongo _id
  customer: o.customer ?? '',
  phone: o.phone ?? '',
  item: o.item ?? '',
  status: o.status ?? 'Pending',
  delivery_date: o.delivery_date ?? '',
  workers: o.workers ?? [],
});

export interface CreateOrderData {
  customer: string;
  phone?: string;
  item: string;
  status?: Order['status'];
  delivery_date?: string;
  workers?: any[];
}

export interface UpdateOrderData extends Partial<CreateOrderData> {
  id: string; // MongoDB id
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: BackendOrder[] }>('/orders');
    const list = Array.isArray(response.data?.data) ? response.data.data : [];
    return list.map(mapOrder);
  },

  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<{ data: BackendOrder }>(`/orders/${id}`);
    return mapOrder(response.data.data);
  },

  async create(data: CreateOrderData): Promise<Order> {
    const response = await apiClient.post<{ data: BackendOrder }>('/orders', data);
    return mapOrder(response.data.data);
  },

  async update(data: UpdateOrderData): Promise<Order> {
    const { id, ...updateData } = data;
    const response = await apiClient.put<{ data: BackendOrder }>(
      `/orders/${id}`,
      updateData
    );
    return mapOrder(response.data.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};
*/


// final
import { apiClient } from './api';
import { Order } from '../types/types';

// Backend order shape
interface BackendOrder {
  _id: string;
  customerId: {
    _id: string;
    customername: string;
    customerphone: number;
  };
  item: string;
  status: string;
  deliveryDate: string;
  workerAssignment?: any[];
  createdAt: string;
}

// Map backend → frontend
const mapOrder = (o: BackendOrder): Order => ({
  id: o._id, // ✅ Mongo ID
  customer: o.customerId?.customername ?? 'Unknown',
  phone: o.customerId?.customerphone
    ? String(o.customerId.customerphone)
    : '',
  item: o.item,
  status: o.status as Order['status'],
  delivery_date: o.deliveryDate,
  workers: o.workerAssignment ?? [],
});

export const orderService = {
  // ✅ GET ALL ORDERS
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: BackendOrder[] }>('/orders');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapOrder);
  },

  // ✅ GET ORDER BY ID
  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<{ data: BackendOrder }>(`/orders/${id}`);
    return mapOrder(response.data);
  },

  // ✅ CREATE ORDER
  async create(data: {
    customerId: string;
    item: string;
    status?: string;
    deliveryDate: string;
  }): Promise<Order> {
    const response = await apiClient.post<{ data: BackendOrder }>('/orders', data);
    return mapOrder(response.data);
  },

  // ✅ UPDATE ORDER
  async update(id: string, data: Partial<any>): Promise<Order> {
    const response = await apiClient.put<{ data: BackendOrder }>(
      `/orders/${id}`,
      data
    );
    return mapOrder(response.data);
  },

  // ✅ DELETE ORDER
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};




















