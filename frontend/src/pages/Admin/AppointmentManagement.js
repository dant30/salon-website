import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../components/common/Toast/Toast';
import { FiEdit, FiTrash2, FiEye, FiFilter } from 'react-icons/fi';
import './Admin.css';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', date: '' });
  const [editingAppointment, setEditingAppointment] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.date) params.appointment_date = filters.date;
      const res = await bookingService.getAppointments(params);
      const data = res.data?.results || res.data || [];
      const safeData = Array.isArray(data) ? data : [];  // Safety check
      setAppointments(safeData);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingService.updateAppointment(id, { status });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
      toast.success('Appointment updated');
      setEditingAppointment(null);
    } catch (err) {
      toast.error('Failed to update appointment');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this appointment?')) {
      try {
        await bookingService.cancelAppointment(id);
        setAppointments(appointments.filter(a => a.id !== id));
        toast.success('Appointment cancelled');
      } catch (err) {
        toast.error('Failed to cancel appointment');
      }
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  return (
    <div className="admin-page">
      <div className="page-container">
        <div className="admin-header">
          <h1>Appointment Management</h1>
          <p>View and manage all appointments</p>
        </div>

        <div className="filters">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Service</th>
              <th>Staff</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeAppointments.map(app => (
              <tr key={app.id}>
                <td>{app.client_name}</td>
                <td>{app.service_name}</td>
                <td>{app.staff_name}</td>
                <td>{new Date(app.appointment_date).toLocaleDateString()}</td>
                <td>{app.status}</td>
                <td>
                  <button onClick={() => setEditingAppointment(app)}><FiEdit /></button>
                  <button onClick={() => handleCancel(app.id)}><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editingAppointment && (
          <div className="modal">
            <div className="modal-content">
              <h3>Edit Appointment Status</h3>
              <select value={editingAppointment.status} onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button onClick={() => handleUpdateStatus(editingAppointment.id, editingAppointment.status)}>Save</button>
              <button onClick={() => setEditingAppointment(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentManagement;