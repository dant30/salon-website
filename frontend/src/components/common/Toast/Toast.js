import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import ReactDOM from 'react-dom';
import './Toast.css';
import { FiCheck, FiXCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      type,
      duration,
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    remove: removeToast,
    clear: clearToasts,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return ReactDOM.createPortal(
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.getElementById('toast-root')
  );
};

// Individual Toast Item
const ToastItem = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  }, [onRemove, toast.id]);

  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.duration, handleClose]);

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FiCheck />;
      case 'error':
        return <FiXCircle />;
      case 'warning':
        return <FiAlertTriangle />;
      case 'info':
      default:
        return <FiInfo />;
    }
  };

  const toastClass = `toast toast-${toast.type} ${isExiting ? 'toast-exit' : ''}`;

  return (
    <div className={toastClass}>
      <div className="toast-icon">
        {getToastIcon()}
      </div>
      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
      </div>
      <button 
        className="toast-close" 
        onClick={handleClose}
        aria-label="Close toast"
      >
        <FiX size={16} />
      </button>
      {toast.duration > 0 && (
        <div className="toast-progress">
          <div className="toast-progress-bar" />
        </div>
      )}
    </div>
  );
};

// Export Toast Component
export default ToastItem;