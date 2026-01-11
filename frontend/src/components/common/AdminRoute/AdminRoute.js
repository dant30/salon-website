import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" fullPage />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Debug: Log user permissions
  console.log('User permissions:', {
    is_staff: user.is_staff,
    is_staff_member: user.is_staff_member,
    is_superuser: user.is_superuser,
  });

  // Allow access if user is staff, staff member, or superuser
  if (!user.is_staff && !user.is_staff_member && !user.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;