import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter admin credentials');
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(email.trim(), password.trim());
      success(`Administrative Access Granted. Welcome, ${data.user.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      error(err.message || 'Administrative login failed');
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
          border: '1.5px solid rgba(200, 16, 46, 0.25)',
          boxShadow: '0 10px 30px rgba(200, 16, 46, 0.08)',
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
              margin: '0 auto 0.75rem',
              boxShadow: '0 4px 14px var(--primary-glow)',
              color: '#FFFFFF',
            }}
          >
            <Shield size={24} />
          </div>
          <span
            className="badge badge-special"
            style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem', marginBottom: '0.35rem' }}
          >
            Restricted Admin Portal
          </span>
          <h2 style={{ fontSize: '1.55rem', fontWeight: '900', color: '#1F2937', marginTop: '0.2rem' }}>
            Admin Operations
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Kitchen dispatch, order management & inventory control
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true">
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="email"
                name="admin_secret_portal_email"
                className="form-input"
                style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
                placeholder="Enter authorized admin email"
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
              Admin Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="admin_secret_portal_key"
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '0.92rem' }}
                placeholder="Enter master password"
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
            style={{
              width: '100%',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: '800',
            }}
            disabled={loading}
          >
            {loading ? 'Verifying Credentials...' : 'Access Admin Dashboard'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link to="/login" style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: '700' }}>
            &larr; Switch to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
};
