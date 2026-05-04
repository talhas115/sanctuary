import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Standard ASP.NET Core backend port from launchSettings.json
const API_BASE_URL = 'http://localhost:5028/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // We cannot use hooks directly here, so we get the state directly from the store
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
