// filepath: c:\Users\dante\salon-website\frontend\src\services\api.js
import axios from 'axios';

// Prefer env variable, fallback to Render backend
const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://salon-backend-hl61.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to every request
api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem('access') ||
      localStorage.getItem('token'); // legacy fallback

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clean house
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('token');

      // Hard redirect beats buggy state updates
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
