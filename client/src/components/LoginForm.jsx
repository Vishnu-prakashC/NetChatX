import React, { useState } from 'react';
// Replace lucide-react icons with simple emoji or SVG inline icons to avoid missing dependency
 //import { Mail, Lock, User, MessageCircle } from 'lucide-react';
import './Components.css';
import api, { login as apiLogin, register as apiRegister, setAuthToken } from '../api';
import { reconnectSocket } from '../socket';

const LoginForm = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
      }

      if (isSignUp) {
        const payload = {
          username: (formData.name || formData.email.split('@')[0])
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .slice(0, 30),
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
      setError(err?.message || (isSignUp ? 'Registration failed. Please try again.' : 'Login failed. Please try again.'));
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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="bg-blue-500 p-3 rounded-full">
                {/* <MessageCircle className="w-8 h-8 text-white" /> */}
                <span role="img" aria-label="chat" className="text-white text-2xl">💬</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isSignUp ? 'Join BlueTalk' : 'BlueTalk'}
            </h1>
            <p className="text-gray-600">
              {isSignUp ? 'Create your account to get started' : 'Sign in to start chatting'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm animate-fade-in">
                {error}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-2 animate-slide-down">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  {/* <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">👤</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                {/* <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                {/* <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">🔒</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2 animate-slide-down">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  {/* <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5">🔒</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="text-center space-y-2">
            {!isSignUp && (
              <button className="text-sm text-blue-500 hover:text-blue-600 transition-colors">
                Forgot password?
              </button>
            )}
            <div className="text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleMode}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;