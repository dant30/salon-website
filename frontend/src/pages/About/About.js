import React from 'react';
import StaffCard from '../../components/salon/StaffCard/StaffCard';
import './About.css';
import { FiAward, FiUsers, FiClock, FiStar } from 'react-icons/fi';

const TEAM_MEMBERS = [
  {
    id: 1,
    user: {
      first_name: 'Virginia',
      last_name: 'Hair Braider',
      full_name: 'Virginia Hair Braider',
    },
    title: 'Master Braider & Owner',
    bio: 'Virginia is a highly skilled hair braider with years of experience specializing in protective styles, braids, locs, and extensions. She is passionate about creating beautiful, healthy hairstyles that make her clients feel confident and beautiful.',
    specialization: [{ name: 'All Braiding Styles' }, { name: 'Protective Styles' }],
    experience_years: 8,
    photo: null,
    is_active: true,
  },
];

const VALUES = [
  {
    icon: <FiStar />,
    title: 'Quality',
    text: 'We use premium hair and uphold the highest standards in braiding techniques.',
  },
  {
    icon: <FiUsers />,
    title: 'Community',
    text: 'We proudly support and grow with our local community in Nanticoke, PA.',
  },
  {
    icon: <FiAward />,
    title: 'Expertise',
    text: 'Certified professionals with years of real-world experience in hair braiding.',
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
          <h1>About Virginia Hair Braider</h1>
          <p>Professional hair braiding services, rooted in skill and care</p>
        </header>

        {/* Story */}
        <section className="story-section">
          <div className="story-content">
            <h2>Our Story</h2>
            <p>
              Virginia Hair Braider was founded with a passion for creating beautiful, protective hairstyles that empower clients to feel confident and stylish. With over 8 years of experience, Virginia specializes in a wide range of braiding techniques, from Senegal twists and butterfly locs to knotless braids and more.
            </p>
            <p>
              Located in Nanticoke, PA, our salon is dedicated to providing personalized, high-quality hair services in a welcoming environment. Every braid is crafted with attention to detail, using premium materials to ensure lasting results and healthy hair.
            </p>
          </div>

          <div className="story-image" aria-hidden="true">
            <div className="image-placeholder">
              <span>Virginia Hair Braider</span>
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
          <h2>Ready for Your Hair Transformation?</h2>
          <p>Book your appointment with Virginia and experience expert braiding services.</p>
          <a href="/booking" className="btn btn-primary btn-lg">
            Book an Appointment
          </a>
        </section>
      </div>
    </main>
  );
};

export default About;
