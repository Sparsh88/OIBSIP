import React from 'react';
import { CheckCircle2, Flame, Bike, Home, Clock, AlertCircle } from 'lucide-react';

export const OrderStatusTracker = ({ currentStatus, statusHistory = [] }) => {
  const steps = [
    {
      id: 'Order Received',
      label: 'Order Received',
      desc: 'Order logged & queued in kitchen',
      icon: Clock,
    },
    {
      id: 'In Kitchen',
      label: 'In Kitchen',
      desc: 'Stone-fired oven baking in progress',
      icon: Flame,
    },
    {
      id: 'Sent to Delivery',
      label: 'Sent to Delivery',
      desc: 'Rider dispatched with thermal box',
      icon: Bike,
    },
    {
      id: 'Delivered',
      label: 'Delivered',
      desc: 'Hot & fresh at your doorstep',
      icon: Home,
    },
  ];

  if (currentStatus === 'Cancelled') {
    return (
      <div
        className="card"
        style={{
          background: '#FEF2F2',
          borderColor: '#FCA5A5',
          padding: '2rem',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#DC2626', fontSize: '1.4rem', fontWeight: '900', marginBottom: '0.5rem' }}>
          Order Cancelled
        </h3>
        <p style={{ color: '#4B5563' }}>
          This order has been cancelled. If any payment was deducted, it will be refunded to your source account.
        </p>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.id === currentStatus);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  const progressPercent = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div
      className="card"
      style={{
        padding: '2rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px solid #E5E7EB',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Live Kitchen Tracking
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1F2937', marginTop: '0.2rem' }}>
            Order Progress
          </h2>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--accent-green-light)',
            color: 'var(--accent-green)',
            padding: '0.4rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem',
            fontWeight: '800',
            border: '1px solid rgba(46, 125, 50, 0.2)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-green)',
              display: 'inline-block',
            }}
          />
          <span>Real-Time Sync Active</span>
        </div>
      </div>

      {/* Steps Line */}
      <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
        {/* Background Grey Line */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '5%',
            right: '5%',
            height: '4px',
            background: '#F3F4F6',
            zIndex: 1,
            borderRadius: '2px',
          }}
        />

        {/* Active Red Progress Line */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '5%',
            width: `${progressPercent * 0.9}%`,
            height: '4px',
            background: 'var(--primary)',
            zIndex: 2,
            transition: 'width 0.6s ease',
            borderRadius: '2px',
          }}
        />

        {/* Steps Nodes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            position: 'relative',
            zIndex: 3,
          }}
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: isCompleted
                      ? 'var(--accent-green)'
                      : isCurrent
                      ? 'var(--primary)'
                      : '#FFFFFF',
                    border: `3px solid ${
                      isCompleted ? 'var(--accent-green)' : isCurrent ? 'var(--primary)' : '#E5E7EB'
                    }`,
                    color: isCompleted || isCurrent ? '#FFFFFF' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? '0 4px 14px var(--primary-glow)' : '0 2px 6px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    marginBottom: '0.75rem',
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={22} /> : <Icon size={22} />}
                </div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: isCurrent ? 'var(--primary)' : '#1F2937' }}>
                  {step.label}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.2rem', maxWidth: '140px' }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
