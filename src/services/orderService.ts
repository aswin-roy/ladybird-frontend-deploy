/*import { apiClient } from './api';
import { Order, WorkerAssignment } from '../types/types';

// Backend order structure
interface BackendOrder {
  _id: string;
  customerId: string | {
    _id: string;
    customername?: string;
    customerphone?: string | number;
  };
  item: string;
  status: string;
  deliveryDate?: string;
  workerAssignment?: Array<{
    worker: string | {
      _id: string;
      workername?: string;
      name?: string;
    };
    task: string;
    date?: string;
    commission: number;
  }>;
  createdAt?: string;
}

// Create/Update data sent to backend
export interface CreateOrderData {
  customerId: string;
  item: string;
  status?: Order['status'];
  deliveryDate?: string;
  workerAssignment?: Array<{
    worker: string;
    task: 'Cutting' | 'Stitching';
    commission: number;
  }>;
}

export interface UpdateOrderData {
  id: number;
  customerId?: string;
  item?: string;
  status?: Order['status'];
  deliveryDate?: string;
  workerAssignment?: Array<{
    worker: string;
    task: 'Cutting' | 'Stitching';
    commission: number;
  }>;
}

// Helper to map backend order to frontend format
const mapOrder = (backendOrder: BackendOrder): Order => {
  const customerId = typeof backendOrder.customerId === 'string' 
    ? backendOrder.customerId 
    : backendOrder.customerId._id;
  
  const customer = typeof backendOrder.customerId === 'object' && backendOrder.customerId
    ? (backendOrder.customerId.customername || '')
    : '';
  
  const phone = typeof backendOrder.customerId === 'object' && backendOrder.customerId
    ? String(backendOrder.customerId.customerphone || '')
    : '';

  // Map workerAssignment to workers array
  const workers: WorkerAssignment[] = (backendOrder.workerAssignment || []).map(wa => {
    const workerName = typeof wa.worker === 'object' && wa.worker
      ? (wa.worker.name || '')
      : '';
    
    return {
      name: workerName,
      task: (wa.task === 'Cutting' ? 'Cutting' : 'Stitching') as 'Cutting' | 'Stitching',
      commission: wa.commission || 0
    };
  });

  // Map status to frontend format
  const statusMap: Record<string, Order['status']> = {
    'pending': 'Pending',
    'cutting': 'Cutting',
    'stitching': 'Stitching',
    'inprogress': 'In Progress',
    'Ready': 'Ready',
    'Delivered': 'Delivered'
  };

  // Convert MongoDB _id to a numeric id for display (use last 6 digits or hash)
  const numericId = backendOrder._id ? parseInt(backendOrder._id.slice(-6), 16) % 1000000 : 0;
  
  return {
    id: numericId,
    _id: backendOrder._id, // Preserve MongoDB _id for backend operations
    customerId,
    customer,
    phone,
    item: backendOrder.item || '',
    status: statusMap[backendOrder.status?.toLowerCase()] || 'Pending',
    delivery_date: backendOrder.deliveryDate ? new Date(backendOrder.deliveryDate).toISOString().split('T')[0] : undefined,
    workers
  };
};

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: BackendOrder[] }>('/orders');
    const orders = Array.isArray(response.data) ? response.data : [];
    return orders.map(mapOrder);
  },

  async getById(id: number | string): Promise<Order> {
    // Accept both numeric id (for display) and MongoDB _id (for API calls)
    const orderId = typeof id === 'string' ? id : String(id);
    const response = await apiClient.get<{ data: BackendOrder }>(`/orders/${orderId}`);
    return mapOrder(response.data);
  },

  async create(data: CreateOrderData): Promise<Order> {
    // Convert status to backend format
    const statusMap: Record<Order['status'], string> = {
      'Pending': 'pending',
      'Cutting': 'cutting',
      'Stitching': 'stitching',
      'In Progress': 'inprogress',
      'Ready': 'Ready',
      'Delivered': 'Delivered'
    };

    const payload: any = {
      customerId: data.customerId,
      item: data.item,
      ...(data.status && { status: statusMap[data.status] || data.status.toLowerCase() }),
      ...(data.deliveryDate && { deliveryDate: data.deliveryDate }),
      ...(data.workerAssignment && { workerAssignment: data.workerAssignment })
    };

    const response = await apiClient.post<{ data: BackendOrder }>('/orders', payload);
    return mapOrder(response.data);
  },

  async update(data: UpdateOrderData): Promise<Order> {
    const { id, ...updateData } = data;
    
    // Convert status to backend format if provided
    const statusMap: Record<Order['status'], string> = {
      'Pending': 'pending',
      'Cutting': 'cutting',
      'Stitching': 'stitching',
      'In Progress': 'inprogress',
      'Ready': 'Ready',
      'Delivered': 'Delivered'
    };

    const payload: any = {};
    if (updateData.customerId) payload.customerId = updateData.customerId;
    if (updateData.item) payload.item = updateData.item;
    if (updateData.status) payload.status = statusMap[updateData.status] || updateData.status.toLowerCase();
    if (updateData.deliveryDate) payload.deliveryDate = updateData.deliveryDate;
    if (updateData.workerAssignment) payload.workerAssignment = updateData.workerAssignment;

    // Use MongoDB _id if available, otherwise use numeric id
    const orderId = typeof id === 'string' ? id : String(id);
    const response = await apiClient.put<{ data: BackendOrder }>(`/orders/${orderId}`, payload);
    return mapOrder(response.data);
  },

  async delete(id: number | string): Promise<void> {
    // Accept both numeric id (for display) and MongoDB _id (for API calls)
    const orderId = typeof id === 'string' ? id : String(id);
    await apiClient.delete(`/orders/${orderId}`);
  },
};*/




import { apiClient } from './api';
import { Order, WorkerAssignment } from '../types/types';

// Backend order structure
interface BackendOrder {
  _id: string;
  customerId: string | {
    _id: string;
    customername?: string;
    customerphone?: string | number;
  };
  item: string;
  status: string;
  deliveryDate?: string;
  workerAssignment?: Array<{
    worker: string | {
      _id: string;
      workername?: string;
      name?: string;
    };
    task: string;
    date?: string;
    commission: number;
  }>;
  createdAt?: string;
}

// Create/Update data sent to backend
export interface CreateOrderData {
  customerId: string;
  item: string;
  status?: Order['status'];
  deliveryDate?: string;
  workerAssignment?: Array<{
    worker: string;
    task: 'Cutting' | 'Stitching';
    commission: number;
  }>;
}

export interface UpdateOrderData {
  id: number;
  customerId?: string;
  item?: string;
  status?: Order['status'];
  deliveryDate?: string;
  workerAssignment?: Array<{
    worker: string;
    task: 'Cutting' | 'Stitching';
    commission: number;
  }>;
}

// Helper to map backend order to frontend format
const mapOrder = (backendOrder: BackendOrder): Order => {
  const customerId = typeof backendOrder.customerId === 'string' 
    ? backendOrder.customerId 
    : backendOrder.customerId._id;
  
  const customer = typeof backendOrder.customerId === 'object' && backendOrder.customerId
    ? (backendOrder.customerId.customername || '')
    : '';
  
  const phone = typeof backendOrder.customerId === 'object' && backendOrder.customerId
    ? String(backendOrder.customerId.customerphone || '')
    : '';

  // Map workerAssignment to workers array
  const workers: WorkerAssignment[] = (backendOrder.workerAssignment || []).map(wa => {
    const workerName = typeof wa.worker === 'object' && wa.worker
      ? (wa.worker.name || '')
      : '';
    
    return {
      name: workerName,
      task: (wa.task === 'Cutting' ? 'Cutting' : 'Stitching') as 'Cutting' | 'Stitching',
      commission: wa.commission || 0
    };
  });

  // Map status to frontend format
  const statusMap: Record<string, Order['status']> = {
    'pending': 'Pending',
    'cutting': 'Cutting',
    'stitching': 'Stitching',
    'inprogress': 'In Progress',
    'Ready': 'Ready',
    'Delivered': 'Delivered'
  };

  // Convert MongoDB _id to a numeric id for display (use last 6 digits or hash)
  const numericId = backendOrder._id ? parseInt(backendOrder._id.slice(-6), 16) % 1000000 : 0;
  
  return {
    id: numericId,
    _id: backendOrder._id, // Preserve MongoDB _id for backend operations
    customerId,
    customer,
    phone,
    item: backendOrder.item || '',
    status: statusMap[backendOrder.status?.toLowerCase()] || 'Pending',
    delivery_date: backendOrder.deliveryDate ? new Date(backendOrder.deliveryDate).toISOString().split('T')[0] : undefined,
    workers
  };
};

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: BackendOrder[] }>('/orders');
    const orders = Array.isArray(response.data) ? response.data : [];
    return orders.map(mapOrder);
  },

  async getById(id: number | string): Promise<Order> {
    // Accept both numeric id (for display) and MongoDB _id (for API calls)
    const orderId = typeof id === 'string' ? id : String(id);
    const response = await apiClient.get<{ data: BackendOrder }>(`/orders/${orderId}`);
    return mapOrder(response.data);
  },

  async create(data: CreateOrderData): Promise<Order> {
    // Convert status to backend format
    const statusMap: Record<Order['status'], string> = {
      'Pending': 'pending',
      'Cutting': 'cutting',
      'Stitching': 'stitching',
      'In Progress': 'inprogress',
      'Ready': 'Ready',
      'Delivered': 'Delivered'
    };

    const payload: any = {
      customerId: data.customerId,
      item: data.item,
      ...(data.status && { status: statusMap[data.status] || data.status.toLowerCase() }),
      ...(data.deliveryDate && { deliveryDate: data.deliveryDate }),
      ...(data.workerAssignment && { workerAssignment: data.workerAssignment })
    };

    const response = await apiClient.post<{ data: BackendOrder }>('/orders', payload);
    return mapOrder(response.data);
  },

  async update(data: UpdateOrderData): Promise<Order> {
    const { id, ...updateData } = data;
    
    // Convert status to backend format if provided
    const statusMap: Record<Order['status'], string> = {
      'Pending': 'pending',
      'Cutting': 'cutting',
      'Stitching': 'stitching',
      'In Progress': 'inprogress',
      'Ready': 'Ready',
      'Delivered': 'Delivered'
    };

    const payload: any = {};
    if (updateData.customerId) payload.customerId = updateData.customerId;
    if (updateData.item) payload.item = updateData.item;
    if (updateData.status) payload.status = statusMap[updateData.status] || updateData.status.toLowerCase();
    if (updateData.deliveryDate) payload.deliveryDate = updateData.deliveryDate;
    if (updateData.workerAssignment) payload.workerAssignment = updateData.workerAssignment;

    // Use MongoDB _id if available, otherwise use numeric id
    const orderId = typeof id === 'string' ? id : String(id);
    const response = await apiClient.put<{ data: BackendOrder }>(`/orders/${orderId}`, payload);
    return mapOrder(response.data);
  },

  async delete(id: number | string): Promise<void> {
    // Accept both numeric id (for display) and MongoDB _id (for API calls)
    const orderId = typeof id === 'string' ? id : String(id);
    await apiClient.delete(`/orders/${orderId}`);
  },
};



































