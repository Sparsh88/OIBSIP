import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck, Tag, X } from 'lucide-react';
import { useCart, AVAILABLE_COUPONS } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CartPage = () => {
  const {
    cartItems,
    availableCoupons,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    tax,
    deliveryFee,
    totalAmount,
  } = useCart();
  const { success, error, info } = useToast();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (code) => {
    const res = applyCoupon(code);
    if (res.success) {
      success(res.message);
      setCouponInput('');
    } else {
      error(res.message);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-5xl" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1.5rem',
          }}
        >
          🍕
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1F2937', marginBottom: '0.75rem' }}>
          Your Cart is Empty
        </h2>
        <p
          style={{
            fontSize: '1rem',
            color: '#4B5563',
            marginBottom: '2rem',
            lineHeight: 1.6,
          }}
        >
          Looks like you haven't added any handcrafted pizzas yet. Explore our delicious menu catalog!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            <span>Explore Menu</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: '900',
              color: '#1F2937',
              letterSpacing: '-0.5px',
            }}
          >
            Your Shopping Cart
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Review your order before proceeding to secure checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="btn btn-secondary btn-sm"
          style={{ color: '#DC2626', borderColor: '#FECACA' }}
        >
          <Trash2 size={16} />
          <span>Clear All</span>
        </button>
      </div>

      <div
        className="responsive-2col-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {cartItems.map((item, idx) => (
            <div
              key={idx}
              className="card cart-item-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid #E5E7EB',
                gap: '1.5rem',
              }}
            >
              {/* Item Thumbnail & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    border: '1px solid #F3F4F6',
                  }}
                />
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.35rem' }}>
                    {item.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      {item.customBase && (
                        <span style={{ background: '#F3F4F6', color: '#374151', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
                          Base: {item.customBase}
                        </span>
                      )}
                      {item.customSauce && (
                        <span style={{ background: '#FFF7ED', color: '#C2410C', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
                          Sauce: {item.customSauce}
                        </span>
                      )}
                      {item.customCheese && (
                        <span style={{ background: '#FEF3C7', color: '#B45309', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
                          Cheese: {item.customCheese}
                        </span>
                      )}
                    </div>

                    {Array.isArray(item.customVeggies) && item.customVeggies.length > 0 && (
                      <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: '700' }}>
                        + Veggies: {item.customVeggies.join(', ')}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      color: 'var(--primary)',
                      marginTop: '0.4rem',
                      display: 'inline-block',
                    }}
                  >
                    ₹{item.unitPrice} each
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Removal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Stepper */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#F9FAFB',
                    borderRadius: 'var(--radius-full)',
                    border: '1.5px solid #E5E7EB',
                    padding: '0.2rem',
                  }}
                >
                  <button
                    onClick={() => updateQuantity(idx, -1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1F2937',
                      cursor: 'pointer',
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ width: '36px', textAlign: 'center', fontWeight: '800', color: '#1F2937' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(idx, 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ textAlign: 'right', minWidth: '90px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1F2937', display: 'block' }}>
                    ₹{item.unitPrice * item.quantity}
                  </span>
                  <button
                    onClick={() => removeFromCart(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#DC2626',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.2rem',
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--primary)',
              fontWeight: '700',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Add More Pizzas from Menu</span>
          </Link>
        </div>

        {/* Order Summary Checkout Card */}
        <div
          className="card"
          style={{
            padding: '2rem',
            background: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid #E5E7EB',
          }}
        >
          <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1F2937', marginBottom: '1.25rem' }}>
            Order Summary
          </h3>

          {/* Apply Coupon Box & Available Offers */}
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1F2937', display: 'block', marginBottom: '0.5rem' }}>
              Have a Promo Code?
            </span>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="e.g. BOGO2026, CUSTOM30"
                style={{
                  flex: 1,
                  padding: '0.55rem 0.85rem',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  outline: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyCoupon(couponInput);
                }}
              />
              <button
                onClick={() => handleApplyCoupon(couponInput)}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '8px', padding: '0 1rem' }}
              >
                Apply
              </button>
            </div>

            {/* Applied Coupon Active Banner */}
            {appliedCoupon && (
              <div
                style={{
                  marginBottom: '1rem',
                  background: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={16} color="#166534" />
                  <div>
                    <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#166534', display: 'block' }}>
                      Coupon "{appliedCoupon.code}" Applied!
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#15803D' }}>{appliedCoupon.title}</span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  style={{
                    background: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    borderRadius: '6px',
                    color: '#DC2626',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '0.2rem 0.5rem',
                  }}
                >
                  Remove ✕
                </button>
              </div>
            )}

            {/* LIST OF AVAILABLE COUPONS */}
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                Available Coupons ({availableCoupons?.length || 0})
              </span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '200px', overflowY: 'auto' }}>
                {availableCoupons?.map((coupon) => {
                  const isCurrent = appliedCoupon?.code === coupon.code;
                  return (
                    <div
                      key={coupon.code}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        border: isCurrent ? '1.5px solid #166534' : '1px solid #E5E7EB',
                        background: isCurrent ? '#F0FDF4' : '#F9FAFB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '900',
                              background: '#FEF3C7',
                              color: '#92400E',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '4px',
                              border: '1px solid #FCD34D',
                            }}
                          >
                            {coupon.code}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1F2937' }}>
                            {coupon.title}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: '#6B7280', margin: 0 }}>
                          {coupon.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleApplyCoupon(coupon.code)}
                        disabled={isCurrent}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          border: isCurrent ? '1px solid #86EFAC' : '1px solid #1E3F20',
                          background: isCurrent ? '#DCFCE7' : '#1E3F20',
                          color: isCurrent ? '#166534' : '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          cursor: isCurrent ? 'default' : 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isCurrent ? 'Applied ✓' : 'Apply'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>Items Subtotal</span>
              <span style={{ fontWeight: '700', color: '#1F2937' }}>₹{subtotal}</span>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: '800' }}>
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>GST & Restaurant Tax (5%)</span>
              <span style={{ fontWeight: '700', color: '#1F2937' }}>₹{tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>Delivery Fee</span>
              <span style={{ fontWeight: '700', color: deliveryFee === 0 ? 'var(--accent-green)' : '#1F2937' }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '2px dashed #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '1.75rem',
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1F2937' }}>Total Payable</span>
            <span
              style={{
                fontSize: '2rem',
                fontWeight: '900',
                color: 'var(--primary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              ₹{totalAmount}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              marginTop: '1.25rem',
              fontSize: '0.8rem',
              color: '#6B7280',
            }}
          >
            <ShieldCheck size={16} color="var(--accent-green)" />
            <span>Secure 256-bit Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
