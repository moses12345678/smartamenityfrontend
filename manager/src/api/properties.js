import api from './client.js';

export const listProperties = async () => {
  const { data } = await api.get('/api/manager/properties/');
  return data;
};
