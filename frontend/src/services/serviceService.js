// filepath: c:\Users\dante\salon-website\frontend\src\services\serviceService.js
import api from './api';

export const serviceService = {
  getServices: () => api.get('/services/'),
  getService: (id) => api.get(`/services/${id}/`),
  getServicesByCategory: (categoryId) => api.get(`/services/?category=${categoryId}`),
  getCategories: () => api.get('/services/categories/'),
};