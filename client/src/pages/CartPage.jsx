import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck, Tag, X } from 'lucide-react';
import { useCart, AVAILABLE_COUPONS } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CartPage = () => {
  const {
    cartItems,
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
                  <div style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ background: '#F3F4F6', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                      {item.customBase}
                    </span>
                    {item.customCheese && (
                      <span style={{ background: '#F3F4F6', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {item.customCheese}
                      </span>
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

          {/* Apply Coupon Box */}
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#4B5563', display: 'block', marginBottom: '0.5rem' }}>
              Have a Promo Code?
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
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

            {/* Applied Coupon Pill */}
            {appliedCoupon && (
              <div
                style={{
                  marginTop: '0.75rem',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                  padding: '0.45rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={14} color="#166534" />
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#166534' }}>
                    {appliedCoupon.code} Applied ({appliedCoupon.title})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#DC2626',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                  }}
                >
                  ✕
                </button>
              </div>
            )}
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
