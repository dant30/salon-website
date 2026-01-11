import React from 'react';
import StaffCard from '../../components/salon/StaffCard/StaffCard';
import './About.css';
import { FiAward, FiUsers, FiClock, FiStar } from 'react-icons/fi';

const TEAM_MEMBERS = [
  {
    id: 1,
    user: {
      first_name: 'Sarah',
      last_name: 'Johnson',
      full_name: 'Sarah Johnson',
    },
    title: 'Senior Stylist & Owner',
    bio: 'With over 15 years of experience, Sarah specializes in color correction and balayage.',
    specialization: [{ name: 'Hair' }, { name: 'Color' }],
    experience_years: 15,
    photo: null,
    is_active: true,
  },
  {
    id: 2,
    user: {
      first_name: 'Michael',
      last_name: 'Chen',
      full_name: 'Michael Chen',
    },
    title: 'Nail Specialist',
    bio: 'Michael brings creativity and precision to every nail service.',
    specialization: [{ name: 'Nails' }, { name: 'Spa' }],
    experience_years: 8,
    photo: null,
    is_active: true,
  },
];

const VALUES = [
  {
    icon: <FiStar />,
    title: 'Quality',
    text: 'We use premium products and uphold the highest service standards.',
  },
  {
    icon: <FiUsers />,
    title: 'Community',
    text: 'We proudly support and grow with our local community.',
  },
  {
    icon: <FiAward />,
    title: 'Expertise',
    text: 'Certified professionals with years of real-world experience.',
  },
  {
    icon: <FiClock />,
    title: 'Punctuality',
    text: 'Your time matters. We run on schedule, always.',
  },
];

const About = () => {
  return (
    <main className="about-page">
      <div className="page-container">
        {/* Header */}
        <header className="page-header">
          <h1>About Salon Elegance</h1>
          <p>Luxury beauty and wellness, rooted in care and craft</p>
        </header>

        {/* Story */}
        <section className="story-section">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>
              Founded in 2010, Salon Elegance began as a boutique salon with a simple belief:
              beauty should feel personal, calm, and exceptional.
            </p>
            <p>
              As we’ve grown, our standards haven’t shifted. Every service, every product,
              every interaction is shaped by intention and expertise.
            </p>
          </div>

          <div className="story-image" aria-hidden="true">
            <div className="image-placeholder">
              <span>Salon Elegance</span>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="values-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            {VALUES.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="team-section">
          <h2>Meet Our Team</h2>
          <p className="section-subtitle">
            Skilled professionals. Timeless technique. Modern care.
          </p>

          <div className="team-grid">
            {TEAM_MEMBERS.map(member => (
              <StaffCard key={member.id} staff={member} showBio />
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <h2>Ready to Feel the Difference?</h2>
          <p>Book your appointment and experience beauty done right.</p>
          <a href="/booking" className="btn btn-primary btn-lg">
            Book an Appointment
          </a>
        </section>
      </div>
    </main>
  );
};

export default About;
