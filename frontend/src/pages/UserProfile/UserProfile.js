import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast/Toast';
import { useStaff } from '../../hooks/useStaff';
import './UserProfile.css';
import { 
  FiUser, FiMail, FiPhone, FiSave, FiCamera, FiCalendar,
  FiMapPin, FiEdit2, FiX, FiCheck, FiStar, FiHeart
} from 'react-icons/fi';

const UserProfile = () => {
  const { user, updateProfile, updateUserProfile, getUserProfile } = useAuth();
  const { getStaffMembers, getPreferredStylist, setPreferredStylist } = useStaff();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [showStylistModal, setShowStylistModal] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  
  const toast = useToast();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profile = await getUserProfile();
        setProfileData(profile);
        
        // Set form default values
        reset({
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          gender: profile?.gender || '',
          date_of_birth: profile?.date_of_birth || '',
          address: profile?.address || '',
          allergies: profile?.allergies || '',
          notes: profile?.notes || '',
        });
        
        // Fetch staff members for stylist selection
        const staff = await getStaffMembers();
        setStaffMembers(staff);
        
        // Get preferred stylist
        const preferredStylist = await getPreferredStylist();
        if (preferredStylist) {
          setSelectedStylist(preferredStylist);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    if (user) {
      fetchProfileData();
    }
  }, [user, getUserProfile, getStaffMembers, getPreferredStylist, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Update basic user info
      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
      });

      // Update user profile info
      await updateUserProfile({
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        address: data.address,
        allergies: data.allergies,
        notes: data.notes,
      });

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStylistSelect = async (stylist) => {
    try {
      await setPreferredStylist(stylist.id);
      setSelectedStylist(stylist);
      setShowStylistModal(false);
      toast.success('Preferred stylist updated!');
    } catch (error) {
      console.error('Error setting preferred stylist:', error);
      toast.error('Failed to update preferred stylist');
    }
  };

  const genderOptions = [
    { value: '', label: 'Prefer not to say' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

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
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                ) : (
                  <div className="avatar-placeholder">
                    {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <button className="avatar-upload" onClick={() => toast.info('Avatar upload coming soon!')}>
                  <FiCamera />
                </button>
              </div>
              <div className="profile-info">
                <h2>{user?.first_name} {user?.last_name}</h2>
                <p className="profile-email">{user?.email}</p>
                <p className="profile-member-since">
                  Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Recently'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3><FiUser /> Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name *</label>
                  <input
                    id="first_name"
                    type="text"
                    disabled={!isEditing}
                    className={errors.first_name ? 'error' : ''}
                    {...register('first_name', { 
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.first_name && (
                    <span className="error-message">{errors.first_name.message}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name">Last Name *</label>
                  <input
                    id="last_name"
                    type="text"
                    disabled={!isEditing}
                    className={errors.last_name ? 'error' : ''}
                    {...register('last_name', { 
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.last_name && (
                    <span className="error-message">{errors.last_name.message}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">
                    <FiMail /> Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="disabled-input"
                  />
                  <small className="field-note">Email cannot be changed</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">
                    <FiPhone /> Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    disabled={!isEditing}
                    placeholder="(123) 456-7890"
                    {...register('phone', {
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Please enter a valid phone number'
                      }
                    })}
                  />
                  {errors.phone && (
                    <span className="error-message">{errors.phone.message}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    disabled={!isEditing}
                    {...register('gender')}
                  >
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="date_of_birth">
                    <FiCalendar /> Date of Birth
                  </label>
                  <input
                    id="date_of_birth"
                    type="date"
                    disabled={!isEditing}
                    {...register('date_of_birth')}
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="form-section">
              <h3><FiMapPin /> Address</h3>
              <div className="form-group">
                <label htmlFor="address">Full Address</label>
                <textarea
                  id="address"
                  rows="3"
                  disabled={!isEditing}
                  placeholder="Enter your full address"
                  {...register('address')}
                />
              </div>
            </div>

            {/* Preferred Stylist Section */}
            <div className="form-section">
              <h3><FiStar /> Preferred Stylist</h3>
              <div className="stylist-section">
                {selectedStylist ? (
                  <div className="selected-stylist">
                    <div className="stylist-info">
                      {selectedStylist.photo ? (
                        <img src={selectedStylist.photo} alt={selectedStylist.full_name} />
                      ) : (
                        <div className="stylist-avatar">
                          {selectedStylist.full_name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4>{selectedStylist.full_name}</h4>
                        <p>{selectedStylist.title || 'Stylist'}</p>
                        <p className="stylist-experience">
                          {selectedStylist.experience_years} years experience
                        </p>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn-change-stylist"
                        onClick={() => setShowStylistModal(true)}
                      >
                        <FiEdit2 /> Change
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="no-stylist">
                    <p>No preferred stylist selected</p>
                    {isEditing && (
                      <button
                        type="button"
                        className="btn-select-stylist"
                        onClick={() => setShowStylistModal(true)}
                      >
                        <FiStar /> Select a Stylist
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Health & Notes Section */}
            <div className="form-section">
              <h3><FiHeart /> Health Information</h3>
              <div className="form-group">
                <label htmlFor="allergies">Allergies & Sensitivities</label>
                <textarea
                  id="allergies"
                  rows="3"
                  disabled={!isEditing}
                  placeholder="List any allergies, skin sensitivities, or medical conditions our stylists should know about"
                  {...register('allergies')}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  rows="2"
                  disabled={!isEditing}
                  placeholder="Any additional preferences or notes for our team"
                  {...register('notes')}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              {isEditing ? (
                <>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                    disabled={isLoading}
                  >
                    <FiX /> Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      'Saving...'
                    ) : (
                      <>
                        <FiSave /> Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <FiEdit2 /> Edit Profile
                </button>
              )}
            </div>
          </form>

          {/* Stylist Selection Modal */}
          {showStylistModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Select Your Preferred Stylist</h3>
                  <button 
                    className="modal-close" 
                    onClick={() => setShowStylistModal(false)}
                  >
                    <FiX />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="stylist-grid">
                    {Array.isArray(staffMembers) && staffMembers.map(stylist => (
                      <div 
                        key={stylist.id}
                        className={`stylist-card ${selectedStylist?.id === stylist.id ? 'selected' : ''}`}
                        onClick={() => handleStylistSelect(stylist)}
                      >
                        {stylist.photo ? (
                          <img src={stylist.photo} alt={stylist.full_name} />
                        ) : (
                          <div className="stylist-avatar-large">
                            {stylist.full_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="stylist-card-info">
                          <h4>{stylist.full_name}</h4>
                          <p className="stylist-title">{stylist.title || 'Stylist'}</p>
                          <p className="stylist-experience">
                            {stylist.experience_years} years experience
                          </p>
                          {stylist.bio && (
                            <p className="stylist-bio">{stylist.bio.substring(0, 100)}...</p>
                          )}
                          {selectedStylist?.id === stylist.id && (
                            <div className="selected-badge">
                              <FiCheck /> Selected
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setShowStylistModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;