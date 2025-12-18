import { apiClient } from './api';
import { Order } from '../types/types';
import { customerService } from './customerService'; // to fetch customer details

// Backend shape
interface BackendOrder {
  _id: string;
  customerId: string; // just the ID
  item: string;
  status: string;
  deliveryDate: string;
  workerAssignment?: any[];
}

// Map backend → frontend
const mapOrder = async (o: BackendOrder): Promise<Order> => {
  let customerName = '';
  let customerPhone = '';

  try {
    const customer = await customerService.getById(o.customerId);
    customerName = customer.name;
    customerPhone = customer.phone;
  } catch {
    customerName = 'Unknown';
    customerPhone = '';
  }

  return {
    id: o._id,
    customer: customerName,
    phone: customerPhone,
    item: o.item,
    status: o.status as Order['status'],
    delivery_date: o.deliveryDate,
    workers: o.workerAssignment ?? [],
  };
};

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: BackendOrder[] }>('/orders');
    const list = Array.isArray(response.data?.data) ? response.data.data : [];
    return Promise.all(list.map(mapOrder));
  },

  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<{ data: BackendOrder }>(`/orders/${id}`);
    return mapOrder(response.data.data);
  },

  async create(data: {
    customerId: string; // just send ID
    item: string;
    status?: string;
    deliveryDate: string;
  }): Promise<Order> {
    const response = await apiClient.post<{ data: BackendOrder }>('/orders', data);
    return mapOrder(response.data.data);
  },

  async update(
    id: string,
    data: Partial<{
      customerId: string;
      item: string;
      status: string;
      deliveryDate: string;
    }>
  ): Promise<Order> {
    const response = await apiClient.put<{ data: BackendOrder }>(`/orders/${id}`, data);
    return mapOrder(response.data.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};
;



/*
// final
import { apiClient } from './api';
import { Order } from '../types/types';


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


export const orderService = {
 
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: BackendOrder[] }>('/orders');
    const list = Array.isArray(response.data?.data)
      ? response.data.data
      : [];
    return list.map(mapOrder);
  },


  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<{ data: BackendOrder }>(
      `/orders/${id}`
    );
    return mapOrder(response.data.data);
  },


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

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/orders/${id}`);
  },
};*/
























