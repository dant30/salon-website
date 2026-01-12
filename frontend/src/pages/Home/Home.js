import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/salon/ServiceCard/ServiceCard';
import StaffCard from '../../components/salon/StaffCard/StaffCard';
import ReviewCard from '../../components/salon/ReviewCard/ReviewCard';
import './Home.css';
import { 
  FiScissors, 
  FiStar, 
  FiCalendar, 
  FiUsers, 
  FiAward, 
  FiCheck,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiLoader
} from 'react-icons/fi';
import { GiFlowerEmblem, GiLipstick } from 'react-icons/gi';

const API_URL = process.env.REACT_APP_API_URL || 'https://salon-backend-hl61.onrender.com/api';

// Move fallback functions outside the component for stability
const getFallbackServices = () => [
  {
    id: 1,
    name: 'Senegal Twists - Medium',
    description: 'Classic protective style with medium-sized twists',
    duration: 180,
    price: 170,
    discounted_price: null,
    final_price: 170,
    category: { name: 'Senegal & Island Twists', icon: <FiScissors /> },
    category_name: 'Senegal & Island Twists',
    is_popular: true,
    color: '#8a6d3b',
  },
  {
    id: 2,
    name: 'Butterfly Locs - Medium',
    description: 'Bohemian-inspired faux locs with butterfly technique',
    duration: 200,
    price: 180,
    discounted_price: null,
    final_price: 180,
    category: { name: 'Butterfly Locs', icon: <GiLipstick /> },
    category_name: 'Butterfly Locs',
    is_popular: true,
    color: '#d4b483',
  },
  {
    id: 3,
    name: 'Boho Braids - Medium',
    description: 'Braids with added curly extensions for volume',
    duration: 180,
    price: 180,
    discounted_price: null,
    final_price: 180,
    category: { name: 'Boho Braids', icon: <GiFlowerEmblem /> },
    category_name: 'Boho Braids',
    is_popular: true,
    color: '#6b4f2c',
  },
  {
    id: 4,
    name: 'Knotless Braids - Medium',
    description: 'Modern technique reducing tension on scalp',
    duration: 180,
    price: 150,
    discounted_price: null,
    final_price: 150,
    category: { name: 'Knotless Braids', icon: <FiStar /> },
    category_name: 'Knotless Braids',
    is_popular: true,
    color: '#7a5e34',
  },
];

const getFallbackStaff = () => [
  {
    id: 1,
    user: {
      first_name: 'Virginia',
      last_name: 'Hair Braider',
      full_name: 'Virginia Hair Braider',
    },
    title: 'Master Braider & Owner',
    specialization: [{ name: 'All Braiding Styles' }, { name: 'Protective Styles' }],
    experience_years: 8,
    photo: null,
    is_active: true,
    bio: 'Virginia is a highly skilled hair braider with years of experience specializing in protective styles, braids, locs, and extensions.',
  }
];

const getFallbackTestimonials = () => [
  {
    id: 1,
    client_name: 'Jessica M.',
    rating: 5,
    comment: 'Virginia is AMAZING! My boho braids came out perfect and lasted for weeks. She\'s so professional and her attention to detail is incredible.',
    service_name: 'Boho Braids',
    created_at: '2024-01-15',
    is_featured: true,
    avatar_color: '#8a6d3b',
  },
  {
    id: 2,
    client_name: 'Sarah T.',
    rating: 5,
    comment: 'I got my first set of butterfly locs from Virginia and I\'m in love! She took her time to make sure everything was perfect.',
    service_name: 'Butterfly Locs',
    created_at: '2024-01-10',
    is_featured: true,
    avatar_color: '#6b4f2c',
  },
  {
    id: 3,
    client_name: 'Michael R.',
    rating: 5,
    comment: 'Best men\'s braids I\'ve ever had! Virginia knows exactly how to work with men\'s hair and the style held up perfectly.',
    service_name: 'Men\'s Box Braids',
    created_at: '2024-01-05',
    is_featured: true,
    avatar_color: '#d4b483',
  },
];

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [visibleSections, setVisibleSections] = useState(() => new Set());
  const [loading, setLoading] = useState({
    services: true,
    staff: true,
    testimonials: true
  });
  const [error, setError] = useState({
    services: null,
    staff: null,
    testimonials: null
  });
  const [data, setData] = useState({
    services: [],
    staff: [],
    testimonials: []
  });
  const [stats, setStats] = useState({
    totalClients: 5000,
    expertStylists: 1,
    totalServices: 0
  });

  // Features data (static)
  const features = [
    {
      icon: <FiAward />,
      title: 'Award-Winning Braider',
      description: 'Virginia has years of experience in protective styling',
      color: '#8a6d3b',
    },
    {
      icon: <FiStar />,
      title: 'Premium Hair Quality',
      description: 'We use only professional-grade braiding hair',
      color: '#d4b483',
    },
    {
      icon: <FiCalendar />,
      title: 'Easy Online Booking',
      description: '24/7 appointment scheduling with instant confirmation',
      color: '#6b4f2c',
    },
    {
      icon: <FiUsers />,
      title: 'Personalized Service',
      description: 'Customized styles tailored to your unique hair type',
      color: '#7a5e34',
    },
  ];

  // Fetch services from API
  const fetchServices = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, services: true }));
      setError(prev => ({ ...prev, services: null }));
      
      const response = await fetch(`${API_URL}/services/`);
      if (!response.ok) throw new Error('Failed to fetch services');
      
      const responseData = await response.json();
      
      // Handle different API response structures:
      let servicesArray = [];
      
      if (Array.isArray(responseData)) {
        // Direct array response
        servicesArray = responseData;
      } else if (responseData.results && Array.isArray(responseData.results)) {
        // Paginated response from DRF
        servicesArray = responseData.results;
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // Some APIs wrap in data property
        servicesArray = responseData.data;
      } else {
        // Fallback: try to find any array in the response
        for (const key in responseData) {
          if (Array.isArray(responseData[key])) {
            servicesArray = responseData[key];
            break;
          }
        }
      }
      
      console.log('Services API Response:', responseData); // Debug log
      console.log('Parsed Services:', servicesArray); // Debug log
      
      // Get popular services or first 4 services (remove .slice(0, 4) if you want all services displayed)
      const featuredServices = servicesArray
        .sort((a, b) => {
          // Sort by popularity first, then by display order
          if (a.is_popular && !b.is_popular) return -1;
          if (!a.is_popular && b.is_popular) return 1;
          return a.display_order - b.display_order;
        })
        .slice(0, 4)  // <-- Remove this line if you want all services to display
        .map(service => ({
          ...service,
          category: typeof service.category === 'string' 
            ? { name: service.category, icon: <FiScissors /> } 
            : service.category || { name: 'Braiding', icon: <FiScissors /> },
          category_name: typeof service.category === 'string' ? service.category : service.category?.name || 'Braiding'
        }));
      
      setData(prev => ({ ...prev, services: featuredServices }));
      setStats(prev => ({ ...prev, totalServices: servicesArray.length }));
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(prev => ({ ...prev, services: err.message }));
      // Fallback to mock data if API fails
      setData(prev => ({ 
        ...prev, 
        services: getFallbackServices() 
      }));
    } finally {
      setLoading(prev => ({ ...prev, services: false }));
    }
  }, []);  // No dependencies needed now that fallbacks are outside

  // Fetch staff from API
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, staff: true }));
      setError(prev => ({ ...prev, staff: null }));
      
      const response = await fetch(`${API_URL}/staff/`);
      if (!response.ok) throw new Error('Failed to fetch staff');
      
      const staffData = await response.json();
      
      // Handle paginated response
      const staffArray = Array.isArray(staffData) ? staffData : staffData.results || [];
      
      // Get active staff
      const featuredStaff = staffArray
        .filter(staff => staff.is_active)
        .slice(0, 3) // Show max 3 staff members
        .map(staff => ({
          ...staff,
          user: {
            first_name: staff.full_name?.split(' ')[0] || 'Stylist',
            last_name: staff.full_name?.split(' ').slice(1).join(' ') || '',
            full_name: staff.full_name || 'Virginia Hair Braider'
          },
          bio: staff.bio || 'Expert hair braider specializing in protective styles'
        }));
      
      setData(prev => ({ ...prev, staff: featuredStaff }));
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(prev => ({ ...prev, staff: err.message }));
      // Fallback to mock data
      setData(prev => ({ 
        ...prev, 
        staff: getFallbackStaff() 
      }));
    } finally {
      setLoading(prev => ({ ...prev, staff: false }));
    }
  }, []);

  // Fetch testimonials from API (disabled due to 404 - no endpoint exists)
  const fetchTestimonials = useCallback(async () => {
    // Temporarily disabled: /api/testimonials/ returns 404. Enable if you add the endpoint to backend/gallery/urls.py
    setLoading(prev => ({ ...prev, testimonials: false }));
    setData(prev => ({ ...prev, testimonials: getFallbackTestimonials() }));
    /*
    try {
      setLoading(prev => ({ ...prev, testimonials: true }));
      setError(prev => ({ ...prev, testimonials: null }));
      
      const response = await fetch(`${API_URL}/testimonials/`);
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      
      const testimonialsData = await response.json();
      
      // Handle paginated response
      const testimonialsArray = Array.isArray(testimonialsData) ? testimonialsData : testimonialsData.results || [];
      
      // Get featured testimonials or first 3
      const featuredTestimonials = testimonialsArray
        .filter(testimonial => testimonial.is_featured || testimonial.is_approved)
        .slice(0, 3)
        .map((testimonial, index) => ({
          ...testimonial,
          client_name: testimonial.client_name || 'Happy Client',
          avatar_color: '#8a6d3b',  // Use static color or remove if not needed
          service_name: testimonial.service?.name || 'Hair Braiding Service'
        }));
      
      setData(prev => ({ ...prev, testimonials: featuredTestimonials }));
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError(prev => ({ ...prev, testimonials: err.message }));
      // Fallback to mock data
      setData(prev => ({ ...prev, testimonials: getFallbackTestimonials() }));
    } finally {
      setLoading(prev => ({ ...prev, testimonials: false }));
    }
    */
  }, []);

  // Helper functions
  const getCategoryColor = (categoryName) => {
    const colors = {
      'Senegal & Island Twists': '#8a6d3b',
      'Butterfly Locs': '#d4b483',
      'Boho Braids': '#6b4f2c',
      'Bora Bora Braids': '#7a5e34',
      'Crochet Braids': '#8a6d3b',
      'Dreads/Locs & Sister Locs': '#d4b483',
      'Faux Locs': '#6b4f2c',
      'Fulani Braids & Boho': '#7a5e34',
      'Invisible Twists': '#8a6d3b',
      'Knotless Braids': '#d4b483',
      'Regular Box Braids': '#6b4f2c',
      'Stitch Braids': '#7a5e34',
      'Men\'s Hairstyles': '#8a6d3b',
      'Wigs & Weaves': '#d4b483',
      'Natural Hair Styling': '#6b4f2c',
      'New/Trending Styles': '#7a5e34',
      'I-Tips / Micro Links': '#8a6d3b',
      'Take Down & Touch Up': '#d4b483'
    };
    return colors[categoryName] || '#8a6d3b';
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchServices();
    fetchStaff();
    fetchTestimonials();
  }, [fetchServices, fetchStaff, fetchTestimonials]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      if (el.id) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!data.testimonials.length) return;

    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % data.testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [data.testimonials.length]);

  const nextTestimonial = () => {
    setActiveTestimonial(prev => (prev + 1) % data.testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial(prev => (prev - 1 + data.testimonials.length) % data.testimonials.length);
  };

  // Format duration from minutes to readable format
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-pattern"></div>
          <div className="hero-gradient"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>Professional Hair Braider Since 2015</span>
            </div>
            <h1 className="hero-title">
              Welcome to <span className="highlight">Virginia</span> Hair Braider
            </h1>
            <p className="hero-subtitle">
              Your premier destination for protective styles, braids, locs, and extensions. 
              Where artistry meets perfection for your hair transformation.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.totalClients.toLocaleString()}+</span>
                <span className="stat-label">Happy Clients</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{stats.expertStylists}</span>
                <span className="stat-label">Expert Braider</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalServices}+</span>
                <span className="stat-label">Services</span>
              </div>
            </div>
            <div className="hero-actions">
              <Link to="/booking" className="btn btn-primary btn-lg btn-elegant">
                <FiCalendar className="btn-icon" />
                <span>Book Appointment</span>
                <FiArrowRight className="btn-icon-right" />
              </Link>
              <Link to="/services" className="btn btn-outline-light btn-lg">
                <FiScissors className="btn-icon" />
                <span>Explore Styles</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section services-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Our Specialties</div>
            <h2>Popular <span className="text-primary">Styles</span></h2>
            <p>Experience our most sought-after braiding styles, perfected over years of excellence</p>
          </div>
          
          {loading.services ? (
            <div className="loading-container">
              <FiLoader className="loading-spinner" />
              <p>Loading styles...</p>
            </div>
          ) : error.services ? (
            <div className="error-container">
              <p className="error-message">⚠️ {error.services}</p>
              <p className="error-help">Showing sample styles</p>
            </div>
          ) : (
            <div 
              id="services-grid" 
              className={`services-grid animate-on-scroll ${
                visibleSections.has('services-grid') ? 'visible' : ''
              }`}
            >
              {data.services.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={{
                    ...service,
                    duration: formatDuration(service.duration)
                  }}
                />
              ))}
            </div>
          )}
          
          <div className="section-footer">
            <Link to="/services" className="btn btn-outline btn-with-icon">
              <span>View All {stats.totalServices}+ Styles</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section features-section bg-light">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Excellence in Braiding</div>
            <h2>Why Choose <span className="text-primary">Virginia</span></h2>
            <p>Discover what sets us apart in the world of hair braiding</p>
          </div>
          <div 
            id="features-grid"
            className={`features-grid animate-on-scroll ${
              visibleSections.has('features-grid') ? 'visible' : ''
            }`}
          >
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                style={{ '--feature-color': feature.color }}
              >
                <div className="feature-icon-wrapper">
                  <div className="feature-icon-bg"></div>
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-decoration"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Expert */}
      <section className="section team-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Our Artisan</div>
            <h2>Meet <span className="text-primary">Virginia</span></h2>
            <p>Get to know the talented professional behind your transformation</p>
          </div>
          
          {loading.staff ? (
            <div className="loading-container">
              <FiLoader className="loading-spinner" />
              <p>Loading staff information...</p>
            </div>
          ) : error.staff ? (
            <div className="error-container">
              <p className="error-message">⚠️ {error.staff}</p>
              <p className="error-help">Showing sample information</p>
            </div>
          ) : (
            <div 
              id="team-grid"
              className={`team-grid animate-on-scroll ${
                visibleSections.has('team-grid') ? 'visible' : ''
              }`}
            >
              {data.staff.map((staff) => (
                <StaffCard 
                  key={staff.id} 
                  staff={staff}
                />
              ))}
            </div>
          )}
          
          <div className="section-footer">
            <Link to="/about" className="btn btn-outline btn-with-icon">
              <span>Learn More About Virginia</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="section testimonials-section bg-light">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Client Love</div>
            <h2>What Our <span className="text-primary">Clients Say</span></h2>
            <p>Real stories from our valued customers</p>
          </div>
          
          {loading.testimonials ? (
            <div className="loading-container">
              <FiLoader className="loading-spinner" />
              <p>Loading testimonials...</p>
            </div>
          ) : error.testimonials ? (
            <div className="error-container">
              <p className="error-message">⚠️ {error.testimonials}</p>
              <p className="error-help">Showing sample testimonials</p>
            </div>
          ) : data.testimonials.length === 0 ? (
            <div className="no-data">
              <p>No testimonials yet. Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="testimonials-carousel" role="region" aria-label="Client testimonials carousel">
              <button 
                className="carousel-nav prev"
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
                type="button"
                disabled={data.testimonials.length <= 1}
              >
                <FiChevronLeft />
              </button>
              
              <div className="testimonials-track">
                {data.testimonials.map((review, index) => (
                  <div 
                    key={review.id}
                    className={`testimonial-slide ${index === activeTestimonial ? 'active' : ''}`}
                    role="tabpanel"
                    aria-hidden={index !== activeTestimonial}
                  >
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
              
              <button 
                className="carousel-nav next"
                onClick={nextTestimonial}
                aria-label="Next testimonial"
                type="button"
                disabled={data.testimonials.length <= 1}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
          
          <div className="carousel-dots">
            {data.testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                type="button"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Promise Section */}
      <section className="section promise-section">
        <div className="container">
          <div className="promise-content">
            <div className="promise-image-placeholder">
              <FiAward size={64} color="var(--primary-color)" />
            </div>
            <div className="promise-text">
              <h2>Our <span className="text-primary">Quality Promise</span></h2>
              <p>At Virginia Hair Braider, we commit to providing unparalleled quality and service. Every appointment is crafted for your comfort and satisfaction.</p>
              <ul className="promise-list">
                <li>
                  <FiCheck />
                  <span>100% Satisfaction Guarantee</span>
                </li>
                <li>
                  <FiCheck />
                  <span>Premium Braiding Hair Only</span>
                </li>
                <li>
                  <FiCheck />
                  <span>Certified Professional</span>
                </li>
                <li>
                  <FiCheck />
                  <span>Hygiene & Safety Excellence</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="cta-section">
        <div className="cta-background"></div>
        <div className="container">
          <div className="cta-content">
            <h2>Ready for Your <span className="highlight">Hair Transformation?</span></h2>
            <p>Book your appointment today and experience professional braiding services tailored just for you.</p>
            <div className="cta-actions">
              <Link to="/booking" className="btn btn-primary btn-lg btn-elegant">
                <FiCalendar className="btn-icon" />
                <span>Book Your Style</span>
                <FiArrowRight className="btn-icon-right" />
              </Link>
              <Link to="/contact" className="btn btn-outline-light btn-lg">
                <span>Contact Virginia</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;