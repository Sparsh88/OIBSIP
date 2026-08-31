import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const data = await login(email.trim(), password.trim());
      if (data.user?.role === 'admin') {
        success(`Welcome to Admin Command Center, ${data.user.name}!`);
        navigate('/admin/dashboard', { replace: true });
      } else {
        success(`Welcome back, ${data.user.name}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        background: '#FFFDF9',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2rem 2.25rem',
          background: '#FFFFFF',
          border: '1.5px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #C8102E 0%, #E25822 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 0.75rem',
              boxShadow: '0 4px 14px var(--primary-glow)',
            }}
          >
            🍕
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#1F2937', marginBottom: '0.25rem' }}>
            Welcome Back
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.88rem' }}>
            Log in to order fresh pizza & track live deliveries
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true">
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="email"
                name="customer_login_email_field"
                className="form-input"
                style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                data-lpignore="true"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.4rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="customer_login_pwd_field"
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '0.92rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                data-lpignore="true"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            borderTop: '1px solid #F3F4F6',
            paddingTop: '1rem',
            fontSize: '0.85rem',
            color: '#6B7280',
          }}
        >
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '800' }}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
