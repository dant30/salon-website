import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/common/Toast/Toast';
import './RegisterForm.css';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pwStrength, setPwStrength] = useState('');
  const { register: registerUser } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const toast = useToast();

  const password = watch('password', '');

  // Simple password strength meter
  useEffect(() => {
    const p = password || '';
    if (p.length >= 12 && /[A-Z]/.test(p) && /\d/.test(p) && /[\W_]/.test(p)) setPwStrength('strong');
    else if (p.length >= 8 && (/[A-Z]/.test(p) || /\d/.test(p))) setPwStrength('medium');
    else if (p.length > 0) setPwStrength('weak');
    else setPwStrength('');
  }, [password]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        password2: data.confirm_password,
        terms: !!data.terms,
      };

      await registerUser(payload);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      const respData = error.response?.data;
      if (respData && typeof respData === 'object') {
        const firstKey = Object.keys(respData)[0];
        const message = Array.isArray(respData[firstKey]) ? respData[firstKey][0] : respData[firstKey];
        toast.error(message || 'Registration failed.');
      } else {
        toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <header className="auth-form-header">
        <h2>Create Account</h2>
        <p>Join Salon Elegance and start booking your appointments seamlessly.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">

        {/* Name Row */}
        <div className="row">
          {['first_name', 'last_name'].map((field, idx) => (
            <div className="col" key={field}>
              <div className="form-group">
                <label htmlFor={field} className="form-label">
                  {field === 'first_name' ? 'First Name' : 'Last Name'}
                </label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input
                    id={field}
                    type="text"
                    className={`form-control ${errors[field] ? 'is-invalid' : ''}`}
                    placeholder={`Enter your ${field === 'first_name' ? 'first' : 'last'} name`}
                    {...register(field, { required: `${field === 'first_name' ? 'First' : 'Last'} name is required` })}
                  />
                </div>
                {errors[field] && <div className="form-text error">{errors[field].message}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <div className="input-with-icon">
            <FiMail className="input-icon" />
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' },
              })}
            />
          </div>
          {errors.email && <div className="form-text error">{errors.email.message}</div>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">Phone Number</label>
          <div className="input-with-icon">
            <FiPhone className="input-icon" />
            <input
              id="phone"
              type="tel"
              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
              placeholder="Enter your phone number"
              {...register('phone', { required: 'Phone number is required' })}
            />
          </div>
          {errors.phone && <div className="form-text error">{errors.phone.message}</div>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="input-with-icon">
            <FiLock className="input-icon" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Create a password"
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {errors.password && <div className="form-text error">{errors.password.message}</div>}

          {/* Password Strength */}
          <div className={`password-strength ${pwStrength || ''}`}>
            <div className="strength-bar">
              <div className={`strength-fill ${pwStrength || ''}`} />
            </div>
            {pwStrength && <div className="strength-text">{pwStrength === 'strong' ? 'Strong' : pwStrength === 'medium' ? 'Medium' : 'Weak'}</div>}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
          <div className="input-with-icon">
            <FiLock className="input-icon" />
            <input
              id="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
              placeholder="Confirm your password"
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match',
              })}
            />
            <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirm_password && <div className="form-text error">{errors.confirm_password.message}</div>}
        </div>

        {/* Terms */}
        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" {...register('terms', { required: 'You must accept the terms and conditions' })} />
            <span>I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link></span>
          </label>
          {errors.terms && <div className="form-text error">{errors.terms.message}</div>}
        </div>

        {/* Submit */}
        <div className="form-group">
          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        {/* Footer */}
        <div className="auth-form-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in here</Link></p>
        </div>

      </form>
    </div>
  );
};

export default RegisterForm;
