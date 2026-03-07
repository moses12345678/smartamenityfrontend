import api from './client.js';

export const login = async (payload) => {
  const { data } = await api.post('/api/auth/login/', payload);
  return data;
};

export const changePassword = async ({ old_password, new_password }) => {
  const { data } = await api.post('/api/auth/change-password/', { old_password, new_password });
  return data;
};
