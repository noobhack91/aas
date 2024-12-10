import { api } from './index';

export const getConsigneeFiles = async (consigneeId: string, type: string) => {
  const response = await api.get(`/consignees/${consigneeId}/files/${type}`);
  return response.data;
};

export const deleteFile = async (url: string, type: string) => {
  return api.delete(`/upload/${type}/file`, { data: { url } });
};