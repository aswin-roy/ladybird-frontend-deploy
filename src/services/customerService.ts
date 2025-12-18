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
import { apiClient } from './api';
import { Customer } from '../types/types';

export interface CreateCustomerData {
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: number;
}

// Shape returned by backend customer endpoints
interface BackendCustomer {
  _id: string;
  customername: string;
  customerphone: string | number;
  customeraddress?: string;
}

// Helper to map backend customer to frontend model
const mapCustomer = (c: BackendCustomer, index: number): Customer => ({
  id: index + 1, // Mongo uses string _id; we just need a stable numeric key for UI
  name: c.customername,
  phone: String(c.customerphone ?? ''),
  orders: 0, // Backend currently doesn't expose orders count
  address: c.customeraddress ?? '',
});

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await apiClient.get<{ data: BackendCustomer[] }>('/customers');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapCustomer);
  },

  async getById(id: number): Promise<Customer> {
    const response = await apiClient.get<{ data: BackendCustomer }>(`/customers/${id}`);
    return mapCustomer(response.data, 0);
  },

  async create(data: CreateCustomerData): Promise<Customer> {
    const payload = {
      customername: data.name,
      customerphone: data.phone,
      customeraddress: data.address,
    };
    const response = await apiClient.post<{ data: BackendCustomer }>('/customers', payload);
    return mapCustomer(response.data, 0);
  },

  async update(data: UpdateCustomerData): Promise<Customer> {
    const { id, name, phone, address, ...rest } = data;
    const payload: Partial<BackendCustomer> = {
      ...(name !== undefined && { customername: name }),
      ...(phone !== undefined && { customerphone: phone }),
      ...(address !== undefined && { customeraddress: address }),
      ...rest,
    };
    const response = await apiClient.put<{ data: BackendCustomer }>(`/customers/${id}`, payload);
    return mapCustomer(response.data, 0);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },

  // Backend doesn't currently support bulk delete; call delete sequentially for now
  async bulkDelete(ids: number[]): Promise<void> {
    if (!Array.isArray(ids)) return;
    await Promise.all(ids.map((id) => apiClient.delete(`/customers/${id}`)));
  },
};







