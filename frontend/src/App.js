import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import ThemeProvider from './context/ThemeContext';  // Updated to default import

// Layout Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute/PrivateRoute';
import AdminRoute from './components/common/AdminRoute/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';  // Add this import

// Pages
import Home from './pages/Home/Home';
import Services from './pages/Services/Services';
import GalleryPage from './pages/Gallery/Gallery';  // Updated import to match export
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Booking from './pages/Booking/Booking';
import LoginForm from './pages/auth/LoginForm/LoginForm';
import RegisterForm from './pages/auth/RegisterForm/RegisterForm';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import UserProfile from './pages/UserProfile/UserProfile';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ServiceManagement from './pages/Admin/ServiceManagement';
import StaffManagement from './pages/Admin/StaffManagement';
import AppointmentManagement from './pages/Admin/AppointmentManagement';
import GalleryManagement from './pages/Admin/GalleryManagement';  // Add this import

// Error Pages
import NotFound from './pages/NotFound/NotFound';

function App() {
  return (
    <ErrorBoundary>  {/* Wrap everything in ErrorBoundary */}
      <ThemeProvider>  {/* Now uses default import */}
        <AuthProvider>
          <BookingProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="services" element={<Services />} />
                  <Route path="gallery" element={<GalleryPage />} />  {/* Updated to use GalleryPage */}
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="booking" element={<Booking />} />
                  
                  {/* Auth Routes */}
                  <Route path="login" element={<LoginForm />} />
                  <Route path="register" element={<RegisterForm />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  
                  {/* Protected Routes */}
                  <Route path="dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="profile" element={
                    <PrivateRoute>
                      <UserProfile />
                    </PrivateRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="admin/services" element={
                    <AdminRoute>
                      <ServiceManagement />
                    </AdminRoute>
                  } />
                  <Route path="admin/staff" element={
                    <AdminRoute>
                      <StaffManagement />
                    </AdminRoute>
                  } />
                  <Route path="admin/appointments" element={
                    <AdminRoute>
                      <AppointmentManagement />
                    </AdminRoute>
                  } />
                  <Route path="admin/gallery" element={
                    <AdminRoute>
                      <GalleryManagement />
                    </AdminRoute>
                  } />
                  
                  {/* Error Routes */}
                  <Route path="404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Route>
              </Routes>
            </Router>
          </BookingProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;