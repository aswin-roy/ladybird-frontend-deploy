/*import { apiClient } from './api';
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
};*/



//
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

// Shape returned by backend inventory endpoints
interface BackendInventoryItem {
  _id: string;
  productname: string;
  skucode: string;
  category: string;
  price: number;
  stock: number;
}

const mapInventoryItem = (item: BackendInventoryItem): Product => ({
  id: 0, // UI uses id mainly as a key; backend uses _id string
  _id: item._id, // Preserve MongoDB _id for backend operations
  name: item.productname,
  sku: item.skucode,
  category: item.category,
  price: item.price,
  stock: item.stock,
});

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get<{ data: BackendInventoryItem[] }>('/inventory');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapInventoryItem);
  },

  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<{ data: BackendInventoryItem }>(`/inventory/${id}`);
    return mapInventoryItem(response.data);
  },

  async create(data: CreateProductData): Promise<Product> {
    const payload = {
      productname: data.name,
      skucode: data.sku,
      category: data.category,
      price: data.price,
      stock: data.stock,
    };
    const response = await apiClient.post<{ data: BackendInventoryItem }>('/inventory', payload);
    return mapInventoryItem(response.data);
  },

  async update(data: UpdateProductData): Promise<Product> {
    const { id, name, sku, category, price, stock, ...rest } = data;
    const payload: Partial<BackendInventoryItem> = {
      ...(name !== undefined && { productname: name }),
      ...(sku !== undefined && { skucode: sku }),
      ...(category !== undefined && { category }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...rest,
    };
    const response = await apiClient.put<{ data: BackendInventoryItem }>(`/inventory/${id}`, payload);
    return mapInventoryItem(response.data);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/inventory/${id}`);
  },
};




