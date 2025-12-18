/*import { apiClient } from './api';
import { Customer } from '../types/types';

export interface CreateCustomerData {
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: number;
}

export const customerService = {
  async getAll(): Promise<Customer[]> {
    return apiClient.get<Customer[]>('/customers');
  },

  async getById(id: number): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  async create(data: CreateCustomerData): Promise<Customer> {
    return apiClient.post<Customer>('/customers', data);
  },

  async update(data: UpdateCustomerData): Promise<Customer> {
    const { id, ...updateData } = data;
    return apiClient.put<Customer>(`/customers/${id}`, updateData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/customers/${id}`);
  },

  async bulkDelete(ids: number[]): Promise<void> {
    return apiClient.post('/customers/bulk-delete', { ids });
  },
};*/

//
/*import { apiClient } from './api';
import { Customer } from '../types/types';

export interface CreateCustomerData {
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: number;
}

// Backend customer shape
interface BackendCustomer {
  _id: string;
  customername: string;
  customerphone: string | number;
  customeraddress?: string;
}

// Convert backend → frontend
const mapCustomer = (c: BackendCustomer, index: number): Customer => ({
  id: index + 1, // UI-only id
  name: c.customername,
  phone: String(c.customerphone ?? ''),
  orders: 0, // default, backend doesn't expose
  address: c.customeraddress ?? '',
});

export const customerService = {
  // GET all customers
  async getAll(): Promise<Customer[]> {
    const response = await apiClient.get<BackendCustomer[]>('/customers');
    const list = Array.isArray(response) ? response : [];
    return list.map(mapCustomer);
  },

  // GET customer by ID
  async getById(id: number): Promise<Customer> {
    const response = await apiClient.get<BackendCustomer>(`/customers/${id}`);
    return mapCustomer(response, 0);
  },

  // CREATE customer
  async create(data: CreateCustomerData): Promise<Customer> {
    const payload = {
      customername: data.name,
      customerphone: data.phone,
      customeraddress: data.address,
    };
    const response = await apiClient.post<BackendCustomer>('/customers', payload);
    return mapCustomer(response, 0);
  },

  // UPDATE customer
  async update(data: UpdateCustomerData): Promise<Customer> {
    const { id, name, phone, address } = data;
    const payload: Partial<BackendCustomer> = {
      ...(name !== undefined && { customername: name }),
      ...(phone !== undefined && { customerphone: phone }),
      ...(address !== undefined && { customeraddress: address }),
    };
    const response = await apiClient.put<BackendCustomer>(`/customers/${id}`, payload);
    return mapCustomer(response, 0);
  },

  // DELETE customer
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  // BULK delete (sequential)
  async bulkDelete(ids: number[]): Promise<void> {
    if (!Array.isArray(ids)) return;
    await Promise.all(ids.map((id) => apiClient.delete(`/customers/${id}`)));
  },
};*/
// final

import { apiClient } from './api';
import { Customer } from '../types/types';

export interface CreateCustomerData {
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string; // <-- Use string to match MongoDB _id
}

// Backend customer shape
interface BackendCustomer {
  _id: string;
  customername: string;
  customerphone: string | number;
  customeraddress?: string;
}

// Convert backend → frontend
const mapCustomer = (c: BackendCustomer): Customer => ({
  id: c._id, // <-- Use _id as id
  name: c.customername,
  phone: String(c.customerphone ?? ''),
  orders: 0, // default, backend doesn't expose
  address: c.customeraddress ?? '',
});

export const customerService = {
  // GET all customers
  async getAll(): Promise<Customer[]> {
    const response = await apiClient.get<{ data: BackendCustomer[] }>('/customers');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapCustomer);
  },

  // GET customer by ID
  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get<{ data: BackendCustomer }>(`/customers/${id}`);
    return mapCustomer(response.data);
  },

  // CREATE customer
  async create(data: CreateCustomerData): Promise<Customer> {
    const payload = {
      customername: data.name,
      customerphone: data.phone,
      customeraddress: data.address,
    };
    const response = await apiClient.post<{ data: BackendCustomer }>('/customers', payload);
    return mapCustomer(response.data);
  },

  // UPDATE customer
  async update(data: UpdateCustomerData): Promise<Customer> {
    const { id, name, phone, address } = data;
    const payload: Partial<BackendCustomer> = {
      ...(name !== undefined && { customername: name }),
      ...(phone !== undefined && { customerphone: phone }),
      ...(address !== undefined && { customeraddress: address }),
    };
    const response = await apiClient.put<{ data: BackendCustomer }>(`/customers/${id}`, payload);
    return mapCustomer(response.data);
  },

  // DELETE customer
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  // BULK delete (sequential)
  async bulkDelete(ids: string[]): Promise<void> {
    if (!Array.isArray(ids)) return;
    await Promise.all(ids.map((id) => apiClient.delete(`/customers/${id}`)));
  },
};
















