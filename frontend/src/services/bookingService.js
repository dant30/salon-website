// filepath: c:\Users\dante\salon-website\frontend\src\services\bookingService.js
import api from './api';

export const bookingService = {
  createAppointment: (data) => api.post('/bookings/', data),
  getAppointments: () => api.get('/bookings/'),
  getAppointment: (id) => api.get(`/bookings/${id}/`),
  updateAppointment: (id, data) => api.patch(`/bookings/${id}/`, data),
  cancelAppointment: (id) => api.delete(`/bookings/${id}/`),
  getAvailableTimes: (serviceId, staffId, date) => api.get('/bookings/available-times/', {
    params: { service: serviceId, staff: staffId, date },
  }),
  getStaffByService: (serviceId) => api.get(`/staff/?service=${serviceId}`),

  // new: dashboard stats
  getDashboardStats: () => api.get('/dashboard/stats/'),
};
export default bookingService;