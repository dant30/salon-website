import React, { useEffect, useState } from 'react';
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
  FiChevronRight
} from 'react-icons/fi';
import { GiFlowerEmblem, GiLipstick } from 'react-icons/gi';

const Home = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [visibleSections, setVisibleSections] = useState(() => new Set());

  // Mock data - moved outside component to avoid recreating on each render
  const featuredServices = [
    {
      id: 1,
      name: 'Haircut & Style',
      description: 'Professional haircut and styling with our expert stylists',
      duration: 60,
      price: 45,
      image: null,
      category: { name: 'Hair', icon: <FiScissors /> },
      is_popular: true,
      color: '#8a6d3b',
    },
    {
      id: 2,
      name: 'Manicure & Pedicure',
      description: 'Complete nail care treatment with premium polish',
      duration: 90,
      price: 60,
      discounted_price: 50,
      image: null,
      category: { name: 'Nails', icon: <GiLipstick /> },
      is_popular: true,
      color: '#d4b483',
    },
    {
      id: 3,
      name: 'Luxury Facial',
      description: 'Rejuvenating facial with deep cleansing and hydration',
      duration: 75,
      price: 80,
      image: null,
      category: { name: 'Skincare', icon: <GiFlowerEmblem /> },
      is_popular: false,
      color: '#6b4f2c',
    },
    {
      id: 4,
      name: 'Spa Massage',
      description: 'Relaxing full-body massage for ultimate wellness',
      duration: 90,
      price: 95,
      image: null,
      category: { name: 'Spa', icon: <FiStar /> },
      is_popular: true,
      color: '#7a5e34',
    },
  ];

  const featuredStaff = [
    {
      id: 1,
      user: {
        first_name: 'Sarah',
        last_name: 'Johnson',
        full_name: 'Sarah Johnson',
      },
      title: 'Senior Master Stylist',
      specialization: [{ name: 'Hair Color' }, { name: 'Extensions' }],
      experience_years: 12,
      photo: null,
      is_active: true,
      bio: 'Specializes in color correction and custom cuts',
    },
    {
      id: 2,
      user: {
        first_name: 'Michael',
        last_name: 'Chen',
        full_name: 'Michael Chen',
      },
      title: 'Nail Art Director',
      specialization: [{ name: 'Nail Art' }, { name: 'Spa Treatments' }],
      experience_years: 8,
      photo: null,
      is_active: true,
      bio: 'Award-winning nail artist with international experience',
    },
    {
      id: 3,
      user: {
        first_name: 'Elena',
        last_name: 'Rodriguez',
        full_name: 'Elena Rodriguez',
      },
      title: 'Skincare Specialist',
      specialization: [{ name: 'Facials' }, { name: 'Peels' }],
      experience_years: 6,
      photo: null,
      is_active: true,
      bio: 'Certified esthetician with advanced skincare training',
    },
  ];

  const testimonials = [
    {
      id: 1,
      client_name: 'Emma Wilson',
      rating: 5,
      comment: 'The attention to detail and customer service is exceptional. Sarah transformed my hair exactly as I envisioned!',
      service_name: 'Hair Color & Cut',
      created_at: '2024-01-15',
      is_featured: true,
      avatar_color: '#8a6d3b',
    },
    {
      id: 2,
      client_name: 'David Lee',
      rating: 5,
      comment: 'Best salon experience I\'ve ever had! The team is professional, and the results are always flawless.',
      service_name: 'Complete Grooming Package',
      created_at: '2024-01-10',
      is_featured: true,
      avatar_color: '#6b4f2c',
    },
    {
      id: 3,
      client_name: 'Sophia Martinez',
      rating: 5,
      comment: 'The luxury facial was absolutely incredible. My skin has never looked better. Highly recommended!',
      service_name: 'Signature Facial',
      created_at: '2024-01-05',
      is_featured: true,
      avatar_color: '#d4b483',
    },
  ];

  const features = [
    {
      icon: <FiAward />,
      title: 'Award-Winning Team',
      description: 'Multiple industry awards and recognitions for excellence',
      color: '#8a6d3b',
    },
    {
      icon: <FiStar />,
      title: 'Premium Products',
      description: 'We use only professional-grade, luxury beauty brands',
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
      description: 'Customized treatments tailored to your unique needs',
      color: '#7a5e34',
    },
  ];

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
    if (!testimonials.length) return;

    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setActiveTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
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
              <span>Premium Salon Since 2010</span>
            </div>
            <h1 className="hero-title">
              Experience <span className="highlight">Luxury</span> Beauty & Wellness
            </h1>
            <p className="hero-subtitle">
              Your premier destination for exceptional salon services. 
              Where artistry meets perfection for your complete transformation.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">5,000+</span>
                <span className="stat-label">Happy Clients</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">12</span>
                <span className="stat-label">Expert Stylists</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
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
                <span>Explore Services</span>
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
            <h2>Signature <span className="text-primary">Services</span></h2>
            <p>Experience our most sought-after treatments, perfected over years of excellence</p>
          </div>
          <div 
            id="services-grid" 
            className={`services-grid animate-on-scroll ${
              visibleSections.has('services-grid') ? 'visible' : ''
            }`}
          >
            {featuredServices.map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service}
              />
            ))}
          </div>
          <div className="section-footer">
            <Link to="/services" className="btn btn-outline btn-with-icon">
              <span>View All Services</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section features-section bg-light">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Excellence in Beauty</div>
            <h2>Why Choose <span className="text-primary">Salon Elegance</span></h2>
            <p>Discover what sets us apart in the world of luxury beauty</p>
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

      {/* Meet Our Experts */}
      <section className="section team-section">
        <div className="container">
          <div className="section-header">
            <div className="section-label">Our Artisans</div>
            <h2>Meet Our <span className="text-primary">Expert Team</span></h2>
            <p>Get to know the talented professionals behind your transformation</p>
          </div>
          <div 
            id="team-grid"
            className={`team-grid animate-on-scroll ${
              visibleSections.has('team-grid') ? 'visible' : ''
            }`}
          >
            {featuredStaff.map((staff) => (
              <StaffCard 
                key={staff.id} 
                staff={staff}
              />
            ))}
          </div>
          <div className="section-footer">
            <Link to="/about" className="btn btn-outline btn-with-icon">
              <span>Meet Our Full Team</span>
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
          
          <div className="testimonials-carousel" role="region" aria-label="Client testimonials carousel">
            <button 
              className="carousel-nav prev"
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
              type="button"
            >
              <FiChevronLeft />
            </button>
            
            <div className="testimonials-track">
              {testimonials.map((review, index) => (
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
            >
              <FiChevronRight />
            </button>
            
            <div className="carousel-dots" role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === activeTestimonial ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                  aria-pressed={index === activeTestimonial}
                  aria-label={`Go to testimonial ${index + 1}`}
                  type="button"
                  role="tab"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Promise */}
      <section className="section promise-section">
        <div className="container">
          <div className="promise-content">
            <div className="promise-image">
              <div className="promise-image-placeholder">
                <FiAward size={64} color="var(--primary-color)" />
              </div>
            </div>
            <div className="promise-text">
              <h2>Our <span className="text-primary">Premium Promise</span></h2>
              <p>At Salon Elegance, we commit to providing unparalleled quality and service. Every visit is an experience crafted for your comfort and satisfaction.</p>
              <ul className="promise-list">
                <li>
                  <FiCheck />
                  <span>100% Satisfaction Guarantee</span>
                </li>
                <li>
                  <FiCheck />
                  <span>Premium Products Only</span>
                </li>
                <li>
                  <FiCheck />
                  <span>Certified Professionals</span>
                </li>
                <li>
                  <FiCheck />
                  <span>Hygiene Excellence</span>
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
            <h2>Ready for Your <span className="highlight">Transformation?</span></h2>
            <p>Book your appointment today and experience luxury beauty services tailored just for you.</p>
            <div className="cta-actions">
              <Link to="/booking" className="btn btn-primary btn-lg btn-elegant">
                <FiCalendar className="btn-icon" />
                <span>Book Your Visit</span>
                <FiArrowRight className="btn-icon-right" />
              </Link>
              <Link to="/contact" className="btn btn-outline-light btn-lg">
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;