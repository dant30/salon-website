import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast/Toast';
import './UserProfile.css';
import { FiUser, FiMail, FiPhone, FiSave, FiCamera } from 'react-icons/fi';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  });
  const toast = useToast();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="page-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and preferences</p>
        </div>

        <div className="profile-content">
          {/* Profile Overview */}
          <div className="profile-overview">
            <div className="profile-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.first_name} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                </div>
              )}
              <button className="avatar-upload">
                <FiCamera />
              </button>
            </div>
            <div className="profile-info">
              <h2>{user?.first_name} {user?.last_name}</h2>
              <p>{user?.email}</p>
              <p>Member since {new Date(user?.date_joined).getFullYear()}</p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">
                    <FiUser />
                    First Name
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    disabled={!isEditing}
                    className={errors.first_name ? 'error' : ''}
                    {...register('first_name', { 
                      required: 'First name is required'
                    })}
                  />
                  {errors.first_name && (
                    <span className="error-message">{errors.first_name.message}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    type="text"
                    disabled={!isEditing}
                    className={errors.last_name ? 'error' : ''}
                    {...register('last_name', { 
                      required: 'Last name is required'
                    })}
                  />
                  {errors.last_name && (
                    <span className="error-message">{errors.last_name.message}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <FiMail />
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  disabled={!isEditing}
                  className={errors.email ? 'error' : ''}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <FiPhone />
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  disabled={!isEditing}
                  {...register('phone')}
                />
              </div>
            </div>

            {/* Preferences Section */}
            <div className="form-section">
              <h3>Preferences</h3>
              <div className="preferences">
                <label className="checkbox-label">
                  <input type="checkbox" disabled={!isEditing} />
                  <span>Receive promotional emails</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" disabled={!isEditing} />
                  <span>Receive appointment reminders</span>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" disabled={!isEditing} />
                  <span>Receive special offers</span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              {isEditing ? (
                <>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    <FiSave />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>

          {/* Account Settings */}
          <div className="account-settings">
            <h3>Account Settings</h3>
            <div className="settings-actions">
              <button className="settings-btn">
                Change Password
              </button>
              <button className="settings-btn">
                Privacy Settings
              </button>
              <button className="settings-btn danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;