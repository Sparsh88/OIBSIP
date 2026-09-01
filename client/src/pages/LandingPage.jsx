import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
  ArrowRight,
  Star,
  CheckCircle2,
  ChevronRight,
  Gift,
  Plus,
} from 'lucide-react';
import API from '../services/api';
import { PizzaCard } from '../components/PizzaCard';
import { Loader } from '../components/Loader';
import { HeroSlider } from '../components/HeroSlider';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

// Papa John's India Style Categories
const MENU_CATEGORIES = [
  {
    name: 'Protein Packed',
    categoryFilter: 'Protein Packed',
    image: '/images/protein_packed.jpg',
  },
  {
    name: 'Pizzas',
    categoryFilter: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sides & Breads',
    categoryFilter: 'Sides',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'Beverages',
    categoryFilter: 'Beverages',
    image: '/images/coca_cola.jpg',
  },
  {
    name: 'Desserts',
    categoryFilter: 'Desserts',
    image: '/images/choco_lava.jpg',
  },
  {
    name: 'Extras & Dips',
    categoryFilter: 'Extras',
    image: '/images/special_garlic_sauce.jpg',
  },
];

// Papa John's Style Dual-Tone Split Favourite Cards
const FAVOURITES = [
  {
    id: 'fav-1',
    name: 'Super Papa Loaded Pepperoni',
    description: 'Italian sausage, smoked pepperoni, fresh mushrooms, green peppers & black olives.',
    price: 399,
    bgTone: '#7C1525', // Rich Crimson Maroon
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=700&auto=format&fit=crop&q=85',
    category: 'Non-Veg',
  },
  {
    id: 'fav-2',
    name: 'Garden Fresh Tuscan Special',
    description: 'Crisp green bell peppers, sun-ripened tomatoes, sweet corn & 100% pure whole-milk mozzarella.',
    price: 349,
    bgTone: '#1E3F20', // Forest Green
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=700&auto=format&fit=crop&q=85',
    category: 'Veg',
  },
];

const DEALS = [
  {
    id: 1,
    badge: 'WEEKEND SPECIAL',
    title: 'Buy 1 Get 1 FREE',
    subtitle: 'On any Medium or Large Gourmet Pizza',
    code: 'BOGO2026',
    accentColor: '#C8102E',
    bgColor: '#FFF5F5',
    buttonText: 'Order BOGO',
  },
  {
    id: 2,
    badge: 'SPECIAL GOURMET OFFER',
    title: 'Flat 30% OFF',
    subtitle: 'On Gourmet Artisan Crust Pizzas',
    code: 'CUSTOM30',
    accentColor: '#E25822',
    bgColor: '#FFF7ED',
    buttonText: 'Claim 30% OFF',
  },
  {
    id: 3,
    badge: 'PARTY FEAST COMBO',
    title: 'Feast Deal @ ₹499',
    subtitle: '2 Medium Pizzas + Cheesy Dip + 2 Cokes',
    code: 'FEAST499',
    accentColor: '#1E3F20',
    bgColor: '#F0FDF4',
    buttonText: 'Claim Combo',
  },
  {
    id: 4,
    badge: 'WELCOME BONUS',
    title: 'Free Garlic Breadsticks',
    subtitle: 'On your very first online delivery order',
    code: 'FREEBREAD',
    accentColor: '#D97706',
    bgColor: '#FFFBEB',
    buttonText: 'Order First Meal',
  },
];

export const LandingPage = () => {
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, applyCoupon } = useCart();
  const { success } = useToast();

  const handleApplyDeal = (deal) => {
    const res = applyCoupon(deal.code);
    if (res.success) {
      success(res.message);
    }
    navigate('/dashboard');
  };

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const data = await API.get('/pizzas');
        setFeaturedPizzas(data.pizzas?.slice(0, 4) || []);
      } catch (err) {
        console.error('Failed to load pizzas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, []);

  const handleQuickAddFavourite = (fav) => {
    addToCart({
      name: fav.name,
      image: fav.image,
      customBase: 'Classic Hand Tossed',
      customSauce: 'Classic Tomato Basil',
      customCheese: 'Mozzarella',
      customVeggies: [],
      unitPrice: fav.price,
      quantity: 1,
    });
    success(`Added ${fav.name} to cart!`);
  };

  return (
    <div className="pizzanest-watermark-bg">
      {/* 1. PAPA JOHN'S MULTI-SLIDE HERO BANNER */}
      <HeroSlider />

      {/* 2. EXPLORE OUR MENU (SQUIRCLE CATEGORIES ROW) */}
      <section style={{ padding: '2.5rem 0 3.5rem' }}>
        <div className="max-w-7xl">
          {/* Section Heading */}
          <ScrollReveal direction="up" distance={30} duration={0.6}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2
                style={{
                  fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                  fontSize: '2rem',
                  fontWeight: '900',
                  letterSpacing: '0.2px',
                  color: '#1F2937',
                  textTransform: 'none',
                }}
              >
                Explore Our Menu
              </h2>
            </div>
          </ScrollReveal>

          {/* Squircle Cards Row */}
          <StaggerContainer
            staggerDelay={0.1}
            distance={35}
            duration={0.65}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '0.75rem',
            }}
          >
            {MENU_CATEGORIES.map((cat, idx) => (
              <StaggerItem
                key={idx}
                onClick={() => navigate(`/dashboard?category=${cat.categoryFilter}`)}
                style={{
                  flex: '0 0 135px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Squircle Image */}
                <div
                  style={{
                    width: '120px',
                    height: '100px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    margin: '0 auto 0.65rem',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                    border: '2px solid #FFFFFF',
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <h4
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    color: '#1F2937',
                    lineHeight: 1.2,
                  }}
                >
                  {cat.name}
                </h4>
              </StaggerItem>
            ))}

            {/* Explore More Pill Button */}
            <StaggerItem style={{ flex: '0 0 150px', textAlign: 'center', paddingLeft: '0.5rem' }}>
              <Link
                to="/dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: '1.5px solid #1E3F20',
                  color: '#1E3F20',
                  padding: '0.6rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#1E3F20';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#1E3F20';
                }}
              >
                <span>Explore More</span>
                <ArrowRight size={15} />
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* 3. EXPLORE OUR FAVOURITES (SPLIT DUAL-TONE CARDS) */}
      <section style={{ padding: '1rem 0 4rem' }}>
        <div className="max-w-7xl">
          <ScrollReveal direction="up" distance={30} duration={0.65}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                  fontSize: '2.2rem',
                  fontWeight: '900',
                  letterSpacing: '0.2px',
                  color: '#1F2937',
                }}
              >
                Explore Our Favourites
              </h2>
            </div>
          </ScrollReveal>

          <StaggerContainer
            staggerDelay={0.15}
            distance={40}
            duration={0.7}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '2rem',
            }}
          >
            {FAVOURITES.map((fav) => (
              <StaggerItem
                key={fav.id}
                style={{
                  display: 'flex',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  background: fav.bgTone,
                  minHeight: '220px',
                  transition: 'transform 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Left Food Image Half */}
                <div style={{ flex: '1', minWidth: '160px', position: 'relative' }}>
                  <img
                    src={fav.image}
                    alt={fav.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Right Rich Brand Colored Content Half */}
                <div
                  style={{
                    flex: '1.2',
                    padding: '1.5rem 1.75rem',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        color: 'rgba(255, 255, 255, 0.8)',
                        display: 'block',
                        marginBottom: '0.3rem',
                      }}
                    >
                      {fav.category} Favourite
                    </span>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: '900',
                        lineHeight: 1.2,
                        color: '#FFFFFF',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {fav.name}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.78rem',
                        color: 'rgba(255, 255, 255, 0.85)',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {fav.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFFFFF' }}>
                      ₹{fav.price}
                    </span>
                    <button
                      onClick={() => handleQuickAddFavourite(fav)}
                      style={{
                        background: '#FFFFFF',
                        color: fav.bgTone,
                        border: 'none',
                        padding: '0.45rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: '900',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      <Plus size={15} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* 4. OFFERS & DEALS SECTION */}
      <section
        id="deals"
        style={{
          padding: '4rem 0',
          background: '#FFF9F5',
          borderTop: '1px solid #FEE2E2',
          borderBottom: '1px solid #FEE2E2',
        }}
      >
        <div className="max-w-7xl">
          <ScrollReveal direction="up" distance={30} duration={0.65}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: '2.25rem',
                gap: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Flame size={16} /> Exclusive Deals & Discounts
                </span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1F2937', marginTop: '0.3rem' }}>
                  Hot Pizza Offers & Combos
                </h2>
              </div>
              <Link
                to="/dashboard"
                style={{
                  color: 'var(--primary)',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>View All Menu Offers</span>
                <ChevronRight size={18} />
              </Link>
            </div>
          </ScrollReveal>

          <StaggerContainer
            staggerDelay={0.12}
            distance={40}
            duration={0.7}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {DEALS.map((deal) => (
              <StaggerItem
                key={deal.id}
                style={{
                  background: '#FFFFFF',
                  border: `1.5px solid ${deal.accentColor}30`,
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px ${deal.accentColor}20`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                }}
              >
                {/* Top Accent Strip */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: deal.accentColor,
                  }}
                />

                <span
                  style={{
                    color: deal.accentColor,
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    letterSpacing: '0.8px',
                    marginBottom: '0.5rem',
                  }}
                >
                  {deal.badge}
                </span>

                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1F2937', marginBottom: '0.4rem' }}>
                  {deal.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                  {deal.subtitle}
                </p>

                {/* Coupon Code Pill */}
                <div
                  onClick={() => handleApplyDeal(deal)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: deal.bgColor,
                    border: `1px dashed ${deal.accentColor}`,
                    padding: '0.45rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    cursor: 'pointer',
                  }}
                  title="Click to apply coupon code"
                >
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' }}>Coupon Code:</span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: '800',
                      color: deal.accentColor,
                      fontSize: '0.95rem',
                    }}
                  >
                    {deal.code}
                  </span>
                </div>

                <button
                  onClick={() => handleApplyDeal(deal)}
                  className="btn"
                  style={{
                    background: deal.accentColor,
                    color: '#FFFFFF',
                    marginTop: 'auto',
                    padding: '0.65rem 1.2rem',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>{deal.buttonText}</span>
                  <ArrowRight size={16} />
                </button>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>



      {/* 6. CHEF'S SIGNATURE PIZZAS SHOWCASE */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-page)', borderBottom: '1px solid #F3F4F6' }}>
        <div className="max-w-7xl">
          <ScrollReveal direction="up" distance={30} duration={0.65}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginBottom: '3rem',
                gap: '1rem',
              }}
            >
              <div>
                <span
                  style={{
                    color: 'var(--secondary)',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Chef's Signature Selections
                </span>
                <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#1F2937', marginTop: '0.35rem' }}>
                  Most Popular Pizzas
                </h2>
              </div>
              <Link
                to="/dashboard"
                style={{
                  color: 'var(--primary)',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>View Full Menu</span>
                <ChevronRight size={18} />
              </Link>
            </div>
          </ScrollReveal>

          {loading ? (
            <Loader text="Loading gourmet pizza catalog..." />
          ) : (
            <StaggerContainer
              staggerDelay={0.12}
              distance={40}
              duration={0.7}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {featuredPizzas.map((pizza) => (
                <StaggerItem key={pizza._id}>
                  <PizzaCard pizza={pizza} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* 7. WHY CHOOSE PIZZANEST */}
      <section style={{ padding: '5rem 0', background: '#FFFFFF' }}>
        <div className="max-w-7xl">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}
          >
            <div>
              <ScrollReveal direction="up" distance={30} duration={0.65}>
                <span
                  style={{
                    color: 'var(--primary)',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                  }}
                >
                  Our Quality Commitment
                </span>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1F2937', margin: '0.5rem 0 1.25rem' }}>
                  Better Ingredients. Better Pizza.
                </h2>
                <p
                  style={{
                    color: '#4B5563',
                    fontSize: '1.05rem',
                    lineHeight: 1.6,
                    marginBottom: '2rem',
                  }}
                >
                  We believe exceptional pizza requires authentic ingredients, zero shortcuts, and cutting-edge live order tracking technology.
                </p>
              </ScrollReveal>

              <StaggerContainer
                staggerDelay={0.12}
                distance={30}
                duration={0.6}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {[
                  {
                    title: '🍕 100% Fresh Dough Made Daily',
                    desc: 'Slow fermented for 48 hours for an airy, crisp, easily digestible crust.',
                  },
                  {
                    title: '🔥 450°C Volcanic Stone Baked',
                    desc: 'Seals in rich flavors with smoky leopard-spotted crust edges.',
                  },
                  {
                    title: '⚡ 30-Min Hot & Fresh Delivery',
                    desc: 'Real-time live kitchen dispatch tracking directly to your doorstep.',
                  },
                  {
                    title: '❤️ 100% Real Dairy Mozzarella',
                    desc: 'Zero artificial substitutes, palm oils, or processed binders.',
                  },
                ].map((item, idx) => (
                  <StaggerItem key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <CheckCircle2 size={22} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1F2937' }}>{item.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.15rem' }}>{item.desc}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            {/* Right Callout Box */}
            <ScrollReveal direction="left" distance={40} duration={0.75} delay={0.15}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #FFF0F2 0%, #FFFDF9 100%)',
                  padding: '2.75rem',
                  borderRadius: 'var(--radius-xl)',
                  border: '1.5px solid rgba(200, 16, 46, 0.2)',
                  boxShadow: '0 10px 30px rgba(200, 16, 46, 0.08)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🍕</div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1F2937', marginBottom: '0.75rem' }}>
                  Ready for Hot & Fresh Pizza?
                </h3>
                <p style={{ color: '#4B5563', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  Order your favorite gourmet pizzas or build your custom masterpiece. Instant test checkout with Razorpay.
                </p>
                <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  <span>Order Now</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
};
