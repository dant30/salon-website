// This file is now integrated into App.js
// Keeping it for reference if you want to separate routes
export const routes = {
  public: [
    { path: '/', name: 'Home' },
    { path: '/services', name: 'Services' },
    { path: '/gallery', name: 'Gallery' },
    { path: '/about', name: 'About' },
    { path: '/contact', name: 'Contact' },
    { path: '/booking', name: 'Booking' },
    { path: '/login', name: 'Login' },
    { path: '/register', name: 'Register' },
    { path: '/forgot-password', name: 'Forgot Password' },
  ],
  protected: [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/profile', name: 'Profile' },
    { path: '/my-appointments', name: 'My Appointments' },
    { path: '/my-reviews', name: 'My Reviews' },
  ],
  admin: [
    { path: '/admin', name: 'Admin Dashboard' },
    { path: '/admin/services', name: 'Service Management' },
    { path: '/admin/staff', name: 'Staff Management' },
    { path: '/admin/appointments', name: 'Appointment Management' },
    { path: '/admin/users', name: 'User Management' },
    { path: '/admin/gallery', name: 'Gallery Management' },
    { path: '/admin/settings', name: 'Settings' },
  ]
};