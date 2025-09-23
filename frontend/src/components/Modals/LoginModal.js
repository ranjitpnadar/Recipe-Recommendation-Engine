import React, { useState } from 'react';
import ModalBase from './ModalBase';
import { useModal } from '../../hooks/useModal';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

function LoginModal() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const { isModalOpen, closeModal } = useModal();
  const { makeApiRequest } = useApi();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const data = await makeApiRequest('POST', '/auth/login', formData);
      login(data.token, data.user_id);
      setMessage({ text: 'Login successful!', type: 'success' });
      setFormData({ email: '', password: '' });
      setTimeout(() => closeModal('login'), 1000);
    } catch (error) {
      setMessage({ text: `Login failed: ${error.message}`, type: 'error' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <ModalBase isOpen={isModalOpen('login')} onClose={() => closeModal('login')}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" className="btn-primary">Login</Button>
        {message.text && (
          <p className={`form-message ${message.type}`}>{message.text}</p>
        )}
      </form>
    </ModalBase>
  );
}

export default LoginModal;