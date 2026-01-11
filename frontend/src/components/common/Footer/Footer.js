import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone, FiMapPin, FiMessageCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const backToTopButton = document.querySelector('.back-to-top');
      if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
    { path: '/booking', label: 'Book Appointment' },
  ];

  const services = [
    { path: '/services#braids', label: 'Braiding Styles' },
    { path: '/services#weaves', label: 'Hair Weaves' },
    { path: '/services#extensions', label: 'Hair Extensions' },
    { path: '/services#natural', label: 'Natural Hair Care' },
    { path: '/services#kids', label: "Kids' Styles" },
    { path: '/services#maintenance', label: 'Style Maintenance' },
  ];

  const contactInfo = [
    { 
      icon: <FiMapPin />, 
      text: '141 W Grand St, Nanticoke, PA 18634, United States',
      link: 'https://maps.google.com/?q=141+W+Grand+St,+Nanticoke,+PA+18634'
    },
    { 
      icon: <FiPhone />, 
      text: '(570) 331-1503',
      link: 'tel:+15703311503'
    },
    { 
      icon: <FiMail />, 
      text: 'berthaajohn151@gmail.com',
      link: 'mailto:berthaajohn151@gmail.com'
    },
    { 
      icon: <FiMessageCircle />, 
      text: 'Message on WhatsApp',
      link: 'https://wa.me/15703311503'
    },
  ];

  const socialLinks = [
    { 
      icon: <FiInstagram />, 
      url: 'https://www.instagram.com/virginia_hair_braider/', 
      label: 'Instagram' 
    },
    { 
      icon: <FiFacebook />, 
      url: 'https://facebook.com', 
      label: 'Facebook' 
    },
    { 
      icon: <FiTwitter />, 
      url: 'https://twitter.com', 
      label: 'Twitter' 
    },
    {
      icon: <FaWhatsapp />,
      url: 'https://wa.me/15703311503',
      label: 'WhatsApp'
    }
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.querySelector('#newsletter-email').value;
    if (email) {
      console.log('Newsletter subscription:', email);
      e.target.reset();
      // TODO: Send to backend
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <h3 className="footer-logo">Virginia Hair Braider</h3>
              <p className="footer-description">
                Professional hair braiding services in Virginia. 
                Expert styling with attention to detail and customer satisfaction.
              </p>
            </div>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <form className="footer-newsletter" onSubmit={handleNewsletterSubmit}>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="newsletter-email"
                placeholder="Your email address"
                required
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4 className="footer-heading">Our Services</h4>
            <ul className="footer-links">
              {services.map((service) => (
                <li key={service.path}>
                  <Link to={service.path} className="footer-link">
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="contact-info">
              {contactInfo.map((info, index) => (
                <li key={index} className="contact-item">
                  <span className="contact-icon">{info.icon}</span>
                  <a 
                    href={info.link} 
                    className="contact-text"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {info.text}
                  </a>
                </li>
              ))}
            </ul>
            <div className="business-hours">
              <h5>Business Hours</h5>
              <p>Monday - Friday: 9am - 7pm</p>
              <p>Saturday: 10am - 5pm</p>
              <p>Sunday: 12pm - 4pm</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} Virginia Hair Braider. All rights reserved.
          </div>
          <div className="legal-links">
            <Link to="/privacy" className="legal-link">
              Privacy Policy
            </Link>
            <Link to="/terms" className="legal-link">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </footer>
  );
};

export default Footer;