import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';
import { FiUsers, FiScissors, FiCalendar, FiDollarSign, FiImage } from 'react-icons/fi';  // Removed unused FiTrash2, FiEdit
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../components/common/Toast/Toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes] = await Promise.all([
          bookingService.getDashboardStats(),
        ]);
        setStats(statsRes.data || []);
      } catch (err) {
        setError('Failed to load admin data');
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  if (loading) return <LoadingSpinner size="large" />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="page-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome to the salon management panel</p>
        </div>

        <div className="admin-stats">
          {stats.map((stat, index) => (
            <div key={index} className={`admin-stat-card ${stat.color}`}>
              <div className="stat-icon">
                {stat.color === 'primary' && <FiCalendar />}
                {stat.color === 'info' && <FiUsers />}
                {stat.color === 'success' && <FiScissors />}
                {stat.color === 'warning' && <FiDollarSign />}
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="admin-section">
          <h2>Quick Actions</h2>
          <div className="quick-links-grid">
            <Link to="/admin/appointments" className="quick-link-card">
              <div className="link-icon"><FiCalendar /></div>
              <span>Manage Appointments</span>
            </Link>
            <Link to="/admin/services" className="quick-link-card">
              <div className="link-icon"><FiScissors /></div>
              <span>Manage Services</span>
            </Link>
            <Link to="/admin/staff" className="quick-link-card">
              <div className="link-icon"><FiUsers /></div>
              <span>Manage Staff</span>
            </Link>
            <Link to="/admin/gallery" className="quick-link-card">
              <div className="link-icon"><FiImage /></div>
              <span>Manage Gallery</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;