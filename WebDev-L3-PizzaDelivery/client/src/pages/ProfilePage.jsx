import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
      });
      success('Profile updated successfully!');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1F2937' }}>My Account Profile</h1>
        <p style={{ color: '#6B7280' }}>
          Manage your personal details and default delivery address.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem',
          alignItems: 'flex-start',
        }}
      >
        {/* Left Profile Overview Card */}
        <div
          className="card"
          style={{
            padding: '2rem',
            textAlign: 'center',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #C8102E 0%, #E25822 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '900',
              color: '#fff',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 14px var(--primary-glow)',
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1F2937' }}>{user?.name}</h3>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1rem' }}>{user?.email}</p>

          <span className={`badge ${user?.role === 'admin' ? 'badge-special' : 'badge-veg'}`}>
            Role: {user?.role?.toUpperCase()}
          </span>
        </div>

        {/* Edit Form */}
        <div
          className="card"
          style={{
            padding: '2rem',
            flex: 1,
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <form onSubmit={handleSubmit} autoComplete="off">
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: '800',
                color: '#1F2937',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #F3F4F6',
                paddingBottom: '0.75rem',
              }}
            >
              Personal & Address Information
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Zip Code / Pincode</label>
              <input
                type="text"
                className="form-input"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
              disabled={saving}
            >
              <Save size={18} />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
