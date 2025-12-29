import React from 'react';

export interface Item {
  id: number;
  name: string;
  code: string;
  type: string;
  barcode: string;
  orderNo: string;
  dateTime: string;
  category: string;
  subCategory: string;
  stock: number;
  saleRate: number;
  amount: number;
}

export enum FilterTimePeriod {
  ALL = 'All',
  TODAY = 'Today',
  THIS_WEEK = 'This Week',
  THIS_MONTH = 'This Month'
}

export interface NavItem {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  subItems?: string[];
}

// --- New Interfaces based on Prompt ---

export interface DashboardStats {
  today_sales: number;
  monthly_sales: number;
  pending_orders: number;
  ready_orders: number;
  unpaid_bills: number;
  upcoming_delivery: Array<{ name: string; delivery_date: string }>;
}

export interface Customer {
  id: number;
  _id?: string; // MongoDB _id for backend operations
  name: string;
  phone: string;
  orders: number;
  address?: string;
}

export interface WorkerAssignment {
  name: string;
  task: 'Cutting' | 'Stitching';
  commission: number;
}

export interface Order {
  id: number;
  _id?: string; // MongoDB _id for backend operations
  customerId?: string; // Backend uses customerId
  customer: string; // Display name (mapped from customerId)
  phone?: string; // Display phone (mapped from customerId)
  item: string;
  status: 'Pending' | 'Cutting' | 'Stitching' | 'Ready' | 'Delivered' | 'In Progress';
  delivery_date?: string;
  workers: WorkerAssignment[];
}

export interface Bill {
  _id?: string;
  bill_no: string;
  customer: string;
  phone?: string; // Added phone for search/invoice
  amount: number;
  paidAmount?: number; // Added for advance/partial payments
  status: 'Paid' | 'Unpaid';
  date: string;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Online';
}

export interface InvoiceItem {
  product: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceDetails {
  billNo: string;
  date: string;
  customer: {
    name: string;
    phone: string | number;
    address: string;
  };
  items: InvoiceItem[];
  payment: {
    method: string;
    total: number;
    paid: number;
    pending: number;
  };
  notes: string;
}

export interface Product {
  id: number;
  _id?: string; // MongoDB _id for backend operations
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

export interface Worker {
  id: string; // MongoDB _id as string
  _id?: string; // MongoDB _id for backend operations (legacy support)
  name: string;
  role: string;
  active_orders?: number; // Optional - may not be present in all responses
  completed_orders?: number; // Optional - may not be present in all responses
  total_commission?: number; // Optional - may not be present in all responses
  // Optional reporting fields
  orders?: Order[];
  cutting_earnings?: number;
  stitching_earnings?: number;
}

export type ViewState = 'dashboard' | 'customers' | 'orders' | 'workSchedule' | 'measurements' | 'products' | 'sizeCharts' | 'salesEntry' | 'salesReport' | 'workerReport';







////
/*import React from 'react';

export interface Item {
  id: number;
  name: string;
  code: string;
  type: string;
  barcode: string;
  orderNo: string;
  dateTime: string;
  category: string;
  subCategory: string;
  stock: number;
  saleRate: number;
  amount: number;
}

export enum FilterTimePeriod {
  ALL = 'All',
  TODAY = 'Today',
  THIS_WEEK = 'This Week',
  THIS_MONTH = 'This Month'
}

export interface NavItem {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  subItems?: string[];
}

// --- New Interfaces based on Prompt ---

export interface DashboardStats {
  today_sales: number;
  monthly_sales: number;
  pending_orders: number;
  ready_orders: number;
  unpaid_bills: number;
  upcoming_delivery: Array<{ name: string; delivery_date: string }>;
}

export interface Customer {
  id: number;
  _id?: string; // MongoDB _id for backend operations
  name: string;
  phone: string;
  orders: number;
  address?: string;
}

export interface WorkerAssignment {
  name: string;
  task: 'Cutting' | 'Stitching';
  commission: number;
}

export interface Order {
  id: number;
  _id?: string; // MongoDB _id for backend operations
  customerId?: string; // Backend uses customerId
  customer: string; // Display name (mapped from customerId)
  phone?: string; // Display phone (mapped from customerId)
  item: string;
  status: 'Pending' | 'Cutting' | 'Stitching' | 'Ready' | 'Delivered' | 'In Progress';
  delivery_date?: string;
  workers: WorkerAssignment[];
}

export interface Bill {
  bill_no: string;
  customer: string;
  phone?: string; // Added phone for search/invoice
  amount: number;
  paidAmount?: number; // Added for advance/partial payments
  status: 'Paid' | 'Unpaid';
  date: string;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Online';
}

export interface Product {
  id: number;
  _id?: string; // MongoDB _id for backend operations
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

export interface Worker {
  id: string; // MongoDB _id as string
  _id?: string; // MongoDB _id for backend operations (legacy support)
  name: string;
  role: string;
  active_orders?: number; // Optional - may not be present in all responses
  completed_orders?: number; // Optional - may not be present in all responses
  total_commission?: number; // Optional - may not be present in all responses
  // Optional reporting fields
  orders?: Order[];
  cutting_earnings?: number;
  stitching_earnings?: number;
}

export type ViewState = 'dashboard' | 'customers' | 'orders' | 'workSchedule' | 'measurements' | 'products' | 'sizeCharts' | 'salesEntry' | 'salesReport' | 'workerReport';

*/





