import React, { useState, useEffect } from 'react';

export const Preloader = () => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const duration = 1800; // 1.8 seconds smooth count
    const startTime = performance.now();

    const updateProgress = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Smooth easeOutCubic progression curve
      const easedProgress = Math.floor((1 - Math.pow(1 - progressRatio, 3)) * 100);
      setProgress(easedProgress);

      if (progressRatio < 1) {
        requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => setShouldRender(false), 750); // Cleanly unmount after slide-up curtain exit
        }, 200);
      }
    };

    requestAnimationFrame(updateProgress);
  }, []);

  if (!shouldRender) return null;

  const getStatusText = (val) => {
    if (val < 30) return `KNEADING 48-HOUR SOURDOUGH • ${val}%`;
    if (val < 65) return `HEATING VOLCANIC STONE OVEN TO 450°C • ${val}%`;
    if (val < 92) return `PREPARING FRESH ARTISANAL INGREDIENTS • ${val}%`;
    return `WELCOME TO PIZZANEST • 100%`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDone ? 0 : 1,
        transform: isDone ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.75s cubic-bezier(0.76, 0, 0.24, 1), opacity 0.75s ease-in-out',
        pointerEvents: isDone ? 'none' : 'all',
        userSelect: 'none',
      }}
    >
      {/* Center Luxury Monogram & Title */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '600px',
          padding: '0 2rem',
        }}
      >
        {/* Brand Name with Wide Luxury Letter Spacing */}
        <h1
          style={{
            fontFamily: '"Times New Roman", Times, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: '400',
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: '#000000',
            marginBottom: '0.4rem',
            marginLeft: '0.38em', // balances wide letter spacing
            lineHeight: 1.15,
          }}
        >
          PIZZANEST
        </h1>

        <h2
          style={{
            fontFamily: '"Times New Roman", Times, "Playfair Display", Georgia, serif',
            fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)',
            fontWeight: '300',
            letterSpacing: '0.45em',
            textTransform: 'uppercase',
            color: '#333333',
            marginBottom: '2rem',
            marginLeft: '0.45em',
          }}
        >
          ARTISAN KITCHEN
        </h2>

        {/* Thin Horizontal Glowing Progress Line */}
        <div
          style={{
            position: 'relative',
            width: '280px',
            height: '2px',
            background: '#E5E7EB',
            marginBottom: '1.5rem',
            overflow: 'hidden',
            borderRadius: '2px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #C8102E 0%, #E25822 100%)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        {/* Dynamic Status Text & Percentage */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.78rem',
            fontWeight: '700',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#6B7280',
            transition: 'color 0.3s ease',
          }}
        >
          {getStatusText(progress)}
        </p>
      </div>

      {/* Bottom Right Signature Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '28px',
          fontFamily: 'var(--font-body)',
          fontSize: '0.72rem',
          fontWeight: '700',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#9CA3AF',
        }}
      >
        SPARSH CHAUHAN &bull; OASIS INFOBYTE LEVEL 3
      </div>
    </div>
  );
};
