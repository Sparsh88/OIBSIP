import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Tag,
  Star,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Gift,
  Flame,
  Check,
  X,
} from 'lucide-react';
import API from '../services/api';
import { PizzaCard } from '../components/PizzaCard';
import { Loader } from '../components/Loader';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';
import { useCart, AVAILABLE_COUPONS } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const MENU_TABS = [
  { id: 'Protein Packed', label: 'Protein Packed', category: 'Protein Packed' },
  { id: 'Pizzas', label: 'Pizzas', category: 'Pizzas' },
  { id: 'Sides', label: 'Sides & Breads', category: 'Sides' },
  { id: 'Beverages', label: 'Beverages', category: 'Beverages' },
  { id: 'Desserts', label: 'Desserts', category: 'Desserts' },
  { id: 'Extras', label: 'Extras & Dips', category: 'Extras' },
];

export const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) {
      const cleanCat = cat.trim().toLowerCase();
      const matched = MENU_TABS.find(
        (t) =>
          t.category.toLowerCase() === cleanCat ||
          t.id.toLowerCase() === cleanCat ||
          t.label.toLowerCase() === cleanCat
      );
      if (matched) return matched.id;
    }
    return 'Pizzas';
  };

  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [pizzaTypeFilter, setPizzaTypeFilter] = useState('All'); // 'All', 'Veg', 'Non-Veg', 'Special'
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [inputCoupon, setInputCoupon] = useState('');

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
    discountAmount,
    appliedCoupon,
    availableCoupons,
    applyCoupon,
    removeCoupon,
    tax,
    deliveryFee,
    totalAmount,
  } = useCart();

  const { success, error, info } = useToast();

  // Sync active tab whenever location.search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const type = params.get('type');
    if (cat) {
      const cleanCat = cat.trim().toLowerCase();
      const matched = MENU_TABS.find(
        (t) =>
          t.category.toLowerCase() === cleanCat ||
          t.id.toLowerCase() === cleanCat ||
          t.label.toLowerCase() === cleanCat
      );
      if (matched && matched.id !== activeTab) {
        setActiveTab(matched.id);
      }
    }
    if (type) setPizzaTypeFilter(type);
  }, [location.search]);

  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        const cur = MENU_TABS.find((t) => t.id === activeTab);
        if (cur && cur.category !== 'All') {
          queryParams.append('category', cur.category);
        }

        // If on Pizzas tab and sub-filter is applied
        if (activeTab === 'Pizzas' && pizzaTypeFilter !== 'All') {
          queryParams.append('pizzaType', pizzaTypeFilter);
        }

        const data = await API.get(`/pizzas?${queryParams.toString()}`);
        setPizzas(data.pizzas || []);
      } catch (err) {
        console.error('Error fetching pizzas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, [activeTab, pizzaTypeFilter]);

  const handleApplyCouponCode = (code) => {
    const res = applyCoupon(code);
    if (res.success) {
      success(res.message);
      setShowCouponModal(false);
      setInputCoupon('');
    } else {
      error(res.message);
    }
  };

  return (
    <div style={{ background: '#FFFDF9', minHeight: '100vh', width: '100%' }}>
      {/* FULL-WIDTH 2-COLUMN LAYOUT WITH VERTICAL DIVIDER */}
      <div
        className="dashboard-main-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 390px',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {/* LEFT COLUMN: MENU CATALOG */}
        <div className="dashboard-catalog-column" style={{ padding: '1.25rem 2.25rem 5rem 2.25rem', minWidth: '0' }}>
          {/* 1. HORIZONTAL CATEGORY TABS WITH GREEN ACTIVE UNDERLINE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2.5rem',
              overflowX: 'auto',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '0.85rem',
              marginBottom: '1.25rem',
              whiteSpace: 'nowrap',
            }}
          >
            {MENU_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPizzaTypeFilter('All');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '3.5px solid #1E3F20' : '3.5px solid transparent',
                    paddingBottom: '0.5rem',
                    fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                    fontSize: '1.15rem',
                    fontWeight: isActive ? '900' : '700',
                    color: isActive ? '#1E3F20' : '#4B5563',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'none',
                    letterSpacing: '0.2px',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 2. SUB-FILTER PILLS FOR PIZZAS: VEG, NON-VEG & SPECIAL ONLY */}
          {activeTab === 'Pizzas' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              {/* All Pizzas */}
              <button
                onClick={() => setPizzaTypeFilter('All')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid',
                  borderColor: pizzaTypeFilter === 'All' ? '#1E3F20' : '#E5E7EB',
                  background: pizzaTypeFilter === 'All' ? '#1E3F20' : '#FFFFFF',
                  color: pizzaTypeFilter === 'All' ? '#FFFFFF' : '#1F2937',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                All Pizzas
              </button>

              {/* 1. Veg Filter */}
              <button
                onClick={() => setPizzaTypeFilter('Veg')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 1.15rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid',
                  borderColor: pizzaTypeFilter === 'Veg' ? '#2E7D32' : '#E5E7EB',
                  background: pizzaTypeFilter === 'Veg' ? '#F0FDF4' : '#FFFFFF',
                  color: '#2E7D32',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '13px',
                    height: '13px',
                    border: '1.5px solid #2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5px',
                    borderRadius: '3px',
                  }}
                >
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2E7D32' }} />
                </div>
                <span>Veg</span>
              </button>

              {/* 2. Non-Veg Filter */}
              <button
                onClick={() => setPizzaTypeFilter('Non-Veg')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 1.15rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid',
                  borderColor: pizzaTypeFilter === 'Non-Veg' ? '#C8102E' : '#E5E7EB',
                  background: pizzaTypeFilter === 'Non-Veg' ? '#FFF0F2' : '#FFFFFF',
                  color: '#C8102E',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: '13px',
                    height: '13px',
                    border: '1.5px solid #C8102E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1.5px',
                    borderRadius: '3px',
                  }}
                >
                  <div style={{ width: '5px', height: '5px', background: '#C8102E' }} />
                </div>
                <span>Non Veg</span>
              </button>

              {/* 3. Special Filter */}
              <button
                onClick={() => setPizzaTypeFilter('Special')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 1.15rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid',
                  borderColor: pizzaTypeFilter === 'Special' ? '#F59E0B' : '#E5E7EB',
                  background: pizzaTypeFilter === 'Special' ? '#FFFBEB' : '#FFFFFF',
                  color: '#B45309',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Star size={15} fill="#F59E0B" color="#F59E0B" />
                <span>Special</span>
              </button>
            </div>
          )}

          {/* 3. SECTION HEADING: "Global Favourite" */}
          {activeTab === 'Pizzas' && (
            <h2
              style={{
                fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                fontSize: '1.55rem',
                fontWeight: '900',
                color: '#1F2937',
                letterSpacing: '0.3px',
                marginBottom: '1.25rem',
              }}
            >
              Global Favourite
            </h2>
          )}

          {/* 4. PRODUCTS CATALOG GRID */}
          {loading ? (
            <Loader text="Fetching menu items..." />
          ) : pizzas.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '5rem 2rem',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px dashed #D1D5DB',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍕</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1F2937' }}>
                No Items Found
              </h3>
              <p style={{ color: '#6B7280', marginTop: '0.3rem', marginBottom: '1.5rem' }}>
                Try selecting another tab.
              </p>
              <button
                onClick={() => {
                  setActiveTab('Pizzas');
                  setPizzaTypeFilter('All');
                }}
                className="btn btn-primary btn-sm"
              >
                Reset Menu
              </button>
            </div>
          ) : (
            <StaggerContainer
              staggerDelay={0.08}
              distance={35}
              duration={0.6}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {pizzas.map((pizza) => (
                <StaggerItem key={pizza._id}>
                  <PizzaCard pizza={pizza} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>

        {/* RIGHT COLUMN: FULL-HEIGHT STICKY "YOUR CART" PANEL WITH CHECKOUT AT BOTTOM */}
        <div
          className="dashboard-cart-sidebar"
          style={{
            borderLeft: '1.5px solid #E5E7EB',
            background: '#FFFFFF',
            padding: '1.25rem 1.5rem 1.25rem 1.5rem',
            position: 'sticky',
            top: '72px',
            height: 'calc(100vh - 72px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* TOP SECTION: CART HEADER & ITEMS / EMPTY ILLUSTRATION */}
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.25rem' }}>
            <h3
              style={{
                fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                fontSize: '1.3rem',
                fontWeight: '900',
                color: '#1F2937',
                textAlign: 'center',
                marginBottom: '1rem',
              }}
            >
              Your Cart
            </h3>

            {cartItems.length === 0 ? (
              /* Empty Cart State */
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                {/* Doodle Style Pizza Box Illustration */}
                <div
                  style={{
                    width: '140px',
                    height: '105px',
                    margin: '0 auto 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg
                    viewBox="0 0 160 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Box Base */}
                    <path
                      d="M20 70 L80 100 L140 70 L80 40 Z"
                      stroke="#1F2937"
                      strokeWidth="2.5"
                      fill="#FAF5FF"
                    />
                    {/* Box Front Flap */}
                    <path
                      d="M20 70 L20 85 L80 115 L140 85 L140 70 L80 100 Z"
                      stroke="#1F2937"
                      strokeWidth="2.5"
                      fill="#F3F4F6"
                    />
                    {/* Box Open Lid */}
                    <path
                      d="M20 70 L35 25 L125 25 L140 70 L80 40 Z"
                      stroke="#1F2937"
                      strokeWidth="2.5"
                      fill="#FFFFFF"
                    />
                    {/* Steam lines */}
                    <path
                      d="M70 20 Q75 10 70 2 M85 22 Q90 12 85 4"
                      stroke="#C8102E"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <h4
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: '900',
                    color: '#1F2937',
                    marginBottom: '0.35rem',
                  }}
                >
                  Your cart is feeling a little empty
                </h4>
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: '#6B7280',
                    fontStyle: 'italic',
                  }}
                >
                  Add some delicious items to get started!
                </p>
              </div>
            ) : (
              /* Filled Cart Items List */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem' }}>
                {cartItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      paddingBottom: '0.65rem',
                      borderBottom: '1px solid #F3F4F6',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1F2937' }}>
                        {item.name}
                      </h5>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1E3F20' }}>
                        ₹{item.unitPrice * item.quantity}
                      </span>
                    </div>

                    {/* Stepper & Trash */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.15rem 0.4rem',
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(idx, -1);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#1F2937',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                          }}
                          aria-label="Decrease"
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(idx, 1);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#1F2937',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                          }}
                          aria-label="Increase"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(idx);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#DC2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '3px',
                        }}
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pricing Breakdown in Cart Sidebar */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '700', color: '#1F2937' }}>₹{subtotal}</span>
                  </div>

                  {appliedCoupon && discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: '700' }}>
                      <span>Discount ({appliedCoupon.code}):</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                    <span>GST (5%):</span>
                    <span style={{ fontWeight: '700', color: '#1F2937' }}>₹{tax}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                    <span>Delivery:</span>
                    <span style={{ fontWeight: '700', color: deliveryFee === 0 ? '#166534' : '#1F2937' }}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed #E5E7EB', fontSize: '1.1rem', fontWeight: '900', color: '#1F2937' }}>
                    <span>Total Amount:</span>
                    <span style={{ color: '#1E3F20' }}>₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM SECTION: REWARDS BANNER, COUPON, & CHECKOUT BUTTON */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', paddingTop: '0.5rem' }}>
            {/* DON'T MISS A SLICE PAPA REWARDS BANNER */}
            <div
              onClick={() => setShowCouponModal(true)}
              style={{
                background: '#1E3F20',
                borderRadius: '12px',
                padding: '0.85rem 1.1rem',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(30, 63, 32, 0.15)',
                cursor: 'pointer',
              }}
              title="Click to view special offers & coupons"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', zIndex: 2 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1E3F20',
                  }}
                >
                  <Star size={18} fill="#1E3F20" />
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                      fontSize: '0.92rem',
                      fontWeight: '900',
                      letterSpacing: '0.2px',
                    }}
                  >
                    Don't Miss a Slice
                  </h4>
                  <p style={{ fontSize: '0.7rem', color: '#E5E7EB' }}>
                    Click to view active coupon savings!
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right', zIndex: 2 }}>
                <span
                  style={{
                    fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: '900',
                    color: '#C8102E',
                    background: '#FFFFFF',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  OFFERS
                </span>
              </div>
            </div>

            {/* APPLY COUPON BAR */}
            <div
              style={{
                background: appliedCoupon ? '#F0FDF4' : '#FFFFFF',
                borderRadius: '12px',
                border: `1.5px solid ${appliedCoupon ? '#BBF7D0' : '#E5E7EB'}`,
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1 }}
                onClick={() => setShowCouponModal(true)}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: appliedCoupon ? '#166534' : '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <Tag size={14} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: appliedCoupon ? '#166534' : '#1F2937', display: 'block' }}>
                    {appliedCoupon ? `Code: ${appliedCoupon.code} Applied` : 'Apply Coupon'}
                  </span>
                  {appliedCoupon && (
                    <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: '600' }}>
                      {appliedCoupon.title} (Saved ₹{discountAmount})
                    </span>
                  )}
                </div>
              </div>

              {appliedCoupon ? (
                <button
                  onClick={removeCoupon}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#DC2626',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '0.2rem 0.4rem',
                  }}
                  title="Remove Coupon"
                >
                  ✕ Remove
                </button>
              ) : (
                <ChevronRight size={16} color="#9CA3AF" style={{ cursor: 'pointer' }} onClick={() => setShowCouponModal(true)} />
              )}
            </div>

            {/* CHECKOUT BUTTON */}
            <button
              onClick={() => {
                if (cartItems.length > 0) {
                  navigate('/checkout');
                } else {
                  info('Please add items to your cart first!');
                }
              }}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: 'var(--radius-full)',
                fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                fontSize: '1.15rem',
                fontWeight: '900',
                letterSpacing: '0.5px',
                border: 'none',
                background: cartItems.length > 0 ? '#1E3F20' : '#E5E7EB',
                color: cartItems.length > 0 ? '#FFFFFF' : '#9CA3AF',
                cursor: cartItems.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: cartItems.length > 0 ? '0 4px 14px rgba(30, 63, 32, 0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {cartItems.length > 0 ? `Checkout • ₹${totalAmount}` : 'Checkout'}
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE COUPON PICKER MODAL */}
      {showCouponModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => setShowCouponModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#FFF0F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C8102E',
                  }}
                >
                  <Tag size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1F2937', margin: 0 }}>
                    Apply Coupon
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>
                    Choose an offer or enter your promo code
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCouponModal(false)}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#4B5563',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Custom Code Input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={inputCoupon}
                onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  outline: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyCouponCode(inputCoupon);
                }}
              />
              <button
                onClick={() => handleApplyCouponCode(inputCoupon)}
                style={{
                  background: '#1E3F20',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 1.25rem',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>

            {/* Available Coupons List */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.75rem' }}>
              Available Offers & Deals
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(availableCoupons && availableCoupons.length > 0 ? availableCoupons : AVAILABLE_COUPONS).map((coupon) => {
                const isCurrent = appliedCoupon?.code === coupon.code;
                return (
                  <div
                    key={coupon.code}
                    style={{
                      border: `1.5px dashed ${isCurrent ? '#166534' : '#E5E7EB'}`,
                      background: isCurrent ? '#F0FDF4' : '#FAFAFA',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #D1D5DB',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontWeight: '900',
                            fontSize: '0.85rem',
                            color: '#C8102E',
                          }}
                        >
                          {coupon.code}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1F2937' }}>
                          {coupon.title}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0 }}>
                        {coupon.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (isCurrent) {
                          removeCoupon();
                          info(`Coupon ${coupon.code} removed`);
                        } else {
                          handleApplyCouponCode(coupon.code);
                        }
                      }}
                      style={{
                        background: isCurrent ? '#166534' : '#FFFFFF',
                        color: isCurrent ? '#FFFFFF' : '#1E3F20',
                        border: '1.5px solid #1E3F20',
                        padding: '0.4rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isCurrent ? '✓ Applied' : 'Apply'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
