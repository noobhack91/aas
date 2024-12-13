import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface Location2 {
  districtName: string;
  blockName: string;
  facilityName: string;
}

interface InstallationRequest {
  tenderNumber: string;
  authorityType: string;
  poDate: Date | null;
  equipment: string;
  leadTimeToDeliver: string;
  leadTimeToInstall: string;
  remarks?: string;
  hasAccessories: boolean;
  accessories: string[];
  hasConsumables: boolean;  // Add this  
  consumables: string[];    // Add this  
  locations: Location2[];
}
interface Accessory {
  id: string;
  name: string;
  isActive: boolean;
}

interface Consumable {
  id: string;
  name: string;
  isActive: boolean;
}
// Auth APIs
export const login = (data: { username: string; password: string }) =>
  api.post('/auth/login', data);

// Tender APIs
export const searchTenders = (params: any) => api.get('/tenders/search', { params });
export const getTenderById = (id: string) => api.get(`/tenders/${id}`);
export const getDistricts = () => api.get('/tenders/districts');
export const getBlocks = () => api.get('/tenders/blocks');

// Consignee APIs
export const getConsignees = (districts?: string[]) => {
  const params = districts?.length ? { districts: districts.join(',') } : {};
  return api.get('/consignees', { params });
};

export const updateConsigneeStatus = (id: string, data: any) =>
  api.patch(`/consignees/${id}`, data);

// Upload APIs with role-based endpoints
export const uploadLogistics = (data: FormData) =>
  api.post('/upload/logistics', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const uploadChallan = (data: FormData) =>
  api.post('/upload/challan', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const uploadInstallation = (data: FormData) =>
  api.post('/upload/installation', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const uploadInvoice = (data: FormData) =>
  api.post('/upload/invoice', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });


export const createInstallationRequest = (data: InstallationRequest) =>
  api.post('/equipment-installation', data);

export const uploadConsigneeCSV = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/equipment-installation/upload-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getInstallationRequests = () =>
  api.get('/equipment-installation');

export const downloadTemplate = () =>
  api.get('/equipment-installation/template', {
    responseType: 'blob'
  });

export const getAllUsers = () => api.get('/admin/users');

export const updateUserRoles = (userId: string, roles: string[]) =>
  api.put('/admin/users/role', { userId, roles });

export const getConsigneeFiles = async (consigneeId: string, type: string) => {
  const response = await api.get(`/consignees/${consigneeId}/files/${type}`);
  return response.data;
};

export const deleteFile = async (url: string, type: string) => {
  return api.delete(`/upload/${type}/file`, { data: { url } });
};

// Get consignee details including all documents  
export const getConsigneeDetails = (id: string) =>
  api.get(`/consignees/${id}/details`);

// Update accessories status  
export const updateAccessoriesStatus = (id: string, data: { accessoryName: string, status: boolean }) =>
  api.patch(`/consignees/${id}/accessories`, data);

export const exportTenderData = (tenderId: string) =>
  api.get(`/tenders/${tenderId}/export`, {
    responseType: 'blob'
  });
export const getAccessories = () => api.get<Accessory[]>('/items/accessories');

export const createAccessory = (data: { name: string }) =>
  api.post<Accessory>('/items/accessories', data);

export const updateAccessory = (id: string, data: { name: string }) =>
  api.put<Accessory>(`/items/accessories/${id}`, data);

export const deleteAccessory = (id: string) =>
  api.delete(`/items/accessories/${id}`);

// Consumables APIs  
export const getConsumables = () => api.get<Consumable[]>('/items/consumables');

export const createConsumable = (data: { name: string }) =>
  api.post<Consumable>('/items/consumables', data);

export const updateConsumable = (id: string, data: { name: string }) =>
  api.put<Consumable>(`/items/consumables/${id}`, data);

export const deleteConsumable = (id: string) =>
  api.delete(`/items/consumables/${id}`);  