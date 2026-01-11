import React, { useState, useEffect } from 'react';
import { serviceService } from '../../services/serviceService';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../components/common/Toast/Toast';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import './Admin.css';

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await serviceService.getServices();
      const data = res.data?.results || res.data || [];
      const safeData = Array.isArray(data) ? data : [];  // Safety check
      setServices(safeData);
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (service) => {
    try {
      if (isCreating) {
        await serviceService.createService(service);
        toast.success('Service created');
      } else {
        await serviceService.updateService(service.id, service);
        toast.success('Service updated');
      }
      fetchServices();
      setEditingService(null);
      setIsCreating(false);
    } catch (err) {
      toast.error('Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this service?')) {
      try {
        await serviceService.deleteService(id);
        setServices(services.filter(s => s.id !== id));
        toast.success('Service deleted');
      } catch (err) {
        toast.error('Failed to delete service');
      }
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  const safeServices = Array.isArray(services) ? services : [];

  return (
    <div className="admin-page">
      <div className="page-container">
        <div className="admin-header">
          <h1>Service Management</h1>
          <p>Manage salon services and pricing</p>
        </div>

        <button className="btn btn-primary" onClick={() => { setIsCreating(true); setEditingService({}); }}><FiPlus /> Add Service</button>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeServices.map(service => (
              <tr key={service.id}>
                <td>{service.name}</td>
                <td>{service.category?.name}</td>
                <td>${service.price}</td>
                <td>{service.duration} min</td>
                <td>
                  <button onClick={() => setEditingService(service)}><FiEdit /></button>
                  <button onClick={() => handleDelete(service.id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(editingService || isCreating) && (
          <div className="modal">
            <div className="modal-content">
              <h3>{isCreating ? 'Add Service' : 'Edit Service'}</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(editingService); }}>
                <input type="text" placeholder="Name" value={editingService.name || ''} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} required />
                <input type="number" placeholder="Price" value={editingService.price || ''} onChange={(e) => setEditingService({ ...editingService, price: e.target.value })} required />
                <input type="number" placeholder="Duration (min)" value={editingService.duration || ''} onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })} required />
                <button type="submit">Save</button>
                <button onClick={() => { setEditingService(null); setIsCreating(false); }}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;