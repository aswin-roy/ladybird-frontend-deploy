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
};




