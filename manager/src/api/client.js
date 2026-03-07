import axios from 'axios';

const shouldUseProxy = import.meta.env.DEV && import.meta.env.VITE_USE_PROXY !== 'false';
export const API_BASE = shouldUseProxy
  ? ''
  : import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

const storageKey = {
  access: 'managerAccessToken',
  refresh: 'managerRefreshToken'
};

const tokenStore = {
  access: localStorage.getItem(storageKey.access),
  refresh: localStorage.getItem(storageKey.refresh),
  set(access, refresh) {
    this.access = access || null;
    this.refresh = refresh || null;
    access
      ? localStorage.setItem(storageKey.access, access)
      : localStorage.removeItem(storageKey.access);
    refresh
      ? localStorage.setItem(storageKey.refresh, refresh)
      : localStorage.removeItem(storageKey.refresh);
  },
  clear() {
    this.set(null, null);
  }
};

const api = axios.create({
  baseURL: API_BASE
});

api.interceptors.request.use((config) => {
  if (tokenStore.access) {
    config.headers.Authorization = `Bearer ${tokenStore.access}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    if (response?.status === 401 && tokenStore.refresh && !config._retry) {
      config._retry = true;
      if (!refreshPromise) {
        refreshPromise = axios.post(`${API_BASE}/api/auth/refresh/`, {
          refresh: tokenStore.refresh
        });
      }
      try {
        const { data } = await refreshPromise;
        tokenStore.set(data.access, data.refresh || tokenStore.refresh);
        config.headers.Authorization = `Bearer ${data.access}`;
        return api(config);
      } catch (err) {
        tokenStore.clear();
        return Promise.reject(err);
      } finally {
        refreshPromise = null;
      }
    }
    return Promise.reject(error);
  }
);

export const getTokens = () => ({ access: tokenStore.access, refresh: tokenStore.refresh });
export const setTokens = (a, r) => tokenStore.set(a, r);
export const clearTokens = () => tokenStore.clear();
export default api;
