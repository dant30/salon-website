import React, { useState, useEffect } from 'react';
import Gallery from '../../components/salon/Gallery/Gallery';
import './Gallery.css';
import api from '../../services/api';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchImages = async () => {
      try {
        const res = await api.get('/gallery/images/');
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        if (mounted) setImages(data);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load gallery');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchImages();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="loading">Loading gallery...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <main className="gallery-page">
      <div className="page-container">
        {/* Header */}
        <header className="page-header">
          <h1>Our Gallery</h1>
          <p>
            A curated look at our craft — real work, real transformations,
            real confidence.
          </p>
        </header>

        {/* Gallery */}
        <section className="gallery-section">
          <Gallery
            images={images}
            showFilters
            columns={3}
          />
        </section>

        {/* CTA */}
        <section className="page-info">
          <h2>Your Transformation Starts Here</h2>
          <p>
            Inspired by what you see? Book your appointment and let our experts
            take care of the rest.
          </p>
          <a href="/booking" className="btn btn-primary btn-lg">
            Book an Appointment
          </a>
        </section>
      </div>
    </main>
  );
};

export default GalleryPage;
