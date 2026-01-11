import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../../components/common/Toast/Toast';
import './Contact.css';
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiMessageCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const CONTACT_INFO = [
  { icon: <FiMapPin />, title: 'Visit Us', details: ['141 W Grand St', 'Nanticoke, PA 18634', 'United States'], link: 'https://maps.google.com/?q=141+W+Grand+St,+Nanticoke,+PA+18634', isLink: true },
  { icon: <FiPhone />, title: 'Call Us', details: ['(570) 331-1503'], link: 'tel:+15703311503', isLink: true },
  { icon: <FiMail />, title: 'Email Us', details: ['berthaajohn151@gmail.com'], link: 'mailto:berthaajohn151@gmail.com', isLink: true },
  { icon: <FaWhatsapp />, title: 'WhatsApp', details: ['Message us on WhatsApp'], link: 'https://wa.me/15703311503', isLink: true },
  { icon: <FiMessageCircle />, title: 'Text Us', details: ['(570) 331-1503'], link: 'sms:+15703311503', isLink: true },
  { icon: <FiClock />, title: 'Business Hours', details: ['Mon-Fri: 9am-7pm', 'Sat: 10am-5pm', 'Sun: 12pm-4pm'] },
];

const FAQ_LIST = [
  { question: 'How do I book an appointment?', answer: 'You can book by calling us at (570) 331-1503, sending a WhatsApp message, or using the contact form below.' },
  { question: 'What should I bring to my appointment?', answer: 'Please bring any reference photos of the style you want, and arrive with clean, dry hair.' },
  { question: 'How long do appointments typically take?', answer: 'Braiding appointments range from 2-6 hours depending on the complexity of the style.' },
  { question: 'Do you accept walk-ins?', answer: 'We recommend appointments to ensure we can dedicate enough time to your hair needs.' },
];

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const toast = useToast();

  const messageValue = watch('message', '');
  const characterCount = messageValue.length;
  const characterClass =
    characterCount >= 950 ? 'error' :
    characterCount >= 800 ? 'warning' : '';

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFAQ = (index) => setOpenFAQ(openFAQ === index ? null : index);

  return (
    <main className="contact-page">
      <div className="page-container">

        {/* Header */}
        <header className="page-header">
          <h1>Contact Virginia Hair Braider</h1>
          <p>Have questions about our braiding services? Need to schedule an appointment or discuss your hair needs? Contact us today!</p>
        </header>

        {/* Contact Content Grid */}
        <div className="contact-content">

          {/* Left Column: Contact Info & Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>

            {/* Contact Info */}
            <section className="contact-info-section">
              <h2>Get in Touch</h2>
              <p className="contact-subtitle">We're here to help with all your hair braiding needs</p>
              <div className="contact-info-grid">
                {CONTACT_INFO.map((info, idx) => (
                  <div key={idx} className="contact-info-card">
                    <div className="contact-icon" aria-hidden="true">{info.icon}</div>
                    <h3>{info.title}</h3>
                    {info.details.map((detail, i) => info.isLink && info.link ? (
                      <a
                        key={i}
                        href={info.link}
                        className="contact-detail-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${info.title} link`}
                      >
                        {detail}
                      </a>
                    ) : <p key={i}>{detail}</p>)}
                  </div>
                ))}
              </div>
            </section>

            {/* Map */}
            <section className="map-section">
              <h2>Our Location</h2>
              <p>Come visit our salon at the heart of Nanticoke, PA</p>
              <div className="map-container">
                <div className="map-placeholder">
                  <iframe
                    src="https://maps.google.com/maps?q=141%20W%20Grand%20St,%20Nanticoke,%20PA%2018634&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    title="Virginia Hair Braider Location"
                    frameBorder="0"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Contact Form */}
          <section className="contact-form-section">
            <div className="form-header">
              <h2>Send Us a Message</h2>
              <p>Fill out the form below and we'll respond within 24 hours</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="contact-form">

              {/* Name & Email */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input id="name" type="text" placeholder="Your full name" className={errors.name ? 'error' : ''} {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' }})}/>
                  {errors.name && <span className="error-message">{errors.name.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input id="email" type="email" placeholder="your.email@example.com" className={errors.email ? 'error' : ''} {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }})}/>
                  {errors.email && <span className="error-message">{errors.email.message}</span>}
                </div>
              </div>

              {/* Phone & Service */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input id="phone" type="tel" placeholder="(570) 123-4567" {...register('phone', { pattern: { value: /^[\+]?[1-9][\d]{0,15}$/, message: 'Invalid phone number' }})}/>
                  {errors.phone && <span className="error-message">{errors.phone.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="service">Service Interested In</label>
                  <select id="service" {...register('service')}>
                    <option value="">Select a service</option>
                    <option value="braiding">Braiding Styles</option>
                    <option value="weaves">Hair Weaves</option>
                    <option value="extensions">Hair Extensions</option>
                    <option value="natural">Natural Hair Care</option>
                    <option value="kids">Kids' Styles</option>
                    <option value="maintenance">Style Maintenance</option>
                    <option value="consultation">Consultation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input id="subject" type="text" placeholder="e.g., Appointment Request, Pricing Question" className={errors.subject ? 'error' : ''} {...register('subject', { required: 'Subject is required', minLength: { value: 5, message: 'Subject must be at least 5 characters' }})}/>
                {errors.subject && <span className="error-message">{errors.subject.message}</span>}
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  rows="6"
                  placeholder="Please provide details..."
                  className={errors.message ? 'error' : ''}
                  {...register('message', { required: 'Message is required', minLength: { value: 20, message: 'Message must be at least 20 characters' }, maxLength: { value: 1000, message: 'Message must not exceed 1000 characters' }})}
                />
                {errors.message && <span className="error-message">{errors.message.message}</span>}
                <div className={`character-count ${characterClass}`}>
                  {characterCount} / 1000 characters
                  {characterCount >= 800 && characterCount < 950 && <span style={{color: '#e67e22'}}> - Getting close to limit</span>}
                  {characterCount >= 950 && <span style={{color: 'var(--error-color)'}}> - Near maximum</span>}
                </div>
              </div>

              {/* Newsletter */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" {...register('newsletter', { required: false })} />
                  <span>Subscribe to our newsletter for updates and promotions</span>
                </label>
              </div>

              {/* Actions */}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => reset()} disabled={isSubmitting}>Clear Form</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  <FiSend className={`btn-icon ${isSubmitting ? 'spin' : ''}`} />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>

            </form>
          </section>

        </div>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {FAQ_LIST.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-item ${openFAQ === idx ? 'open' : ''}`}
                onClick={() => toggleFAQ(idx)}
                style={{ cursor: 'pointer' }}
                aria-expanded={openFAQ === idx ? 'true' : 'false'}
              >
                <h3>{faq.question}</h3>
                <div className="faq-answer">
                  {openFAQ === idx && <p>{faq.answer}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
};

export default Contact;
