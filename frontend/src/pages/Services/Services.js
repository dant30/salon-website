import React, { useState } from 'react';
import { useServices } from '../../hooks/useServices';
import ServiceCard from '../../components/salon/ServiceCard/ServiceCard';
import './Services.css';
import { FiSearch, FiFilter } from 'react-icons/fi';

const Services = () => {
  const { services, loading, error } = useServices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Ensure services is always an array
  const serviceList = Array.isArray(services) ? services : [];

  const filteredServices = serviceList.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || service.category.name === selectedCategory)
  );

  const categories = [...new Set(serviceList.map(s => s.category.name))];

  if (loading) return <div className="loading">Loading services...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="services-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Our Services</h1>
          <p>Discover our wide range of beauty and wellness services</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-bar">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Search services..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="category-filter">
            <FiFilter />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              
              {categories.map((cat, index) => <option key={index} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="services-grid">
          {filteredServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <div className="page-info">
          <h2>Booking Information</h2>
          <p>All appointments include a complimentary consultation. Please arrive 10 minutes before your scheduled time.</p>
        </div>
      </div>
    </div>
  );
};

export default Services;