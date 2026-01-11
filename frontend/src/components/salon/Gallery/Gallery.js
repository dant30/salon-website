import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import './Gallery.css';
import { FiGrid, FiList, FiZoomIn, FiHeart, FiEye, FiFilter, FiX } from 'react-icons/fi';
import galleryService from '../../../services/galleryService';

const Gallery = ({ 
  images = [], 
  showFilters = true, 
  showStats = true,
  columns = 4,
  layout = 'grid',
  onImageClick 
}) => {
  const [localImages, setLocalImages] = useState(images);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [viewCounts, setViewCounts] = useState({});
  const [currentLayout, setCurrentLayout] = useState(layout);

  useEffect(() => setLocalImages(images), [images]);

  // Categories from images
  const categories = ['all', ...new Set(localImages.map(img => img.category?.name).filter(Boolean))];
  
  // Filter images based on selected category
  const filteredImages = selectedCategory === 'all' 
    ? localImages 
    : localImages.filter(img => img.category?.name === selectedCategory);

  // Handle image click (open lightbox + increment on server)
  const handleImageClick = async (image) => {
    if (onImageClick) {
      onImageClick(image);
      return;
    }

    setSelectedImage(image);

    // Optimistic UI: increment local view count immediately
    setViewCounts(prev => ({ ...prev, [image.id]: (prev[image.id] || image.views || 0) + 1 }));

    try {
      const res = await galleryService.incrementViews(image.id);
      const serverViews = res?.views;
      if (typeof serverViews === 'number') {
        setViewCounts(prev => ({ ...prev, [image.id]: serverViews }));
        // also sync localImages.views if present
        setLocalImages(prev => prev.map(i => i.id === image.id ? { ...i, views: serverViews } : i));
      }
    } catch (err) {
      // swallow errors but keep optimistic count
      console.error('Failed to increment views', err);
    }
  };

  // Handle favorite / like toggle (POST to server)
  const handleFavoriteToggle = async (imageId, e) => {
    e.stopPropagation();

    const isFav = favorites.has(imageId);
    // Optimistic UI update for favorites set
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(imageId)) next.delete(imageId);
      else next.add(imageId);
      return next;
    });

    // Optimistic likes update on localImages
    setLocalImages(prev => prev.map(i => i.id === imageId ? { ...i, likes: (i.likes || 0) + (isFav ? -1 : 1) } : i));

    try {
      const res = await galleryService.likeImage(imageId);
      const likes = res?.likes;
      if (typeof likes === 'number') {
        setLocalImages(prev => prev.map(i => i.id === imageId ? { ...i, likes } : i));
      }
    } catch (err) {
      console.error('Failed to like image', err);
      // revert optimistic changes on error
      setFavorites(prev => {
        const next = new Set(prev);
        if (isFav) next.add(imageId); else next.delete(imageId);
        return next;
      });
      setLocalImages(prev => prev.map(i => i.id === imageId ? { ...i, likes: (i.likes || 0) + (isFav ? 1 : -1) } : i));
    }
  };

  // Close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowRight') {
          const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
          const nextIndex = (currentIndex + 1) % filteredImages.length;
          setSelectedImage(filteredImages[nextIndex]);
        } else if (e.key === 'ArrowLeft') {
          const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
          const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
          setSelectedImage(filteredImages[prevIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, filteredImages]);

  // Image component with lazy loading
  const GalleryImage = ({ image }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      rootMargin: '100px',
    });

    const isFavorite = favorites.has(image.id);
    const views = viewCounts[image.id] || image.views || 0;

    return (
      <div 
        ref={ref}
        className="gallery-item"
        onClick={() => handleImageClick(image)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleImageClick(image);
          }
        }}
      >
        <div className="image-container">
          {inView && (
            <img 
              src={image.thumbnail || image.image} 
              alt={image.title} 
              loading="lazy"
              className="gallery-image"
            />
          )}
          
          {/* Image Overlay */}
          <div className="image-overlay">
            <div className="overlay-content">
              <h4 className="image-title">{image.title}</h4>
              {image.description && (
                <p className="image-description">
                  {image.description.length > 100 
                    ? `${image.description.substring(0, 100)}...` 
                    : image.description}
                </p>
              )}
              
              {/* Image Stats */}
              {showStats && (
                <div className="image-stats">
                  <div className="stat">
                    <FiEye />
                    <span>{views}</span>
                  </div>
                  <div className="stat">
                    <FiHeart className={isFavorite ? 'favorite' : ''} />
                    <span>{image.likes || 0}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="image-actions">
              <button 
                className="action-btn zoom-btn"
                onClick={() => handleImageClick(image)}
                aria-label="Zoom image"
              >
                <FiZoomIn />
              </button>
              <button 
                className={`action-btn favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={(e) => handleFavoriteToggle(image.id, e)}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <FiHeart />
              </button>
            </div>
          </div>
          
          {/* Category Badge */}
          {image.category && (
            <div className="category-badge">
              {image.category.name}
            </div>
          )}
        </div>
        
        {/* Before/After Indicator */}
        {image.is_before_after && (
          <div className="before-after-indicator">
            Before & After
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="gallery-container">
      {/* Gallery Controls */}
      {showFilters && (
        <div className="gallery-controls">
          {/* Category Filters */}
          <div className="category-filters">
            <FiFilter className="filter-icon" />
            {categories.map(category => (
              <button
                key={category}
                className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All Photos' : category}
              </button>
            ))}
          </div>
          
          {/* Layout Toggle */}
          <div className="layout-toggle">
            <button
              className={`layout-btn ${currentLayout === 'grid' ? 'active' : ''}`}
              onClick={() => setCurrentLayout('grid')}
              aria-label="Grid view"
            >
              <FiGrid />
            </button>
            <button
              className={`layout-btn ${currentLayout === 'list' ? 'active' : ''}`}
              onClick={() => setCurrentLayout('list')}
              aria-label="List view"
            >
              <FiList />
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid/List */}
      <div className={`gallery-${currentLayout} columns-${columns}`}>
        {filteredImages.map(image => (
          <GalleryImage key={image.id} image={image} />
        ))}
      </div>

      {/* No Results */}
      {filteredImages.length === 0 && (
        <div className="no-results">
          <p>No images found for the selected category.</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox" role="dialog" aria-label="Image viewer">
          <div className="lightbox-backdrop" onClick={closeLightbox}></div>
          
          <div className="lightbox-content">
            <button 
              className="lightbox-close" 
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <FiX />
            </button>
            
            <div className="lightbox-image-container">
              <img 
                src={selectedImage.image} 
                alt={selectedImage.title} 
                className="lightbox-image"
              />
              
              {/* Navigation Arrows */}
              <button 
                className="lightbox-nav prev"
                onClick={() => {
                  const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
                  const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
                  setSelectedImage(filteredImages[prevIndex]);
                }}
                aria-label="Previous image"
              >
                ←
              </button>
              <button 
                className="lightbox-nav next"
                onClick={() => {
                  const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
                  const nextIndex = (currentIndex + 1) % filteredImages.length;
                  setSelectedImage(filteredImages[nextIndex]);
                }}
                aria-label="Next image"
              >
                →
              </button>
            </div>
            
            <div className="lightbox-info">
              <h3 className="lightbox-title">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="lightbox-description">{selectedImage.description}</p>
              )}
              
              {/* Image Details */}
              <div className="lightbox-details">
                {selectedImage.category && (
                  <div className="detail-item">
                    <strong>Category:</strong> {selectedImage.category.name}
                  </div>
                )}
                {selectedImage.service && (
                  <div className="detail-item">
                    <strong>Service:</strong> {selectedImage.service.name}
                  </div>
                )}
                {selectedImage.staff && (
                  <div className="detail-item">
                    <strong>Stylist:</strong> {selectedImage.staff.user?.first_name} {selectedImage.staff.user?.last_name}
                  </div>
                )}
                {selectedImage.is_before_after && selectedImage.transformation_description && (
                  <div className="detail-item">
                    <strong>Transformation:</strong> {selectedImage.transformation_description}
                  </div>
                )}
              </div>
              
              {/* Image Stats */}
              <div className="lightbox-stats">
                <div className="stat">
                  <FiEye />
                  <span>{viewCounts[selectedImage.id] || selectedImage.views || 0} views</span>
                </div>
                <div className="stat">
                  <FiHeart className={favorites.has(selectedImage.id) ? 'favorite' : ''} />
                  <span>{selectedImage.likes || 0} likes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;