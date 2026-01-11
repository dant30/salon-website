// filepath: c:\Users\dante\salon-website\frontend\src\services\api.js
import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Read the token keys used by AuthContext ('access') and fallback to legacy 'token'
    const accessToken = localStorage.getItem('access') || localStorage.getItem('token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('token'); // keep fallback removal
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;