import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import galleryService from '../../services/galleryService';
import './Dashboard.css';

import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiRefreshCw,
  FiStar,
  FiImage,
  FiDollarSign,
  FiBell,
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [galleryStats, setGalleryStats] = useState({ totalViews: 0, recentImages: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);

      const appointmentsRes = await bookingService.getAppointments();
      const data = appointmentsRes?.data?.results || appointmentsRes?.data || [];
      setAppointments(Array.isArray(data) ? data : []);

      const images = await galleryService.getImages({ limit: 3 });
      const totalViews = images.reduce((sum, img) => sum + (img.views || 0), 0);

      setGalleryStats({
        totalViews,
        recentImages: images.slice(0, 3),
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  /* ======================
     DERIVED DATA (MEMO)
     ====================== */

  const now = new Date();

  const { upcoming, past, totalSpent, mostBookedService } = useMemo(() => {
    const upcoming = [];
    const past = [];
    const serviceCount = {};
    let totalSpent = 0;

    appointments.forEach(app => {
      const date = new Date(app.appointment_date);
      date >= now ? upcoming.push(app) : past.push(app);

      totalSpent += app.total_amount || 0;
      if (app.service_name) {
        serviceCount[app.service_name] = (serviceCount[app.service_name] || 0) + 1;
      }
    });

    const mostBookedService =
      Object.keys(serviceCount).sort((a, b) => serviceCount[b] - serviceCount[a])[0] || '—';

    return { upcoming, past, totalSpent, mostBookedService };
  }, [appointments]);

  if (loading) {
    return (
      <div className="loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-container">

        {/* HEADER */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.first_name || 'Client'} 👋</h1>
            <p>Your personal salon hub — bookings, activity, and inspiration.</p>
          </div>

          <button
            className="btn btn-outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <StatCard icon={<FiCalendar />} label="Upcoming" value={upcoming.length} variant="primary" />
          <StatCard icon={<FiClock />} label="Total Visits" value={appointments.length} variant="info" />
          <StatCard icon={<FiDollarSign />} label="Total Spent" value={`$${totalSpent.toFixed(2)}`} variant="success" />
          <StatCard icon={<FiImage />} label="Gallery Views" value={galleryStats.totalViews} variant="warning" />
        </div>

        {/* UPCOMING */}
        <Section title="Upcoming Appointments">
          {upcoming.length ? (
            <AppointmentList data={upcoming} upcoming />
          ) : (
            <EmptyState
              text="No upcoming appointments"
              action={{ label: 'Book Appointment', to: '/booking' }}
            />
          )}
        </Section>

        {/* RECENT */}
        <Section title="Recent Appointments">
          {past.length ? (
            <AppointmentList data={past.slice(0, 5)} />
          ) : (
            <EmptyState text="No past appointments yet" />
          )}
        </Section>

        {/* ACTIVITY */}
        <Section title="Recent Activity">
          <div className="activity-list">
            <ActivityItem
              icon={<FiBell />}
              text={`Your ${mostBookedService} appointment is confirmed`}
              time="2 hours ago"
              variant="success"
            />
            <ActivityItem
              icon={<FiStar />}
              text="You left a 5-star review"
              time="1 day ago"
              variant="info"
            />
          </div>
        </Section>

        {/* GALLERY */}
        <Section title="Gallery Highlights">
          {galleryStats.recentImages.length ? (
            <div className="gallery-preview">
              {galleryStats.recentImages.map(img => (
                <div key={img.id} className="gallery-item">
                  <img src={img.image} alt={img.title} />
                  <span>{img.title}</span>
                </div>
              ))}
              <Link to="/gallery" className="btn btn-outline">View All</Link>
            </div>
          ) : (
            <EmptyState text="No gallery highlights yet" />
          )}
        </Section>

        {/* QUICK ACTIONS */}
        <Section title="Quick Actions">
          <div className="quick-actions">
            <QuickAction to="/booking" icon={<FiCalendar />} label="Book Appointment" />
            <QuickAction to="/profile" icon={<FiUser />} label="Edit Profile" />
            <QuickAction to="/services" icon={<FiClock />} label="Explore Services" />
            <QuickAction to="/gallery" icon={<FiImage />} label="Browse Gallery" />
          </div>
        </Section>

      </div>
    </div>
  );
};

/* ======================
   SMALL COMPONENTS
   ====================== */

const StatCard = ({ icon, value, label, variant }) => (
  <div className={`stat-card ${variant}`}>
    <div className="stat-icon">{icon}</div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <section className="dashboard-section">
    <h2>{title}</h2>
    {children}
  </section>
);

const AppointmentList = ({ data, upcoming }) => (
  <div className="appointments-list">
    {data.map(app => (
      <div key={app.id} className={`appointment-card ${!upcoming ? 'past' : ''}`}>
        <div className="appointment-info">
          <h3>{app.service_name}</h3>
          <p>{new Date(app.appointment_date).toLocaleDateString()}</p>
          <p>Staff: {app.staff_name}</p>
        </div>
        {!upcoming && (
          <Link to={`/reviews/${app.id}`} className="btn btn-outline btn-sm">
            <FiStar /> Review
          </Link>
        )}
      </div>
    ))}
  </div>
);

const ActivityItem = ({ icon, text, time, variant }) => (
  <div className="activity-item">
    <div className={`activity-icon ${variant}`}>{icon}</div>
    <div>
      <p>{text}</p>
      <span className="activity-time">{time}</span>
    </div>
  </div>
);

const QuickAction = ({ to, icon, label }) => (
  <Link to={to} className="quick-action-btn">
    {icon}
    <span>{label}</span>
  </Link>
);

const EmptyState = ({ text, action }) => (
  <div className="empty-state">
    <p>{text}</p>
    {action && <Link to={action.to} className="btn btn-primary">{action.label}</Link>}
  </div>
);

export default Dashboard;
