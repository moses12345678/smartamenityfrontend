import api from './client.js';

export const fetchCurrentUser = async () => {
  const { data } = await api.get('/api/users/me/');
  return data;
};
