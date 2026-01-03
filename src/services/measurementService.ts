
//fully working



/*
import { apiClient } from './api';

// Backend shape
export interface BackendMeasurement {
  _id: string;
  customerId: string | { _id: string, customername: string, customerphone: string }; // Populated or ID
  // customer_name might not be there if populated.
  customer_name?: string;
  measurement_date: string;
  values: Record<string, string>;
  notes?: string;
  // upperBody / lowerBody are present in backend response
  upperBody?: any;
  lowerBody?: any;
}

// Frontend shape
export interface Measurement {
  id: string;
  customer_id: string;
  customer_name: string;
  measurement_date: string;
  values: Record<string, string>;
  notes?: string;
}

export interface CreateMeasurementData {
  customer_id: string;
  customer_name: string;
  measurement_date?: string;
  values: Record<string, string>;
  notes?: string;
}

export interface UpdateMeasurementData extends Partial<CreateMeasurementData> {
  id: string;
}

// Convert backend → frontend safely
/*const mapMeasurement = (m: BackendMeasurement): Measurement => ({
  id: m._id,
  customer_id: m.customer_id,
  customer_name: m.customer_name ?? 'Unknown Customer', // <-- default if missing
  measurement_date: m.measurement_date,
  values: m.values,
  notes: m.notes,
});
// Convert backend → frontend safely
// Backend uses upperBody/lowerBody structures. We need to flatten them for frontend.
const mapMeasurement = (m: BackendMeasurement): Measurement => {
  // Flatten values
  const values: Record<string, string> = {};
  const upper = (m as any).upperBody || {};
  const lower = (m as any).lowerBody || {};

 
  const mapKey = (k: string) => {
    const titleMap: Record<string, string> = {
      "blouselength": "Blouse Length", "shoulder": "Shoulder", "chest": "Chest", "upperchest": "Upper Chest", "waist": "Waist", "hip": "Hip", "sleevelength": "Sleeve Length", "sleeveround": "Sleeve Round", "armhole": "Arm Hole", "frontneck": "Front Neck", "backneck": "Back Neck",
      "pantlength": "Pant Length", "waistround": "Waist Round", "hipround": "Hip Round", "thigh": "Thigh", "knee": "Knee", "calf": "Calf", "bottom": "Bottom", "crotch": "Crotch"
    };
    return titleMap[k] || k;
  };

  Object.entries(upper).forEach(([k, v]) => { if (v !== undefined) values[mapKey(k)] = String(v); });
  Object.entries(lower).forEach(([k, v]) => { if (v !== undefined) values[mapKey(k)] = String(v); });

  // Determine customer ID and Name
  let cId = '';
  let cName = 'Unknown Customer';

  if (typeof m.customerId === 'object' && m.customerId) {
    cId = (m.customerId as any)._id;
    cName = (m.customerId as any).customername || 'Unknown Customer';
  } else {
    cId = m.customerId as string;
    cName = m.customer_name || 'Unknown Customer';
  }

  return {
    id: m._id,
    customer_id: cId,
    customer_name: cName,
    measurement_date: m.measurement_date,
    values: values,
    notes: m.notes,
  };
};


export const measurementService = {
  async getAll(): Promise<Measurement[]> {
    const response = await apiClient.get<{ data: BackendMeasurement[] }>('/measurements');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapMeasurement);
  },

  async getById(id: string): Promise<Measurement> {
    const response = await apiClient.get<{ data: BackendMeasurement }>(`/measurements/${id}`);
    return mapMeasurement(response.data);
  },

  async getByCustomer(customerId: string): Promise<Measurement[]> {
    // The backend returns a single object or creates one, but let's assume it returns a list or object
    // Based on controller, it returns { data: document }. The "Get by customer" usually implies fetching the one active measurement
    try {
      const response = await apiClient.get<{ data: BackendMeasurement | null }>(`/measurements/${customerId}`);
      if (response.data) {
        return [mapMeasurement(response.data)];
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  async create(data: CreateMeasurementData): Promise<Measurement> {
    // Transform flat values to upperBody/lowerBody
    const upperBody: any = {};
    const lowerBody: any = {};

    // Mapping helper
    const toKey = (str: string) => str.toLowerCase().replace(/\s/g, '');

    const upperFields = ["blouselength", "shoulder", "chest", "upperchest", "waist", "hip", "sleevelength", "sleeveround", "armhole", "frontneck", "backneck"];
    const lowerFields = ["pantlength", "waistround", "hipround", "thigh", "knee", "calf", "bottom", "crotch"];

    Object.entries(data.values).forEach(([key, val]) => {
      const cleanKey = toKey(key);
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        if (upperFields.includes(cleanKey)) upperBody[cleanKey] = numVal;
        if (lowerFields.includes(cleanKey)) lowerBody[cleanKey] = numVal;
      }
    });

    const payload = {
      upperBody,
      lowerBody,
      notes: data.notes
    };

    const response = await apiClient.post<{ data: BackendMeasurement }>(`/measurements/${data.customer_id}`, payload);
    return mapMeasurement(response.data);
  },

  async update(data: UpdateMeasurementData): Promise<Measurement> {
    // Similar transform for update
    const upperBody: any = {};
    const lowerBody: any = {};
    const toKey = (str: string) => str.toLowerCase().replace(/\s/g, '');

    const upperFields = ["blouselength", "shoulder", "chest", "upperchest", "waist", "hip", "sleevelength", "sleeveround", "armhole", "frontneck", "backneck"];
    const lowerFields = ["pantlength", "waistround", "hipround", "thigh", "knee", "calf", "bottom", "crotch"];

    Object.entries(data.values).forEach(([key, val]) => {
      const cleanKey = toKey(key);
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        if (upperFields.includes(cleanKey)) upperBody[cleanKey] = numVal;
        if (lowerFields.includes(cleanKey)) lowerBody[cleanKey] = numVal;
      }
    });

    const payload = {
      upperBody,
      lowerBody,
      notes: data.notes
    };

    // The backend uses POST for create/upsert and PUT for update. 
    // Both take customerId in params.
    // Note: data.id here is likely the measurement ID, but the route uses customerId.
    // We should ideally pass customerId. 
    // However, if we only have measurement ID, we might need to change the backend or frontend.
    // Assuming data.customer_id is present in UpdateMeasurementData.
    // If not, we might be in trouble if we only have measurement ID. 
    // Let's assume frontend passes customer_id for now or we use create (which upserts)

    if (!data.customer_id) throw new Error("Customer ID required for update");

    const response = await apiClient.put<{ data: BackendMeasurement }>(`/measurements/${data.customer_id}`, payload);
    return mapMeasurement(response.data);
  },

  async delete(id: string): Promise<void> {
    // This might be tricky if backend expects customerId for delete?
    // Backend router: router.delete is not defined!
    // We will leave as is, might fail if not implemented.
    await apiClient.delete(`/measurements/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    if (!Array.isArray(ids)) return;
    await Promise.all(ids.map((id) => apiClient.delete(`/measurements/${id}`)));
  },
};*/


import { apiClient } from './api';

// Backend shape
export interface BackendMeasurement {
  _id: string;
  customerId: string | { _id: string, customername: string, customerphone: string };
  customer_name?: string;
  measurement_date: string;
  values: Record<string, string>;
  notes?: string;
  upperBody?: any;
  lowerBody?: any;
}

// Frontend shape
export interface Measurement {
  id: string;
  customer_id: string;
  customer_name: string;
  measurement_date: string;
  values: Record<string, string>;
  notes?: string;
}

export interface CreateMeasurementData {
  customer_id: string;
  customer_name: string;
  measurement_date?: string;
  values: Record<string, string>;
  notes?: string;
}

export interface UpdateMeasurementData extends Partial<CreateMeasurementData> {
  id: string;
}

const mapKey = (k: string) => {
  const titleMap: Record<string, string> = {
    "blouselength": "Blouse Length", "shoulder": "Shoulder", "chest": "Chest", "upperchest": "Upper Chest", "waist": "Waist", "hip": "Hip", "sleevelength": "Sleeve Length", "sleeveround": "Sleeve Round", "armhole": "Arm Hole", "frontneck": "Front Neck", "backneck": "Back Neck",
    "pantlength": "Pant Length", "waistround": "Waist Round", "hipround": "Hip Round", "thigh": "Thigh", "knee": "Knee", "calf": "Calf", "bottom": "Bottom", "crotch": "Crotch", "skirtlength": "Skirt Length",
    "pointlength": "Point Length", "pointwidth": "Point Width", "toplength": "Top Length", "slideopenlength": "Slide Open Length", "yorkelength": "Yorke Length", "collar": "Collar", "shirtlength": "Shirt Length"
  };
  return titleMap[k] || k;
};

const mapMeasurement = (m: BackendMeasurement): Measurement => {
  const values: Record<string, string> = {};
  const upper = m.upperBody || {};
  const lower = m.lowerBody || {};

  Object.entries(upper).forEach(([k, v]) => { if (v !== undefined && v !== null) values[mapKey(k)] = String(v); });
  Object.entries(lower).forEach(([k, v]) => { if (v !== undefined && v !== null) values[mapKey(k)] = String(v); });

  let cId = '';
  let cName = 'Unknown Customer';

  if (typeof m.customerId === 'object' && m.customerId) {
    cId = (m.customerId as any)._id;
    cName = (m.customerId as any).customername || 'Unknown Customer';
  } else {
    cId = m.customerId as string;
    cName = m.customer_name || 'Unknown Customer';
  }

  return {
    id: m._id,
    customer_id: cId,
    customer_name: cName,
    measurement_date: m.measurement_date,
    values: values,
    notes: m.notes,
  };
};

export const measurementService = {
  async getAll(): Promise<Measurement[]> {
    const response = await apiClient.get<{ data: BackendMeasurement[] }>('/measurements');
    const list = Array.isArray(response.data) ? response.data : [];
    return list.map(mapMeasurement);
  },

  async getById(id: string): Promise<Measurement> {
    const response = await apiClient.get<{ data: BackendMeasurement }>(`/measurements/${id}`);
    return mapMeasurement(response.data);
  },

  async getByCustomer(customerId: string): Promise<Measurement[]> {
    try {
      const response = await apiClient.get<{ data: BackendMeasurement | null }>(`/measurements/${customerId}`);
      if (response.data) {
        return [mapMeasurement(response.data)];
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  async create(data: CreateMeasurementData): Promise<Measurement> {
    const upperBody: any = {};
    const lowerBody: any = {};
    const toKey = (str: string) => str.toLowerCase().replace(/\s/g, '');

    const upperFields = ["blouselength", "shoulder", "chest", "upperchest", "waist", "hip", "sleevelength", "sleeveround", "armhole", "frontneck", "backneck", "pointlength", "pointwidth", "toplength", "slideopenlength", "yorkelength", "collar", "shirtlength"];
    const lowerFields = ["pantlength", "waistround", "hipround", "thigh", "knee", "calf", "bottom", "crotch", "skirtlength"];

    Object.entries(data.values).forEach(([key, val]) => {
      const cleanKey = toKey(key);
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        if (upperFields.includes(cleanKey)) upperBody[cleanKey] = numVal;
        if (lowerFields.includes(cleanKey)) lowerBody[cleanKey] = numVal;
      }
    });

    const payload = { upperBody, lowerBody, notes: data.notes };
    const response = await apiClient.post<{ data: BackendMeasurement }>(`/measurements/${data.customer_id}`, payload);
    return mapMeasurement(response.data);
  },

  async update(data: UpdateMeasurementData): Promise<Measurement> {
    const upperBody: any = {};
    const lowerBody: any = {};
    const toKey = (str: string) => str.toLowerCase().replace(/\s/g, '');

    const upperFields = ["blouselength", "shoulder", "chest", "upperchest", "waist", "hip", "sleevelength", "sleeveround", "armhole", "frontneck", "backneck", "pointlength", "pointwidth", "toplength", "slideopenlength", "yorklength", "collar", "shirtlength"];
    const lowerFields = ["pantlength", "waistround", "hipround", "thigh", "knee", "calf", "bottom", "crotch", "skirtlength"];

    Object.entries(data.values).forEach(([key, val]) => {
      const cleanKey = toKey(key);
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        if (upperFields.includes(cleanKey)) upperBody[cleanKey] = numVal;
        if (lowerFields.includes(cleanKey)) lowerBody[cleanKey] = numVal;
      }
    });

    const payload = { upperBody, lowerBody, notes: data.notes };
    if (!data.customer_id) throw new Error("Customer ID required for update");

    const response = await apiClient.put<{ data: BackendMeasurement }>(`/measurements/${data.customer_id}`, payload);
    return mapMeasurement(response.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/measurements/${id}`);
  },

  async bulkDelete(ids: string[]): Promise<void> {
    if (!Array.isArray(ids)) return;
    await Promise.all(ids.map((id) => apiClient.delete(`/measurements/${id}`)));
  },
};



































