import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useToast } from '../../../components/common/Toast/Toast';
import { authService } from '../../../services/authService';
import './ForgotPassword.css';
import { FiMail, FiCheckCircle } from 'react-icons/fi';

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const toast = useToast();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-form-container">
        <div className="auth-form-header">
          <FiCheckCircle className="success-icon" />
          <h2>Check Your Email</h2>
          <p>We've sent password reset instructions to your email address.</p>
        </div>

        <div className="auth-form-footer">
          <p>
            Didn't receive the email?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => setIsSubmitted(false)}
            >
              Try again
            </button>
          </p>
          <p>
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form-header">
        <h2>Forgot Password</h2>
        <p>Enter your email to reset your password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <div className="input-with-icon">
            <FiMail className="input-icon" />
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
          </div>
          {errors.email && (
            <div className="form-text error">{errors.email.message}</div>
          )}
          <div className="form-text">
            We'll send a link to reset your password
          </div>
        </div>

        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </div>

        <div className="auth-form-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;