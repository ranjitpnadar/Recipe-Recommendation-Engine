import React, { useState, useEffect } from 'react';
import ModalBase from './ModalBase';
import { useModal } from '../../hooks/useModal';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

function ProfileModal() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    profile_picture_url: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  
  const { isModalOpen, closeModal } = useModal();
  const { makeApiRequest } = useApi();
  const { userId, updateProfile } = useAuth();

  const loadUserProfile = async () => {
    if (!userId) {
      setMessage({ text: 'User ID not found. Please log in again.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const user = await makeApiRequest('GET', `/users/${userId}`, null, true);
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        profile_picture_url: user.profile_picture_url || ''
      });
      setMessage({ text: '', type: '' });
    } catch (error) {
      setMessage({ text: `Failed to load profile: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen('profile')) {
      loadUserProfile();
    }
  }, [isModalOpen('profile'), userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    const updateData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      profile_picture_url: formData.profile_picture_url
    };

    try {
      await makeApiRequest('PUT', '/users/profile', updateData, true);
      updateProfile(formData);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: `Profile update failed: ${error.message}`, type: 'error' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    closeModal('profile');
    setMessage({ text: '', type: '' });
  };

  return (
    <ModalBase isOpen={isModalOpen('profile')} onClose={handleClose}>
      <h2>User Profile</h2>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading profile...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="first_name">First Name:</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="last_name">Last Name:</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="profile_picture_url">Profile Picture URL:</label>
            <input
              type="url"
              name="profile_picture_url"
              value={formData.profile_picture_url}
              onChange={handleChange}
            />
          </div>

          {formData.profile_picture_url && (
            <div style={{ marginBottom: '15px', textAlign: 'center' }}>
              <img
                src={formData.profile_picture_url}
                alt="Profile Preview"
                style={{
                  maxWidth: '150px',
                  maxHeight: '150px',
                  borderRadius: '50%',
                  border: '2px solid #ddd'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <Button type="submit" className="btn-primary">Update Profile</Button>
          
          {message.text && (
            <p className={`form-message ${message.type}`}>{message.text}</p>
          )}
        </form>
      )}
    </ModalBase>
  );
}

export default ProfileModal;