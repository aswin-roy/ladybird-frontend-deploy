


import { apiClient } from './api';
import { Bill, InvoiceDetails } from '../types/types';

export interface CreateBillData {
  customer: string;
  phone?: string;
  amount: number;
  paymentMode: Bill['paymentMode'];
  items: Array<{
    product_id?: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface AddPaymentData {
  bill_id: string;
  amount: number;
  totalPaid: number;
  paymentMode: Bill['paymentMode'];
  reference_number?: string;
}

export const billService = {
  async getAll(): Promise<Bill[]> {
    const response = await apiClient.get<any>('/api/sales-report');
    return response.data || [];
  },

  async getById(id: number): Promise<Bill> {
    return apiClient.get<Bill>(`/bills/${id}`);
  },

  async getByBillNo(billNo: string): Promise<Bill> {
    return apiClient.get<Bill>(`/bills/bill-no/${billNo}`);
  },

  async create(data: CreateBillData): Promise<Bill> {
    return apiClient.post<Bill>('/bills', data);
  },

  async addPayment(data: AddPaymentData): Promise<Bill> {
    return apiClient.put<Bill>(`/salesentries/${data.bill_id}`, {
      paidAmount: data.totalPaid,
      // We don't change payment mode on partial payment usually, but if needed:
      // paymentMethod: data.paymentMode 
    });
  },
  async getInvoiceForPrint(id: string): Promise<{ data: InvoiceDetails }> {
    return apiClient.get<{ data: InvoiceDetails }>(`/invoice-print/${id}`);
  },
};











/*

import { apiClient } from './api';
import { Bill } from '../types/types';

export interface CreateBillData {
  customer: string;
  phone?: string;
  amount: number;
  paymentMode: Bill['paymentMode'];
  items: Array<{
    product_id?: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface AddPaymentData {
  bill_id: string;
  amount: number;
  totalPaid: number;
  paymentMode: Bill['paymentMode'];
  reference_number?: string;
}

export const billService = {
  async getAll(): Promise<Bill[]> {
    const response = await apiClient.get<any>('/api/sales-report');
    return response.data || [];
  },

  async getById(id: number): Promise<Bill> {
    return apiClient.get<Bill>(`/bills/${id}`);
  },

  async getByBillNo(billNo: string): Promise<Bill> {
    return apiClient.get<Bill>(`/bills/bill-no/${billNo}`);
  },

  async create(data: CreateBillData): Promise<Bill> {
    return apiClient.post<Bill>('/bills', data);
  },

  async addPayment(data: AddPaymentData): Promise<Bill> {
    return apiClient.put<Bill>(`/salesentries/${data.bill_id}`, {
      paidAmount: data.totalPaid,
      // We don't change payment mode on partial payment usually, but if needed:
      // paymentMethod: data.paymentMode 
    });
  },
};
*/










