import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    taglineTop: 'BETTER INGREDIENTS',
    taglineBottom: 'BETTER PIZZA',
    subtext: 'Crafted with 100% fresh natural dough, vine-ripened tomatoes & pure mozzarella.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&auto=format&fit=crop&q=85',
    ctaLink: '/dashboard',
    ctaText: 'Order Now',
    bgColor: '#1E3F20',
  },
  {
    id: 2,
    taglineTop: 'NON-VEG CARNIVORE',
    taglineBottom: 'PEPPERONI FEAST',
    subtext: 'Loaded with spiced pepperoni, peri-peri chicken, and molten cheese burst crust.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1400&auto=format&fit=crop&q=85',
    ctaLink: '/dashboard?category=Non-Veg',
    ctaText: 'Explore Meats',
    bgColor: '#C8102E',
  },
  {
    id: 3,
    taglineTop: 'CHEF SIGNATURE',
    taglineBottom: 'GOURMET SPECIALTY PIZZAS',
    subtext: 'Handcrafted artisan pizzas slow-baked with authentic ingredients and signature sauces.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1400&auto=format&fit=crop&q=85',
    ctaLink: '/dashboard',
    ctaText: 'Order Now',
    bgColor: '#7C2D12',
  },
  {
    id: 4,
    taglineTop: 'WEEKEND SPECIAL',
    taglineBottom: 'BUY 1 GET 1 FREE',
    subtext: 'Enjoy gourmet hand-tossed pizzas with signature garlic dipping sauce.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&auto=format&fit=crop&q=85',
    ctaLink: '/#deals',
    ctaText: 'Claim Offer',
    bgColor: '#047857',
  },
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevIndex = (currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
  const nextIndex = (currentSlide + 1) % HERO_SLIDES.length;

  return (
    <section
      style={{
        position: 'relative',
        padding: '1.5rem 0 2rem',
        background: '#FFFDF9',
        overflow: 'hidden',
      }}
    >
      {/* Slider Carousel Container with Side Previews */}
      <div
        style={{
          position: 'relative',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            position: 'relative',
          }}
        >
          {/* Left Preview Slide (Peek) */}
          <div
            onClick={handlePrev}
            style={{
              flex: '0 0 160px',
              height: '320px',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              opacity: 0.6,
              transform: 'scale(0.88)',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              display: 'none',
              transition: 'all 0.4s ease',
            }}
            className="hero-peek-slide"
          >
            <img
              src={HERO_SLIDES[prevIndex].image}
              alt="Previous Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Center Main Hero Banner */}
          <div
            style={{
              flex: '1',
              maxWidth: '1080px',
              height: '340px',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 36px rgba(0, 0, 0, 0.14)',
            }}
          >
            <img
              src={HERO_SLIDES[currentSlide].image}
              alt={HERO_SLIDES[currentSlide].taglineTop}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.8s ease',
              }}
            />

            {/* Gradient Overlay for Text Readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                padding: '2.5rem 3rem',
              }}
            >
              <div style={{ maxWidth: '540px' }}>
                <h1
                  style={{
                    fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                    fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                    lineHeight: 0.98,
                    letterSpacing: '0.5px',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    textShadow: '0 3px 12px rgba(0, 0, 0, 0.6)',
                    marginBottom: '0.8rem',
                  }}
                >
                  {HERO_SLIDES[currentSlide].taglineTop} <br />
                  {HERO_SLIDES[currentSlide].taglineBottom}
                </h1>

                <p
                  style={{
                    color: '#F3F4F6',
                    fontSize: 'clamp(0.85rem, 1.3vw, 1rem)',
                    lineHeight: 1.45,
                    marginBottom: '1.5rem',
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {HERO_SLIDES[currentSlide].subtext}
                </p>

                <Link
                  to={HERO_SLIDES[currentSlide].ctaLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#C8102E',
                    color: '#FFFFFF',
                    fontWeight: '900',
                    fontSize: '0.95rem',
                    padding: '0.65rem 1.6rem',
                    borderRadius: 'var(--radius-full)',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(200, 16, 46, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#A00C24';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#C8102E';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>{HERO_SLIDES[currentSlide].ctaText}</span>
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            {/* Left Nav Arrow */}
            <button
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F2937',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#F9FAFB';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
              aria-label="Previous Hero Slide"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Right Nav Arrow */}
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1F2937',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#F9FAFB';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
              aria-label="Next Hero Slide"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Right Preview Slide (Peek) */}
          <div
            onClick={handleNext}
            style={{
              flex: '0 0 160px',
              height: '320px',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              opacity: 0.6,
              transform: 'scale(0.88)',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              display: 'none',
              transition: 'all 0.4s ease',
            }}
            className="hero-peek-slide"
          >
            <img
              src={HERO_SLIDES[nextIndex].image}
              alt="Next Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Dark Green Pagination Dots (Papa John's style) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1.25rem',
          }}
        >
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                height: '8px',
                width: idx === currentSlide ? '24px' : '8px',
                borderRadius: '4px',
                background: idx === currentSlide ? '#1E3F20' : '#D1D5DB',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: 0,
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .hero-peek-slide {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
};
