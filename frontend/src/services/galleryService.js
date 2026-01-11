import api from './api';

const galleryService = {
  getImages: (params) =>
    api.get('/gallery/images/', { params })
      .then(res => Array.isArray(res.data) ? res.data : res.data.results || []),

  getImage: (id) =>
    api.get(`/gallery/images/${id}/`).then(res => res.data),

  incrementViews: (id) =>
    api.get(`/gallery/images/${id}/increment_views/`).then(res => res.data),

  likeImage: (id) =>
    api.post(`/gallery/images/${id}/like/`).then(res => res.data),

  createImage: (formData) =>
    api.post('/gallery/images/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),

  updateImage: (id, formData) =>
    api.patch(`/gallery/images/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),

  deleteImage: (id) =>
    api.delete(`/gallery/images/${id}/`).then(res => res.data),

  getFeatured: () =>
    api.get('/gallery/images/featured/').then(res => Array.isArray(res.data) ? res.data : res.data.results || []),

  getBeforeAfter: () =>
    api.get('/gallery/images/before_after/').then(res => Array.isArray(res.data) ? res.data : res.data.results || []),

  getByService: ({ service_id, service_slug }) =>
    api.get('/gallery/images/by_service/', { params: { service_id, service_slug } })
      .then(res => Array.isArray(res.data) ? res.data : res.data.results || []),

  getByStaff: (staff_id) =>
    api.get('/gallery/images/by_staff/', { params: { staff_id } })
      .then(res => Array.isArray(res.data) ? res.data : res.data.results || []),
};

export default galleryService;