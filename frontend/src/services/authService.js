// filepath: c:\Users\dante\salon-website\frontend\src\services\authService.js
import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (data) => api.post('/auth/register/', data),
  logout: () => api.post('/auth/logout/'),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password/', { token, password }),
  getUser: () => api.get('/auth/users/me/'),
  updateProfile: (data) => api.patch('/auth/users/update_me/', data),
};