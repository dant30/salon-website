import React from 'react';
import { Link } from 'react-router-dom';
import './StaffCard.css';
import { FiClock, FiScissors, FiInstagram, FiFacebook, FiTwitter } from 'react-icons/fi';

const StaffCard = ({ staff, showBio = true, showServices = false }) => {
  const {
    id,
    user,
    title,
    bio,
    specialization,
    experience_years,
    photo,
    is_active,
    instagram,
    facebook,
    twitter,
  } = staff;

  const fullName = user?.full_name || `${user?.first_name} ${user?.last_name}` || 'Staff Member';

  return (
    <div className="staff-card">
      <div className="staff-image-container">
        {photo ? (
          <img src={photo} alt={fullName} className="staff-image" loading="lazy" />
        ) : (
          <div className="staff-image-placeholder">
            {fullName.charAt(0).toUpperCase()}
          </div>
        )}
        
        {!is_active && (
          <div className="inactive-badge">
            Unavailable
          </div>
        )}
      </div>

      <div className="staff-content">
        <div className="staff-header">
          <h3 className="staff-name">{fullName}</h3>
          {title && <div className="staff-title">{title}</div>}
        </div>

        {specialization && specialization.length > 0 && (
          <div className="staff-specialization">
            {specialization.slice(0, 3).map((spec, index) => (
              <span key={index} className="specialty-tag">
                {spec.name}
              </span>
            ))}
            {specialization.length > 3 && (
              <span className="specialty-more">
                +{specialization.length - 3}
              </span>
            )}
          </div>
        )}

        {experience_years > 0 && (
          <div className="staff-experience">
            <FiClock className="experience-icon" />
            <span className="experience-text">
              {experience_years} {experience_years === 1 ? 'year' : 'years'} experience
            </span>
          </div>
        )}

        {showBio && bio && (
          <p className="staff-bio">
            {bio.length > 120 ? `${bio.substring(0, 120)}...` : bio}
          </p>
        )}

        {showServices && (
          <div className="staff-services">
            <FiScissors className="services-icon" />
            <span className="services-text">View Services</span>
          </div>
        )}

        <div className="staff-footer">
          <div className="staff-social">
            {instagram && (
              <a 
                href={instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram"
              >
                <FiInstagram />
              </a>
            )}
            {facebook && (
              <a 
                href={facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Facebook"
              >
                <FiFacebook />
              </a>
            )}
            {twitter && (
              <a 
                href={twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Twitter"
              >
                <FiTwitter />
              </a>
            )}
          </div>

          <div className="staff-actions">
            <Link 
              to={`/staff/${id}`} 
              className="btn btn-outline btn-sm"
            >
              View Profile
            </Link>
            {is_active && (
              <Link 
                to={`/booking?staff=${id}`} 
                className="btn btn-primary btn-sm"
              >
                Book Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCard;