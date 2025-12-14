import { apiClient } from './api';
import { Product } from '../types/types';

export interface CreateProductData {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    return apiClient.get<Product[]>('/products');
  },

  async getById(id: number): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  async create(data: CreateProductData): Promise<Product> {
    return apiClient.post<Product>('/products', data);
  },

  async update(data: UpdateProductData): Promise<Product> {
    const { id, ...updateData } = data;
    return apiClient.put<Product>(`/products/${id}`, updateData);
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/products/${id}`);
  },
};




