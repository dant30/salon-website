import api from './api';

export const staffService = {
  getStaff: () =>
    api.get('/staff/').then(res => Array.isArray(res.data) ? res.data : res.data.results || []),

  getStaffMember: (id) =>
    api.get(`/staff/${id}/`).then(res => res.data),

  createStaff: (data) =>
    api.post('/staff/', data).then(res => res.data),

  updateStaff: (id, data) =>
    api.patch(`/staff/${id}/`, data).then(res => res.data),

  deleteStaff: (id) =>
    api.delete(`/staff/${id}/`).then(res => res.data),

  getStaffByService: (serviceId) =>
    api.get(`/staff/?service=${serviceId}`).then(res => Array.isArray(res.data) ? res.data : res.data.results || []),
};

export default staffService;