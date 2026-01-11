import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';
import { FiX } from 'react-icons/fi';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = ''
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalSizeClass = `modal-${size}`;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className={`modal ${modalSizeClass} ${className}`}>
        {/* Modal Header */}
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          {showCloseButton && (
            <button 
              className="modal-close-btn" 
              onClick={onClose}
              aria-label="Close modal"
            >
              <FiX size={20} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

// Modal Footer Component
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`modal-footer ${className}`}>
    {children}
  </div>
);

// Modal Actions Component
export const ModalActions = ({ children, className = '' }) => (
  <div className={`modal-actions ${className}`}>
    {children}
  </div>
);

export default Modal;