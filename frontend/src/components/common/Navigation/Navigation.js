import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';
import { useAuth } from '../../../context/AuthContext';

const Navigation = () => {
  const { user } = useAuth();

  const mainLinks = [
    { path: '/', label: 'Home', exact: true },
    { path: '/services', label: 'Services' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/booking', label: 'Book Now', highlight: true },
  ];

  const userLinks = user ? [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/my-appointments', label: 'My Appointments' },
    { path: '/my-reviews', label: 'My Reviews' },
    { path: '/profile', label: 'Profile' },
  ] : [];

  const adminLinks = user?.is_staff ? [
    { path: '/admin', label: 'Admin', admin: true },
    { path: '/admin/appointments', label: 'Appointments', admin: true },
    { path: '/admin/services', label: 'Services', admin: true },
    { path: '/admin/staff', label: 'Staff', admin: true },
  ] : [];

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Main Navigation */}
        <div className="nav-main">
          <ul className="nav-list">
            {mainLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <NavLink
                  to={link.path}
                  end={link.exact}
                  className={({ isActive }) =>
                    `nav-link ${link.highlight ? 'highlight' : ''} ${isActive ? 'active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* User Navigation (if logged in) */}
        {userLinks.length > 0 && (
          <div className="nav-user">
            <div className="nav-divider"></div>
            <ul className="nav-list">
              {userLinks.map((link) => (
                <li key={link.path} className="nav-item">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Admin Navigation (if staff) */}
        {adminLinks.length > 0 && (
          <div className="nav-admin">
            <div className="nav-divider"></div>
            <div className="admin-label">
              <span className="admin-badge">Admin</span>
            </div>
            <ul className="nav-list">
              {adminLinks.map((link) => (
                <li key={link.path} className="nav-item">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `nav-link admin-link ${isActive ? 'active' : ''}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;