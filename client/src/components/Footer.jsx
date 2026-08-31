import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, MapPin, Phone, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      id="about"
      style={{
        background: '#FFFFFF',
        color: '#1F2937',
        borderTop: '2px solid #C8102E',
        paddingTop: '2rem',
        paddingBottom: '1.25rem',
        marginTop: 'auto',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.02)',
      }}
    >
      <div style={{ width: '100%', padding: '0 2.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.75rem',
            marginBottom: '1.75rem',
          }}
        >
          {/* Brand Column */}
          <div>
            <div style={{ marginBottom: '0.6rem' }}>
              <span
                style={{
                  fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                  fontSize: '1.35rem',
                  fontWeight: '900',
                  color: '#C8102E',
                  letterSpacing: '0.3px',
                }}
              >
                PIZZANEST
              </span>
            </div>
            <p
              style={{
                fontSize: '0.8rem',
                color: '#6B7280',
                lineHeight: 1.5,
                marginBottom: '0.75rem',
              }}
            >
              Better Ingredients. Better Pizza. Handcrafted daily with fresh dough, vine-ripened tomatoes, and 100% real mozzarella.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#1E3F20', fontWeight: '700' }}>
              <Shield size={14} color="#1E3F20" />
              <span>100% Secure Razorpay Checkout</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{
                fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                fontSize: '0.95rem',
                fontWeight: '900',
                marginBottom: '0.75rem',
                color: '#1F2937',
              }}
            >
              Explore Menu
            </h4>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                fontSize: '0.82rem',
                color: '#4B5563',
              }}
            >
              <li>
                <Link to="/dashboard" style={{ color: '#4B5563', fontWeight: '600', textDecoration: 'none' }}>
                  Full Pizza Catalog
                </Link>
              </li>
              <li>
                <Link to="/dashboard?category=Protein%20Packed" style={{ color: '#C8102E', fontWeight: '700', textDecoration: 'none' }}>
                  🍗 Protein Packed Bites
                </Link>
              </li>
              <li>
                <Link to="/dashboard?category=Beverages" style={{ color: '#4B5563', fontWeight: '600', textDecoration: 'none' }}>
                  🥤 Cold Beverages
                </Link>
              </li>
              <li>
                <Link to="/dashboard?category=Desserts" style={{ color: '#4B5563', fontWeight: '600', textDecoration: 'none' }}>
                  🍰 Choco Lava Cake
                </Link>
              </li>
              <li>
                <Link to="/orders" style={{ color: '#4B5563', fontWeight: '600', textDecoration: 'none' }}>
                  Live Order Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Kitchen Schedule */}
          <div>
            <h4
              style={{
                fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                fontSize: '0.95rem',
                fontWeight: '900',
                marginBottom: '0.75rem',
                color: '#1F2937',
              }}
            >
              Kitchen Schedule
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#4B5563',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} color="#C8102E" />
                <span style={{ color: '#374151', fontWeight: '600' }}>Mon – Thu: 11:00 AM – 11:00 PM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={14} color="#C8102E" />
                <span style={{ color: '#374151', fontWeight: '600' }}>Fri – Sun: 11:00 AM – 01:00 AM</span>
              </div>
              <div
                style={{
                  marginTop: '0.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  color: '#166534',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  width: 'fit-content',
                }}
              >
                ● Kitchen Live
              </div>
            </div>
          </div>

          {/* Contact Hotline */}
          <div id="contact">
            <h4
              style={{
                fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                fontSize: '0.95rem',
                fontWeight: '900',
                marginBottom: '0.75rem',
                color: '#1F2937',
              }}
            >
              Contact
            </h4>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#4B5563',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} color="#C8102E" />
                <span style={{ color: '#374151', fontWeight: '600' }}>Cyber City Hub, Gourmet Kitchen</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={14} color="#1E3F20" />
                <span style={{ color: '#1E3F20', fontWeight: '800' }}>+91 (800) PIZZA-NEST</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} color="#C8102E" />
                <span style={{ color: '#374151', fontWeight: '600' }}>support@pizzanest.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div
          style={{
            borderTop: '1px solid #E5E7EB',
            paddingTop: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: '#6B7280',
          }}
        >
          <p>
            &copy; {new Date().getFullYear()} PizzaNest Artisan Kitchen. Crafted by{' '}
            <strong style={{ color: '#1F2937' }}>Sparsh Chauhan</strong> for Oasis Infobyte.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', fontWeight: '600' }}>
            <span style={{ cursor: 'pointer', color: '#6B7280' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer', color: '#6B7280' }}>Terms of Service</span>
            <Link to="/admin/login" style={{ color: '#9CA3AF', textDecoration: 'none' }}>
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
