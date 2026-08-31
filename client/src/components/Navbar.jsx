import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Shield,
  MapPin,
  Clock,
  ChevronDown,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const locations = [
    'Cyber City, Hub 1',
    'Bandra West, Mumbai',
    'Indiranagar, Bengaluru',
    'Connaught Place, New Delhi',
    'Jubilee Hills, Hyderabad',
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: isScrolled
          ? '0 4px 20px rgba(0, 0, 0, 0.06)'
          : '0 1px 3px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.25s ease-in-out',
      }}
    >
      <div
        style={{
          width: '100%',
          padding: '0 2.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          height: isScrolled ? '64px' : '72px',
          transition: 'height 0.25s ease-in-out',
        }}
      >
        {/* 1. LEFT: MENU HAMBURGER & BRAND WORDMARK */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1F2937',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
            }}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <MenuIcon size={26} />}
          </button>

          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
            }}
          >
            <span
              style={{
                fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                fontSize: '1.9rem',
                fontWeight: '900',
                letterSpacing: '-0.5px',
                color: '#C8102E',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              PIZZANEST
            </span>
          </Link>
        </div>

        {/* 2. CENTER: LOCATION SELECTOR PILL WITH PLACEHOLDER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#FFFFFF',
            border: '1.5px solid #E5E7EB',
            borderRadius: 'var(--radius-full)',
            padding: '0.35rem 1rem',
            gap: '0.85rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            position: 'relative',
          }}
          className="desktop-nav"
        >
          {/* Location Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              paddingRight: '0.85rem',
              borderRight: '1.5px solid #E5E7EB',
            }}
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <MapPin size={16} color="#C8102E" />
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: selectedLocation ? '800' : '600',
                color: selectedLocation ? '#1F2937' : '#6B7280',
              }}
            >
              {selectedLocation || 'Select Delivery Location'}
            </span>
            <ChevronDown size={14} color="#9CA3AF" />
          </div>

          {/* Location Dropdown Modal */}
          {showLocationDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                left: 0,
                width: '260px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.5rem',
                zIndex: 200,
              }}
            >
              <p
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: '#9CA3AF',
                  padding: '0.4rem 0.6rem',
                  textTransform: 'uppercase',
                }}
              >
                Select Delivery Location
              </p>
              {locations.map((loc) => (
                <div
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocationDropdown(false);
                  }}
                  style={{
                    padding: '0.5rem 0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: selectedLocation === loc ? '800' : '500',
                    color: selectedLocation === loc ? '#C8102E' : '#1F2937',
                    background: selectedLocation === loc ? '#FFF0F2' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  {loc}
                </div>
              ))}
            </div>
          )}

          {/* Order Now Time Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Clock size={16} color="#6B7280" />
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#6B7280' }}>
              Order Now (25 Mins)
            </span>
          </div>
        </div>

        {/* 3. RIGHT: ACTIONS & SIGN IN BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>

          {/* Cart Icon with Red Badge */}
          <Link
            to="/cart"
            style={{
              position: 'relative',
              color: '#1F2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              transition: 'all var(--transition-fast)',
            }}
            title="Shopping Cart"
          >
            <ShoppingBag size={19} />
            {totalItemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: '#C8102E',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  borderRadius: '50%',
                  width: '19px',
                  height: '19px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(200, 16, 46, 0.4)',
                }}
              >
                {totalItemCount}
              </span>
            )}
          </Link>

          {/* Admin Operations Shield */}
          <Link
            to={isAdmin ? '/admin/dashboard' : '/admin/login'}
            style={{
              color: isAdmin ? '#C8102E' : '#6B7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: isAdmin ? '#FFF0F2' : '#F9FAFB',
              border: `1px solid ${isAdmin ? '#C8102E' : '#E5E7EB'}`,
            }}
            title="Admin Operations Portal"
          >
            <Shield size={18} />
          </Link>

          {/* Deep Forest Green Rounded Button (Papa John's Sign Up Style) */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#1E3F20',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#C8102E',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span
                  style={{
                    maxWidth: '85px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    width: '220px',
                    background: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    zIndex: 200,
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderBottom: '1px solid #F3F4F6',
                    }}
                  >
                    <p style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1F2937' }}>
                      {user?.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {user?.email}
                    </p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#C8102E',
                        fontWeight: '700',
                      }}
                    >
                      <Shield size={16} />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#1F2937',
                    }}
                  >
                    <User size={16} />
                    My Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#1F2937',
                    }}
                  >
                    <Clock size={16} />
                    Order History
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.55rem 0.75rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: '#DC2626',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      fontWeight: '700',
                    }}
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                background: '#1E3F20',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '0.9rem',
                padding: '0.55rem 1.4rem',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(30, 63, 32, 0.25)',
                transition: 'all var(--transition-fast)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#152C16';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#1E3F20';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', fontWeight: '800', color: '#1F2937' }}
          >
            🏠 Home
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', fontWeight: '800', color: '#1F2937' }}
          >
            🍕 Menu Catalog
          </Link>
          <a
            href="/#deals"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1rem', fontWeight: '800', color: '#1E3F20' }}
          >
            🎁 PizzaNest Rewards & Deals
          </a>
          {isAuthenticated && (
            <Link
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '1rem', fontWeight: '800', color: '#1F2937' }}
            >
              🕒 My Orders & Tracking
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
