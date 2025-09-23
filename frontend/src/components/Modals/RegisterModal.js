import React, { useState } from 'react';
import ModalBase from './ModalBase';
import { useModal } from '../../hooks/useModal';
import { useApi } from '../../hooks/useApi';
import Button from '../common/Button';

function RegisterModal() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password_hash: '',
    first_name: '',
    last_name: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const { isModalOpen, closeModal, openModal } = useModal();
  const { makeApiRequest } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      await makeApiRequest('POST', '/users/register', formData);
      setMessage({ text: 'Registration successful! Please log in.', type: 'success' });
      setFormData({
        username: '',
        email: '',
        password_hash: '',
        first_name: '',
        last_name: ''
      });
      setTimeout(() => {
        closeModal('register');
        openModal('login');
      }, 1500);
    } catch (error) {
      setMessage({ text: `Registration failed: ${error.message}`, type: 'error' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <ModalBase isOpen={isModalOpen('register')} onClose={() => closeModal('register')}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password_hash">Password:</label>
          <input
            type="password"
            name="password_hash"
            value={formData.password_hash}
            onChange={handleChange}
            required
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
        <Button type="submit" className="btn-primary">Register</Button>
        {message.text && (
          <p className={`form-message ${message.type}`}>{message.text}</p>
        )}
      </form>
    </ModalBase>
  );
}

export default RegisterModal;