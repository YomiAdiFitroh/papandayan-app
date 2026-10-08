import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const tokenStore = {
  get access() { return localStorage.getItem('accessToken'); },
  get refresh() { return localStorage.getItem('refreshToken'); },
  set({ accessToken, refreshToken }) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

const api = axios.create({ baseURL: API_URL });

// nyangkutin akses tokin setiap ada request
api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Pas 401, nyobain sekali lagi refresh abis itu coba lagi buat permintaan riill no fek
let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && !original._retry && !isAuthCall && tokenStore.refresh) {
      original._retry = true;
      try {
        // Ngebagiin satu panggilan buat si refresh tunggal di antara ku dan besi (jk di antara permintaan gagal yang jalan barengan (ciee))
        refreshPromise =
          refreshPromise ||
          axios
            .post(`${API_URL}/auth/refresh`, { refreshToken: tokenStore.refresh })
            .then((r) => {
              tokenStore.set(r.data);
              return r.data.accessToken;
            })
            .finally(() => { refreshPromise = null; });

        const newAccess = await refreshPromise;
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (refreshErr) {
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
