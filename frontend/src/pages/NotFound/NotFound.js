import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';
import { FiHome, FiSearch } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1>Page Not Found</h1>
          <p className="error-message">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="suggestions">
            <p>Here are some helpful links instead:</p>
            <div className="suggestion-links">
              <Link to="/" className="suggestion-link">
                <FiHome />
                Home Page
              </Link>
              <Link to="/services" className="suggestion-link">
                <FiSearch />
                Our Services
              </Link>
              <Link to="/booking" className="suggestion-link">
                Book Appointment
              </Link>
              <Link to="/contact" className="suggestion-link">
                Contact Us
              </Link>
            </div>
          </div>
          
          <div className="actions">
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-outline"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;