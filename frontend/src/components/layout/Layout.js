// src/components/layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header/Header';  // Direct import
import Footer from '../common/Footer/Footer';  // Direct import
import { ToastProvider } from '../common/Toast/Toast';  // Named import from Toast component
import './layout.css';

const Layout = () => {
  return (
    <ToastProvider>
      <div className="layout">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
};

export default Layout;