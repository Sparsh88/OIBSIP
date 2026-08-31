import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Pizza,
  Tag,
  Boxes,
  ShieldCheck,
} from 'lucide-react';

export const AdminNav = ({ title = 'Kitchen Command Center', subtitle = 'Real-time operations & menu management' }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const NAV_ITEMS = [
    {
      to: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: currentPath === '/admin/dashboard',
    },
    {
      to: '/admin/orders',
      label: 'Live Orders',
      icon: ShoppingBag,
      active: currentPath === '/admin/orders',
    },
    {
      to: '/admin/menu',
      label: 'Menu Items',
      icon: Pizza,
      active: currentPath === '/admin/menu',
    },
    {
      to: '/admin/coupons',
      label: 'Coupons & Deals',
      icon: Tag,
      active: currentPath === '/admin/coupons',
    },
    {
      to: '/admin/inventory',
      label: 'Stock Inventory',
      icon: Boxes,
      active: currentPath === '/admin/inventory',
    },
  ];

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#1F2937' }}>
              {title}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: '#FFF0F2',
                color: '#C8102E',
                border: '1px solid rgba(200, 16, 46, 0.2)',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '800',
              }}
            >
              <ShieldCheck size={13} />
              ADMIN PORTAL
            </span>
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>{subtitle}</p>
        </div>
      </div>

      {/* Navigation Pills Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.15rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: '800',
                fontSize: '0.88rem',
                textDecoration: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap',
                background: isActive ? '#1E3F20' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#4B5563',
                border: '1.5px solid',
                borderColor: isActive ? '#1E3F20' : '#E5E7EB',
                boxShadow: isActive ? '0 4px 12px rgba(30, 63, 32, 0.25)' : '0 1px 3px rgba(0,0,0,0.04)',
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#C8102E';
                  e.currentTarget.style.color = '#C8102E';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#4B5563';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Icon size={16} color={isActive ? '#FFFFFF' : 'currentColor'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
