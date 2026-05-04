import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookText, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

/**
 * Stitch Login Page - Replicated exactly as per Stitch "Sanctuary" UI.
 * Features a perfectly centered card, full-width inputs, and removed SSO.
 */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, {
        id: response.data.id,
        email: response.data.email,
        displayName: response.data.displayName
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-6 font-sans">
      {/* MAIN CARD CONTAINER: Fixed width 400px */}
      <div className="w-full max-w-[400px] bg-white p-8 sm:p-10 rounded-[20px] shadow-subtle border border-outline/10">
        
        {/* HEADER SECTION: Centered */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-elevated mb-6">
            <BookText className="w-7 h-7" />
          </div>
          <h1 className="text-[28px] font-bold text-on-surface tracking-tight leading-none">Sanctuary</h1>
          <p className="text-[15px] text-on-surface-variant mt-3 font-medium">
            Return to your digital thoughts.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl flex items-start gap-3 text-sm border border-rose-100">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* FORM FIELDS: Full Width */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-on-surface-variant/50 tracking-widest uppercase px-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-surface-variant/30 text-on-surface px-5 rounded-xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium"
              placeholder="name@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-black text-on-surface-variant/50 tracking-widest uppercase">Password</label>
              <button type="button" className="text-[11px] font-bold text-primary hover:underline">Forgot?</button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-surface-variant/30 text-on-surface px-5 rounded-xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center gap-3 px-1">
            <div className="w-5 h-5 rounded border border-outline flex items-center justify-center cursor-pointer hover:border-primary transition-all">
              <div className="w-3 h-3 rounded-sm bg-primary opacity-0 group-hover:opacity-100" />
            </div>
            <span className="text-sm text-on-surface-variant font-medium">Remember me for 30 days</span>
          </div>

          {/* PRIMARY BUTTON: Full Width */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-sm hover:shadow-elevated active:scale-[0.98] disabled:opacity-70 transition-all mt-4"
          >
            {isLoading ? 'Entering...' : 'Sign In'}
          </button>
        </form>

        {/* FOOTER: Centered */}
        <div className="mt-10 text-center text-sm font-medium text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
