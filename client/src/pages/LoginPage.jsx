import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  // Customer State
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);

  // Admin State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const { login, adminLogin } = useAuth();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Handle Customer Sign In
  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!customerEmail || !customerPassword) {
      error('Please enter your customer email and password');
      return;
    }

    setCustomerLoading(true);
    try {
      const data = await login(customerEmail.trim(), customerPassword.trim());
      success(`Welcome back, ${data.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setCustomerLoading(false);
    }
  };

  // Handle Admin Sign In
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      error('Please enter administrator credentials');
      return;
    }

    setAdminLoading(true);
    try {
      const data = await adminLogin(adminEmail.trim(), adminPassword.trim());
      success(`Administrative access granted. Welcome, ${data.user.name}!`);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      error(err.message || 'Administrative login failed');
    } finally {
      setAdminLoading(false);
    }
  };

  // Demo helpers
  const fillCustomerDemo = () => {
    setCustomerEmail('user@pizzanest.com');
    setCustomerPassword('User@123456');
    info('Filled Demo Customer credentials');
  };

  const fillAdminDemo = () => {
    setAdminEmail('sparshchauhan050@gmail.com');
    setAdminPassword('Sp@080806');
    info('Filled Demo Administrator credentials');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        background: '#FFFDF9',
      }}
    >
      <div style={{ width: '100%', maxWidth: '960px' }}>
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
              fontSize: '2.3rem',
              fontWeight: '900',
              color: '#1F2937',
              marginBottom: '0.4rem',
            }}
          >
            Sign In to PizzaNest
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
            Choose your account portal to access customer ordering or kitchen operations
          </p>
        </div>

        {/* 2-Column Grid: Customer vs Admin */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2rem',
            alignItems: 'stretch',
          }}
        >
          {/* COLUMN 1: CUSTOMER LOGIN */}
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E5E7EB',
              borderRadius: 'var(--radius-xl)',
              padding: '2.25rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#F0FDF4',
                    border: '1.5px solid #DCFCE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1E3F20',
                  }}
                >
                  <User size={22} />
                </div>
                <div>
                  <span
                    style={{
                      background: '#F0FDF4',
                      color: '#166534',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                    }}
                  >
                    CUSTOMER PORTAL
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1F2937', marginTop: '0.15rem' }}>
                    Customer Sign In
                  </h3>
                </div>
              </div>

              <form onSubmit={handleCustomerSubmit} autoComplete="off">
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@pizzanest.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Password</label>
                    <Link
                      to="/forgot-password"
                      style={{ fontSize: '0.78rem', color: '#C8102E', fontWeight: '700' }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input
                      type={showCustomerPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={customerPassword}
                      onChange={(e) => setCustomerPassword(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                      }}
                    >
                      {showCustomerPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={customerLoading}
                  className="btn btn-green"
                  style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem' }}
                >
                  {customerLoading ? 'Authenticating...' : 'Sign In as Customer'}
                  {!customerLoading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>

            {/* Bottom Customer Links & Demo Helper */}
            <div style={{ marginTop: '1.75rem', borderTop: '1px solid #F3F4F6', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.84rem', color: '#6B7280' }}>
                  New here?{' '}
                  <Link to="/register" style={{ color: '#1E3F20', fontWeight: '800' }}>
                    Register
                  </Link>
                </span>

                <button
                  type="button"
                  onClick={fillCustomerDemo}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#4B5563',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Zap size={12} color="#16A34A" />
                  <span>Demo User Fill</span>
                </button>
              </div>
            </div>
          </div>

          {/* COLUMN 2: ADMINISTRATOR LOGIN */}
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(200, 16, 46, 0.25)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.25rem',
              boxShadow: '0 8px 24px rgba(200, 16, 46, 0.06)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: '#FFF0F2',
                    border: '1.5px solid rgba(200, 16, 46, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C8102E',
                  }}
                >
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <span
                    style={{
                      background: '#FFF0F2',
                      color: '#C8102E',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                    }}
                  >
                    STAFF ONLY
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1F2937', marginTop: '0.15rem' }}>
                    Administrator Sign In
                  </h3>
                </div>
              </div>

              <form onSubmit={handleAdminSubmit} autoComplete="off">
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label">Admin Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@pizzanest.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '40px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.4rem' }}>
                  <label className="form-label">Master Admin Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '40px', paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                      }}
                    >
                      {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem' }}
                >
                  {adminLoading ? 'Verifying Admin...' : 'Access Admin Dashboard'}
                  {!adminLoading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>

            {/* Bottom Admin Links & Demo Helper */}
            <div style={{ marginTop: '1.75rem', borderTop: '1px solid #F3F4F6', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                  Kitchen & inventory control
                </span>

                <button
                  type="button"
                  onClick={fillAdminDemo}
                  style={{
                    background: '#FFF0F2',
                    border: '1px solid rgba(200, 16, 46, 0.2)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#C8102E',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Zap size={12} color="#C8102E" />
                  <span>Demo Admin Fill</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
