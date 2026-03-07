import api from './client.js';

export const sendContact = async (payload) => {
  const { data } = await api.post('/api/contact-requests/', payload);
  return data;
};
