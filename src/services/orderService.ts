/*import { apiClient } from './api';
import { Order } from '../types/types';


interface BackendOrder {
  _id: string;
  customer: string;
  phone?: string;
  item: string;
  status?: Order['status'];
  delivery_date?: string;
  workers?: any[];
}


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

/* ================= BACKEND SHAPE ================= */
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
}

/* ================= MAPPER ================= */
const mapOrder = (o: BackendOrder): Order => ({
  id: o._id,
  customer: o.customerId?.customername ?? '',
  phone: o.customerId?.customerphone
    ? String(o.customerId.customerphone)
    : '',
  item: o.item ?? '',
  status: o.status as Order['status'],
  delivery_date: o.deliveryDate ?? '',
  workers: o.workerAssignment ?? [],
});

/* ================= SERVICE ================= */
export const orderService = {
  // ✅ GET ALL
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: BackendOrder[] }>('/orders');
    const list = Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    return list.map(mapOrder);
  },

  // ✅ GET BY ID
  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<{ data: BackendOrder }>(
      `/orders/${id}`
    );
    return mapOrder(response.data.data);
  },

  // ✅ CREATE (IMPORTANT)
  async create(data: {
    customerId: string;   // ✅ backend expects this
    item: string;
    status?: string;
    deliveryDate: string;
  }): Promise<Order> {
    const response = await apiClient.post<{ data: BackendOrder }>(
      '/orders',
      data
    );
    return mapOrder(response.data.data);
  },

  // ✅ UPDATE
  async update(
    id: string,
    data: Partial<{
      item: string;
      status: string;
      deliveryDate: string;
    }>
  ): Promise<Order> {
    const response = await apiClient.put<{ data: BackendOrder }>(
      `/orders/${id}`,
      data
    );
    return mapOrder(response.data.data);
  },

  // ✅ DELETE
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};






















