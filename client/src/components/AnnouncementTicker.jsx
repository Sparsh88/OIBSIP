import React from 'react';
import { Sparkles, Flame, ShieldCheck, Truck, Star } from 'lucide-react';

export const AnnouncementTicker = () => {
  const items = [
    { text: 'FREE DELIVERY ON ORDERS ABOVE ₹500', icon: '✦' },
    { text: '100% REAL ARTISANAL MOZZARELLA & INGREDIENTS', icon: '✦' },
    { text: '450°C STONE WOOD-FIRED PERFECTION', icon: '✦' },
    { text: 'LOVED BY 15,000+ FOOD ENTHUSIASTS', icon: '✦' },
    { text: 'LIVE REAL-TIME SOCKET.IO ORDER TRACKING', icon: '✦' },
    { text: 'ZERO CONTACT HYGIENIC PACKAGING', icon: '✦' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #059669 0%, #10B981 50%, #059669 100%)',
        color: '#FFFFFF',
        padding: '0.65rem 0',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: '2.5rem',
          animation: 'ticker-slide 30s linear infinite',
          fontWeight: '800',
          fontSize: '0.85rem',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
        }}
      >
        {[...items, ...items, ...items].map((item, idx) => (
          <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: '#FFD166', fontSize: '1rem' }}>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker-slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
};
