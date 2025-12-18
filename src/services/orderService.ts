import { apiClient } from './api';

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface BackendCustomer {
  _id: string;
  customername: string;
  customerphone: number;
}

const mapCustomer = (c: BackendCustomer): Customer => ({
  id: c._id,
  name: c.customername ?? '',
  phone: String(c.customerphone ?? ''),
});

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await apiClient.get<{ data: BackendCustomer[] }>('/customers');
    return Array.isArray(response.data?.data)
      ? response.data.data.map(mapCustomer)
      : [];
  },
};



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























