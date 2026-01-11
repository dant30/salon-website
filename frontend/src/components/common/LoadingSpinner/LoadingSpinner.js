import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', color = 'primary', fullPage = false }) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;
  
  if (fullPage) {
    return (
      <div className="loading-overlay">
        <div className={`spinner ${sizeClass} ${colorClass}`}>
          <div className="spinner-circle"></div>
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className={`spinner ${sizeClass} ${colorClass}`}>
      <div className="spinner-circle"></div>
    </div>
  );
};

export default LoadingSpinner;