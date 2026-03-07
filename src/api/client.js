import axios from 'axios';

// In dev we let Vite proxy `/api/*` directly to the backend. Using a base URL of
// '/api' here would produce paths like '/api/api/auth/login/', which the backend
// doesn't serve (404). Keep base empty during dev so request URLs remain
// `/api/...` and are picked up by the proxy. In non-dev, fall back to an explicit
// API base URL or localhost.
const shouldUseProxy = import.meta.env.DEV && import.meta.env.VITE_USE_PROXY !== 'false';
export const API_BASE = shouldUseProxy
  ? ''
  : import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

const storage = {
  get(key) {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
  },
  set(key, value) {
    if (typeof localStorage === 'undefined') return;
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }
};

const tokenStore = {
  access: storage.get('accessToken'),
  refresh: storage.get('refreshToken'),
  setTokens({ access, refresh }) {
    this.access = access || null;
    this.refresh = refresh || null;
    storage.set('accessToken', this.access);
    storage.set('refreshToken', this.refresh);
  },
  clear() {
    this.setTokens({ access: null, refresh: null });
  }
};

export const getTokens = () => ({ access: tokenStore.access, refresh: tokenStore.refresh });
export const setTokens = (access, refresh) => tokenStore.setTokens({ access, refresh });
export const clearTokens = () => tokenStore.clear();

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false
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
        tokenStore.setTokens({
          access: data.access,
          refresh: data.refresh || tokenStore.refresh
        });
        config.headers.Authorization = `Bearer ${data.access}`;
        return api(config);
      } catch (refreshErr) {
        tokenStore.clear();
        return Promise.reject(refreshErr);
      } finally {
        refreshPromise = null;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
