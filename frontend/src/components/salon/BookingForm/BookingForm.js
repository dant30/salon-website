import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../common/Toast/Toast';
import { bookingService } from '../../../services/bookingService';
import './BookingForm.css';
import { FiCalendar, FiClock, FiUser, FiScissors, FiMessageSquare } from 'react-icons/fi';

const BookingForm = ({ 
  initialService = null,
  initialStaff = null,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(initialService);
  const [selectedStaff, setSelectedStaff] = useState(initialStaff);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const toast = useToast();
  const navigate = useNavigate();

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setValue('client_name', `${user.first_name} ${user.last_name}`);
      setValue('email', user.email);
      setValue('phone', user.phone);
    }
  }, [user, setValue]);

  // Load available staff for selected service
  const loadAvailableStaff = useCallback(async () => {
    try {
      const staff = await bookingService.getStaffByService(selectedService.id);
      if (initialStaff && staff.some(s => s.id === initialStaff.id)) {
        setSelectedStaff(initialStaff);
      }
    } catch (error) {
      toast.error('Failed to load available staff');
    }
  }, [selectedService, initialStaff, toast]);

  useEffect(() => {
    if (selectedService) {
      loadAvailableStaff();
    }
  }, [selectedService, loadAvailableStaff]);

  const goToStep = (stepNumber) => {
    setStep(stepNumber);
  };

  const onSubmit = async (data) => {
    if (!selectedService || !selectedStaff) {
      toast.error('Please complete all booking steps');
      return;
    }

    setIsLoading(true);
    try {
      const bookingData = {
        service_id: selectedService.id,
        staff_id: selectedStaff.id,
        notes: data.notes,
        special_requests: data.special_requests,
      };

      const appointment = await bookingService.createAppointment(bookingData);
      
      toast.success('Appointment booked successfully!');
      
      if (onSuccess) {
        onSuccess(appointment);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to book appointment';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="booking-form-container">
      {/* Booking Steps */}
      <div className="booking-steps">
        {[
          { number: 1, label: 'Service', icon: <FiScissors /> },
          { number: 2, label: 'Staff', icon: <FiUser /> },
          { number: 3, label: 'Details', icon: <FiMessageSquare /> },
        ].map((stepItem) => (
          <div
            key={stepItem.number}
            className={`step-item ${step === stepItem.number ? 'active' : ''} ${step > stepItem.number ? 'completed' : ''}`}
            onClick={() => step > stepItem.number && goToStep(stepItem.number)}
          >
            <div className="step-number">
              {step > stepItem.number ? '✓' : stepItem.number}
            </div>
            <div className="step-label">
              <span className="step-icon">{stepItem.icon}</span>
              <span>{stepItem.label}</span>
            </div>
            {stepItem.number < 3 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="booking-content">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="booking-step">
            <h3>Select a Service</h3>
            <p>Choose the service you'd like to book</p>
            {/* Service selection UI would go here */}
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Next: Choose Staff
            </button>
          </div>
        )}

        {/* Step 2: Staff Selection */}
        {step === 2 && (
          <div className="booking-step">
            <h3>Select a Staff Member</h3>
            <p>Choose who will provide your service</p>
            {/* Staff selection UI would go here */}
            <div className="step-actions">
              <button className="btn btn-outline" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                Next: Confirm Details
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit(onSubmit)} className="booking-details-form">
            <h3>Confirm Your Booking</h3>
            
            <div className="booking-summary">
              <div className="summary-item">
                <strong>Service:</strong> {selectedService?.name}
              </div>
              <div className="summary-item">
                <strong>Staff:</strong> {selectedStaff?.user?.first_name} {selectedStaff?.user?.last_name}
              </div>
              <div className="summary-item price">
                <strong>Total:</strong> ${selectedService?.final_price}
              </div>
            </div>

            <div className="form-section">
              <h4>Your Information</h4>
              
              <div className="form-group">
                <label htmlFor="client_name" className="form-label">
                  Full Name
                </label>
                <input
                  id="client_name"
                  type="text"
                  className={`form-control ${errors.client_name ? 'is-invalid' : ''}`}
                  {...register('client_name', {
                    required: 'Name is required',
                  })}
                />
                {errors.client_name && (
                  <div className="form-text error">{errors.client_name.message}</div>
                )}
              </div>

              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                    />
                    {errors.email && (
                      <div className="form-text error">{errors.email.message}</div>
                    )}
                  </div>
                </div>

                <div className="col">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      {...register('phone', {
                        required: 'Phone number is required',
                      })}
                    />
                    {errors.phone && (
                      <div className="form-text error">{errors.phone.message}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Additional Information</h4>
              
              <div className="form-group">
                <label htmlFor="special_requests" className="form-label">
                  Special Requests (Optional)
                </label>
                <textarea
                  id="special_requests"
                  className="form-control"
                  rows="3"
                  placeholder="Any special requirements or preferences"
                  {...register('special_requests')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows="2"
                  placeholder="Additional notes for your appointment"
                  {...register('notes')}
                />
              </div>

              <div className="form-group">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="terms"
                    className="form-check-input"
                    {...register('terms', {
                      required: 'You must accept the terms and conditions',
                    })}
                  />
                  <label htmlFor="terms" className="form-check-label">
                    I agree to the cancellation policy and terms of service
                  </label>
                </div>
                {errors.terms && (
                  <div className="form-text error">{errors.terms.message}</div>
                )}
              </div>

              <div className="step-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingForm;