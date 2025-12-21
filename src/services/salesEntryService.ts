import { apiClient } from './api';

export interface CreateSalesEntryData {
  customerId: string; // MongoDB ObjectId string
  items: Array<{
    product: string; // MongoDB ObjectId string
    quantity: number;
    rate: number;
  }>;
  paymentMethod: 'upi' | 'cash' | 'card';
  paidAmount?: number;
  notes?: string;
}

export interface SalesEntry {
  _id: string;
  customerId: string | {
    _id: string;
    customername?: string;
    customerphone?: string | number;
  };
  items: Array<{
    product: string | {
      _id: string;
      productname?: string;
      price?: number;
    };
    quantity: number;
    rate: number;
    amount: number;
  }>;
  paymentMethod: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const salesEntryService = {
  async create(data: CreateSalesEntryData): Promise<SalesEntry> {
    const response = await apiClient.post<{ data: SalesEntry }>('/salesentries', data);
    return response.data;
  },

  async getAll(): Promise<SalesEntry[]> {
    const response = await apiClient.get<{ data: SalesEntry[] }>('/salesentries');
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: string): Promise<SalesEntry> {
    const response = await apiClient.get<{ data: SalesEntry }>(`/salesentries/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateSalesEntryData>): Promise<SalesEntry> {
    const response = await apiClient.put<{ data: SalesEntry }>(`/salesentries/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/salesentries/${id}`);
  },
};

export const createSaleEntry = (data: any) => {
  console.log("Creating sale entry:", data);
};
