import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculatePasswordStrength(formData.password);

  const getStrengthLabel = () => {
    if (!formData.password) return '';
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password.trim(),
      });
      success(`Welcome to PizzaNest, ${data.user.name}! Your account is ready.`);
      navigate('/dashboard');
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
          maxWidth: '430px',
          padding: '2rem 2.25rem',
          background: '#FFFFFF',
          border: '1.5px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#1F2937', marginBottom: '0.25rem' }}>
            Create Your Account
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.88rem' }}>
            Join PizzaNest for fresh, hot, and delicious gourmet pizzas
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true">
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="text"
                name="name"
                className="form-input"
                style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                autoComplete="off"
                data-lpignore="true"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="email"
                name="email"
                className="form-input"
                style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
                placeholder="name@domain.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                data-lpignore="true"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Phone Number (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="tel"
                name="phone"
                className="form-input"
                style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="off"
                data-lpignore="true"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '0.92rem' }}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
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

            {/* Password Strength Meter */}
            {formData.password && (
              <div style={{ marginTop: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                  <span style={{ color: '#9CA3AF' }}>Strength</span>
                  <span
                    style={{
                      fontWeight: '800',
                      color: strength >= 3 ? 'var(--accent-green)' : strength === 2 ? '#D97706' : '#DC2626',
                    }}
                  >
                    {getStrengthLabel()}
                  </span>
                </div>
                <div style={{ height: '4px', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden', display: 'flex', gap: '3px' }}>
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        background:
                          step <= strength
                            ? strength >= 3
                              ? 'var(--accent-green)'
                              : strength === 2
                              ? '#D97706'
                              : '#DC2626'
                            : 'transparent',
                        transition: 'background 0.3s',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: '1.4rem' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Confirm Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input"
                style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                data-lpignore="true"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
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
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
