import { apiClient } from './api';
import { Customer } from '../types/types';

export interface CreateCustomerData {
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: number | string;
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
  _id: c._id, // Preserve MongoDB _id for backend operations
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

  async getByQuery(query: string): Promise<Customer[]> {
    try {
      const response = await apiClient.get<{ data: BackendCustomer[] }>(`/customers?q=${encodeURIComponent(query)}`);
      const list = Array.isArray(response.data) ? response.data : [];
      return list.map((c, index) => mapCustomer(c, index));
    } catch (err) {
      // If backend doesn't support query param, fall back to client-side filtering
      const allCustomers = await this.getAll();
      const queryLower = query.toLowerCase();
      return allCustomers.filter(c =>
        c.name.toLowerCase().includes(queryLower) ||
        c.phone.includes(query)
      );
    }
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
    console.log('Updating customer with data:', data);
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

// final

/*import { apiClient } from './api';
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
};*/



















// final

/*import { apiClient } from './api';
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
};*/




















