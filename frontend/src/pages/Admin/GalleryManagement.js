import React, { useState, useEffect, useCallback } from 'react';
import galleryService from '../../services/galleryService';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { useToast } from '../../components/common/Toast/Toast';
import { FiTrash2, FiEdit, FiUpload } from 'react-icons/fi';
import './Admin.css';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  const fetchImages = useCallback(async () => {
    try {
      const data = await galleryService.getImages();
      const safeData = Array.isArray(data) ? data : [];
      setImages(safeData);
    } catch (err) {
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleSave = async (image) => {
    try {
      if (isCreating) {
        const formData = new FormData();
        formData.append('image', image.file);
        formData.append('title', image.title || 'New Image');
        await galleryService.createImage(formData);
        toast.success('Image uploaded');
      } else {
        await galleryService.updateImage(image.id, { title: image.title });
        toast.success('Image updated');
      }
      fetchImages();
      setEditingImage(null);
      setIsCreating(false);
    } catch (err) {
      toast.error('Failed to save image');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this image?')) {
      try {
        await galleryService.deleteImage(id);
        setImages(images.filter(img => img.id !== id));
        toast.success('Image deleted');
      } catch (err) {
        toast.error('Failed to delete image');
      }
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsCreating(true);
      setEditingImage({ file, title: '' });
    }
  };

  if (loading) return <LoadingSpinner size="large" />;

  const safeImages = Array.isArray(images) ? images : [];

  return (
    <div className="admin-page">
      <div className="page-container">
        <div className="admin-header">
          <h1>Gallery Management</h1>
          <p>Manage gallery images</p>
        </div>

        <div className="upload-section">
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} id="image-upload" />
          <label htmlFor="image-upload" className="btn btn-primary">
            <FiUpload /> Upload Image
          </label>
        </div>

        <div className="gallery-grid">
          {safeImages.map(image => (
            <div key={image.id} className="gallery-item">
              <img src={image.image} alt={image.title} />
              <div className="image-actions">
                <button onClick={() => setEditingImage(image)}><FiEdit /></button>
                <button onClick={() => handleDelete(image.id)}><FiTrash2 /></button>
              </div>
              <p>{image.title}</p>
            </div>
          ))}
        </div>

        {(editingImage || isCreating) && (
          <div className="modal">
            <div className="modal-content">
              <h3>{isCreating ? 'Upload Image' : 'Edit Image'}</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSave(editingImage); }}>
                <input type="text" placeholder="Title" value={editingImage.title || ''} onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })} required />
                {isCreating && <input type="file" accept="image/*" onChange={(e) => setEditingImage({ ...editingImage, file: e.target.files[0] })} required />}
                <button type="submit">Save</button>
                <button onClick={() => { setEditingImage(null); setIsCreating(false); }}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryManagement;