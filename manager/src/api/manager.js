import api from './client.js';

export const listProperties = async () => {
  const { data } = await api.get('/api/manager/properties/');
  return data;
};

export const listResidents = async () => {
  const { data } = await api.get('/api/manager/residents/');
  return data;
};

export const createResident = async (payload) => {
  const { data } = await api.post('/api/manager/residents/', payload);
  return data;
};

export const updateResident = async (id, payload) => {
  const { data } = await api.patch(`/api/manager/residents/${id}/`, payload);
  return data;
};

export const listAmenities = async () => {
  const { data } = await api.get('/api/manager/amenities/');
  return data;
};

export const updateAmenity = async (id, payload) => {
  const { data } = await api.patch(`/api/manager/amenities/${id}/`, payload);
  return data;
};
