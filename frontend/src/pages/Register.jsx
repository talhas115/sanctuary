import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookText, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 font-sans">
      <div className="w-full max-w-[480px] bg-surface-container-lowest p-12 rounded-2xl shadow-journal border border-outline-variant/10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
            <BookText className="w-6 h-6" />
          </div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Create Account</h1>
          <p className="text-on-surface-variant text-[16px] mt-2">Begin your digital sanctuary journey.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Display Name</label>
            <input
              type="text"
              name="displayName"
              required
              value={formData.displayName}
              onChange={handleChange}
              className="w-full bg-surface-container-low text-on-surface px-4 py-4 rounded-xl border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-surface-container-low text-on-surface px-4 py-4 rounded-xl border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-surface-container-low text-on-surface px-4 py-4 rounded-xl border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[12px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Confirm</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-surface-container-low text-on-surface px-4 py-4 rounded-xl border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-sm mt-4"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-10 text-center text-[14px] text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
