import api from './client.js';

export const fetchAmenityStatus = async (id) => {
  const { data } = await api.get(`/api/amenities/${id}/status/`);
  return data;
};

export const checkInAmenity = async (id, guest_count = 0) => {
  const safeGuests = Number.isFinite(guest_count) ? Math.max(0, Math.floor(guest_count)) : 0;
  const { data } = await api.post(`/api/amenities/${id}/checkin/`, { guest_count: safeGuests });
  return data;
};

export const checkOutAmenity = async (id) => {
  const { data } = await api.post(`/api/amenities/${id}/checkout/`);
  return data;
};

// Manager: generate a QR check-in token for an amenity
export const generateAmenityQr = async (amenityId, expires_in_minutes) => {
  const body = {};
  if (Number.isFinite(expires_in_minutes)) body.expires_in_minutes = expires_in_minutes;
  const { data } = await api.post(`/api/manager/amenities/${amenityId}/qr/`, body);
  return data;
};

// Resident: check in by QR token
export const checkInAmenityQr = async (token) => {
  const { data } = await api.post('/api/amenities/checkin/qr/', { token });
  return data;
};
