// src/components/common/Header/Header.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiSettings,
  FiCalendar,
  FiChevronDown
} from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileNavRef = useRef(null);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const toggleUserMenu = () => setUserMenuOpen(prev => !prev);
  const closeUserMenu = () => setUserMenuOpen(false);
  const toggleMobileMenu = () => setMenuOpen(prev => !prev);
  const closeMobileMenu = () => setMenuOpen(false);

  // Handle outside clicks and keyboard events
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closeUserMenu();
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target) && !e.target.closest('.mobile-toggle')) {
        closeMobileMenu();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeUserMenu();
        closeMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="header" role="banner">
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="logo" aria-label="Virginia Hair Braider Home">
          <span className="logo-icon" aria-hidden="true">✂</span>
          <span className="logo-text">
            <span className="logo-full">Virginia <span className="logo-highlight">Hair Braider</span></span>
            <span className="logo-medium">Virginia <span className="logo-highlight">Braider</span></span>
            <span className="logo-short">V<span className="logo-highlight">HB</span></span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop" role="navigation" aria-label="Main navigation">
          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          
          {/* Book Now Button in Nav */}
          <Link to="/booking" className="btn-book-now" aria-label="Book an appointment">
            <FiCalendar aria-hidden="true" />
            <span>Book Now</span>
          </Link>
        </nav>

        {/* User Actions */}
        <div className="header-actions">
          {user ? (
            <div className="user-menu-wrapper" ref={dropdownRef}>
              <button
                className="user-trigger"
                onClick={toggleUserMenu}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-label="User menu"
              >
                <div className="user-avatar">
                  {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                </div>
                <span className="user-name">{user.first_name || 'Account'}</span>
                <FiChevronDown className={`chevron ${userMenuOpen ? 'rotate' : ''}`} aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div className="dropdown-menu" role="menu">
                  <div className="dropdown-header">
                    <div className="user-avatar-large">
                      {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h4>{user.first_name} {user.last_name}</h4>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider" />
                  
                  <NavLink 
                    to="/dashboard" 
                    className="dropdown-item"
                    onClick={closeUserMenu}
                    role="menuitem"
                  >
                    <MdDashboard aria-hidden="true" />
                    <span>Dashboard</span>
                  </NavLink>
                  
                  <NavLink 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={closeUserMenu}
                    role="menuitem"
                  >
                    <FiUser aria-hidden="true" />
                    <span>My Profile</span>
                  </NavLink>
                  
                  {user.is_staff && (
                    <NavLink 
                      to="/admin" 
                      className="dropdown-item"
                      onClick={closeUserMenu}
                      role="menuitem"
                    >
                      <FiSettings aria-hidden="true" />
                      <span>Admin Panel</span>
                    </NavLink>
                  )}
                  
                  <div className="dropdown-divider" />
                  
                  <button 
                    className="dropdown-item logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <FiLogOut aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="btn-login">
                Sign In
              </Link>
              <Link to="/register" className="btn-register">
                Join Now
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={toggleMobileMenu}
            aria-expanded={menuOpen}
            aria-label="Toggle mobile menu"
          >
            {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`mobile-navigation ${menuOpen ? 'open' : ''}`} 
        ref={mobileNavRef}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <nav className="mobile-nav">
          {navLinks.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className="mobile-nav-link"
              onClick={closeMobileMenu}
            >
              {link.label}
            </NavLink>
          ))}
          
          <div className="mobile-auth">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile" 
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <button 
                  className="mobile-nav-link logout"
                  onClick={() => { handleLogout(); closeMobileMenu(); }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="mobile-nav-link register"
                  onClick={closeMobileMenu}
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
          
          <Link 
            to="/booking" 
            className="mobile-book-now"
            onClick={closeMobileMenu}
            aria-label="Book an appointment"
          >
            <FiCalendar aria-hidden="true" />
            Book Appointment
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;