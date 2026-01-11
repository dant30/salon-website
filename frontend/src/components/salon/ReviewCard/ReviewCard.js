import React, { useState } from 'react';
import './ReviewCard.css';
import { FiStar, FiUser, FiThumbsUp, FiMessageCircle } from 'react-icons/fi';

const ReviewCard = ({ review, showFullContent = false, showService = true }) => {
  const [isExpanded, setIsExpanded] = useState(showFullContent);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [isHelpful, setIsHelpful] = useState(false);

  const {
    rating,
    comment,
    client_name,
    client_photo,
    service_name,
    staff_rating,
    service_rating,
    created_at,
    is_featured,
    reply,
    reply_date,
  } = review;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
      />
    ));
  };

  // Handle helpful click
  const handleHelpfulClick = () => {
    if (!isHelpful) {
      setHelpfulCount(helpfulCount + 1);
      setIsHelpful(true);
    }
  };

  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Check if comment is too long
  const isLongComment = comment.length > 200;

  return (
    <div className={`review-card ${is_featured ? 'featured' : ''}`}>
      {is_featured && (
        <div className="featured-badge">
          <FiStar size={14} />
          <span>Featured Review</span>
        </div>
      )}

      <div className="review-header">
        <div className="reviewer-info">
          {client_photo ? (
            <img src={client_photo} alt={client_name} className="reviewer-avatar" />
          ) : (
            <div className="reviewer-avatar-placeholder">
              <FiUser />
            </div>
          )}
          <div className="reviewer-details">
            <h4 className="reviewer-name">{client_name}</h4>
            <div className="review-date">{formatDate(created_at)}</div>
          </div>
        </div>

        <div className="overall-rating">
          <div className="rating-stars">
            {renderStars(rating)}
          </div>
          <div className="rating-number">{rating.toFixed(1)}</div>
        </div>
      </div>

      {showService && service_name && (
        <div className="review-service">
          Service: {service_name}
        </div>
      )}

      <div className="review-content">
        <p className={`review-comment ${!isExpanded && isLongComment ? 'truncated' : ''}`}>
          {isExpanded || !isLongComment ? comment : `${comment.substring(0, 200)}...`}
        </p>
        
        {isLongComment && (
          <button 
            className="read-more-btn" 
            onClick={toggleExpanded}
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Detailed Ratings */}
      {(staff_rating || service_rating) && (
        <div className="detailed-ratings">
          {staff_rating && (
            <div className="detailed-rating">
              <span className="rating-label">Staff:</span>
              <div className="rating-stars small">
                {renderStars(staff_rating)}
              </div>
            </div>
          )}
          {service_rating && (
            <div className="detailed-rating">
              <span className="rating-label">Service:</span>
              <div className="rating-stars small">
                {renderStars(service_rating)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Owner Reply */}
      {reply && (
        <div className="owner-reply">
          <div className="reply-header">
            <FiMessageCircle className="reply-icon" />
            <strong>Salon Response</strong>
            {reply_date && (
              <span className="reply-date">{formatDate(reply_date)}</span>
            )}
          </div>
          <p className="reply-content">{reply}</p>
        </div>
      )}

      {/* Review Actions */}
      <div className="review-actions">
        <button 
          className={`helpful-btn ${isHelpful ? 'active' : ''}`}
          onClick={handleHelpfulClick}
          disabled={isHelpful}
        >
          <FiThumbsUp />
          <span>Helpful ({helpfulCount})</span>
        </button>
        
        <button className="share-btn">
          Share
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;