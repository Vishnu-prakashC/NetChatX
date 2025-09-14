import React, { useState } from 'react';
import './Components.css';
import api, { login as apiLogin, register as apiRegister, setAuthToken } from '../api';
import { reconnectSocket } from '../socket';

const LoginForm = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const payload = {
          username: formData.name || formData.email.split('@')[0],
          email: formData.email,
          password: formData.password,
          displayName: formData.name || undefined,
        };
        const result = await apiRegister(payload);
        const { user, token } = result || {};
        if (token) setAuthToken(token);
        const userData = {
          id: user?.id,
          name: user?.displayName || user?.username,
          email: user?.email,
          avatar: (user?.displayName || user?.username || 'U').charAt(0).toUpperCase(),
          token,
        };
        onLogin(userData);
        reconnectSocket();
      } else {
        const result = await apiLogin(formData.email || '', formData.password || '');
        const { user, token } = result || {};
        if (token) setAuthToken(token);
        const userData = {
          id: user?.id,
          name: user?.displayName || user?.username,
          email: user?.email,
          avatar: (user?.displayName || user?.username || 'U').charAt(0).toUpperCase(),
          token,
        };
        onLogin(userData);
        reconnectSocket();
      }
    } catch (err) {
      alert(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
        <p>{isSignUp ? 'Join our chat community' : 'Sign in to continue chatting'}</p>
        
        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required={isSignUp}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Loading...↻' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 