import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor — attach JWT
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bakery_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bakery_token');
      localStorage.removeItem('bakery_user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Keep the backend message available through the normal Error API.
    const responseData = error.response?.data;
    if (responseData?.message) {
      const normalizedError = new Error(responseData.message);
      normalizedError.status = error.response.status;
      normalizedError.data = responseData;
      return Promise.reject(normalizedError);
    }

    return Promise.reject(error);
  }
);

export default API;
