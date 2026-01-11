import React from 'react';
import BookingForm from '../../components/salon/BookingForm/BookingForm';
import './Booking.css';

const Booking = () => {
  return (
    <div className="booking-page">
      <div className="page-container">
        <div className="page-header">
          <h1>Book Your Appointment</h1>
          <p>Select your preferred service, staff, date, and time</p>
        </div>

        <div className="booking-content">
          <BookingForm />
        </div>

        <div className="booking-info">
          <h2>Booking Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <h3>Cancellation Policy</h3>
              <p>Please cancel at least 24 hours before your appointment to avoid charges.</p>
            </div>
            <div className="info-item">
              <h3>Running Late?</h3>
              <p>Call us if you're running late. Appointments may be shortened if you arrive late.</p>
            </div>
            <div className="info-item">
              <h3>Confirmation</h3>
              <p>You'll receive a confirmation email after booking your appointment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;