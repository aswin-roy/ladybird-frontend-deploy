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
  bill_id: number;
  amount: number;
  paymentMode: Bill['paymentMode'];
  reference_number?: string;
}

export const billService = {
  async getAll(): Promise<Bill[]> {
    return apiClient.get<Bill[]>('/bills');
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
    return apiClient.post<Bill>(`/bills/${data.bill_id}/payment`, {
      amount: data.amount,
      payment_mode: data.paymentMode,
      reference_number: data.reference_number,
    });
  },
};




