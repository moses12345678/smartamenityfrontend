import api from './client.js';

export const fetchInvite = async (token) => {
  const { data } = await api.get(`/api/properties/invite/${token}/`);
  return data;
};

export const fetchPropertyAmenities = async (slug) => {
  const { data } = await api.get(`/api/properties/${slug}/amenities/`);
  return data;
};

export const joinProperty = async ({
  invite_token,
  unit_number,
  address_line1,
  address_line2
}) => {
  const payload = {
    invite_token,
    ...(unit_number ? { unit_number } : {}),
    ...(address_line1 ? { address_line1 } : {}),
    ...(address_line2 ? { address_line2 } : {})
  };
  const { data } = await api.post('/api/properties/join/', payload);
  return data;
};

export const leaveProperty = async (opts = {}) => {
  const payload = {};
  if (opts.soft) payload.soft = true;
  const { data } = await api.post('/api/properties/leave/', payload);
  return data;
};
