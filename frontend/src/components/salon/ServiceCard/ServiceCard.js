import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';
import { FiClock, FiDollarSign, FiStar, FiScissors } from 'react-icons/fi';

const ServiceCard = ({ service, showCategory = true, showDescription = true }) => {
  const {
    id,
    name,
    slug,
    description,
    duration,
    price,
    discounted_price,
    image,
    category,
    is_popular,
  } = service;

  const finalPrice = discounted_price || price;
  const hasDiscount = discounted_price && discounted_price < price;
  const discountPercentage = hasDiscount 
    ? Math.round(((price - discounted_price) / price) * 100)
    : 0;

  return (
    <div className="service-card">
      {is_popular && (
        <div className="popular-badge">
          <FiStar size={14} />
          <span>Popular</span>
        </div>
      )}
      
      {hasDiscount && (
        <div className="discount-badge">
          -{discountPercentage}%
        </div>
      )}

      <div className="service-image">
        {image ? (
          <img src={image} alt={name} loading="lazy" />
        ) : (
          <div className="service-image-placeholder">
            <FiScissors size={48} />
          </div>
        )}
      </div>

      <div className="service-content">
        {showCategory && category && (
          <div className="service-category">
            {category.name}
          </div>
        )}
        
        <h3 className="service-title">
          <Link to={`/services/${slug}`} className="service-link">
            {name}
          </Link>
        </h3>

        {showDescription && description && (
          <p className="service-description">
            {description.length > 100 
              ? `${description.substring(0, 100)}...` 
              : description}
          </p>
        )}

        <div className="service-meta">
          <div className="meta-item">
            <FiClock className="meta-icon" />
            <span className="meta-text">{duration} min</span>
          </div>
          
          <div className="meta-item price">
            <FiDollarSign className="meta-icon" />
            <span className={`meta-text ${hasDiscount ? 'has-discount' : ''}`}>
              {hasDiscount ? (
                <>
                  <span className="original-price">${price}</span>
                  <span className="current-price">${finalPrice}</span>
                </>
              ) : (
                `$${finalPrice}`
              )}
            </span>
          </div>
        </div>

        <div className="service-actions">
          <Link 
            to={`/booking?service=${id}`} 
            className="btn btn-primary btn-sm"
          >
            Book Now
          </Link>
          <Link 
            to={`/services/${slug}`} 
            className="btn btn-outline btn-sm"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;