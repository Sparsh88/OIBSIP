import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  Tag,
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, subtotal, discountAmount, appliedCoupon, tax, deliveryFee, totalAmount, clearCart } = useCart();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [pendingOrderInfo, setPendingOrderInfo] = useState(null);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // Complete Payment Verification on Backend
  const handleVerifyBackend = async ({ internalOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
    try {
      const data = await API.post('/payments/verify', {
        internalOrderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      setShowSimModal(false);
      clearCart();
      success('Payment Verified! Your wood-fired order is now in the kitchen queue.');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      error(err.message || 'Payment verification failed');
    }
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();

    if (!address.street || !address.city || !address.phone) {
      error('Please provide a complete delivery address and phone number');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on backend
      const res = await API.post('/payments/create-order', {
        items: cartItems,
        deliveryAddress: address,
        customerNotes: notes,
        couponCode: appliedCoupon?.code || '',
      });

      const { orderId, orderNumber, razorpayOrderId, amount, currency, keyId } = res;
      setPendingOrderInfo({ orderId, orderNumber, razorpayOrderId, amount, currency });

      // 2. Check if Razorpay official SDK is available and key is configured
      if (
        window.Razorpay &&
        keyId &&
        keyId !== 'rzp_test_YourTestKeyIdHere'
      ) {
        const options = {
          key: keyId,
          amount,
          currency,
          name: 'PizzaNest Artisan Kitchen',
          description: `Order #${orderNumber}`,
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200',
          order_id: razorpayOrderId,
          handler: async (response) => {
            await handleVerifyBackend({
              internalOrderId: orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          prefill: {
            name: user?.name || 'Valued Customer',
            email: user?.email || 'customer@pizzanest.com',
            contact: address.phone,
          },
          theme: {
            color: '#C8102E',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) => {
          error(`Payment Failed: ${resp.error.description}`);
        });
        rzp.open();
      } else {
        // Test Simulation Modal fallback
        info('Opening Razorpay Sandbox Simulation Gateway...');
        setShowSimModal(true);
      }
    } catch (err) {
      error(err.message || 'Could not initiate payment. Check ingredient availability.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate Instant Successful Test Payment
  const handleSimulateSuccess = async () => {
    if (!pendingOrderInfo) return;
    setLoading(true);

    try {
      // Generate simulated test signature
      const simPaymentId = `pay_sim_${Date.now()}`;
      const simSig = `sim_sig_${Date.now()}`;

      await handleVerifyBackend({
        internalOrderId: pendingOrderInfo.orderId,
        razorpayOrderId: pendingOrderInfo.razorpayOrderId,
        razorpayPaymentId: simPaymentId,
        razorpaySignature: simSig,
      });
    } catch (err) {
      error('Simulation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      <Link
        to="/cart"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#6B7280',
          fontSize: '0.88rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Cart</span>
      </Link>

      <div
        className="responsive-2col-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* Checkout Form */}
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#1F2937', marginBottom: '0.5rem' }}>
            Checkout & Delivery
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.92rem', marginBottom: '2rem' }}>
            Enter your delivery location and confirm payment via Razorpay.
          </p>

          <form onSubmit={handleInitiatePayment}>
            {/* Delivery Address Section */}
            <div
              className="card"
              style={{
                padding: '2rem',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid #E5E7EB',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                  }}
                >
                  <MapPin size={18} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1F2937' }}>
                  Delivery Address
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Street Address */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.4rem' }}>
                    Street Address / House No. <span style={{ color: '#C8102E' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={17} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                      placeholder="e.g. Flat 402, Sunshine Heights, Bandra West"
                      className="form-input"
                      style={{ paddingLeft: '42px', height: '46px', fontSize: '0.92rem' }}
                      required
                    />
                  </div>
                </div>

                {/* City & State Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.4rem' }}>
                      City <span style={{ color: '#C8102E' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      placeholder="e.g. Mumbai"
                      className="form-input"
                      style={{ height: '46px', fontSize: '0.92rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.4rem' }}>
                      State <span style={{ color: '#C8102E' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      placeholder="e.g. Maharashtra"
                      className="form-input"
                      style={{ height: '46px', fontSize: '0.92rem' }}
                      required
                    />
                  </div>
                </div>

                {/* Pincode & Phone Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.4rem' }}>
                      Pincode / Zip Code <span style={{ color: '#C8102E' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={address.zipCode}
                      onChange={handleAddressChange}
                      placeholder="e.g. 400050"
                      className="form-input"
                      style={{ height: '46px', fontSize: '0.92rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.4rem' }}>
                      Contact Phone <span style={{ color: '#C8102E' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={17} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="tel"
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        placeholder="e.g. +91 98765 43210"
                        className="form-input"
                        style={{ paddingLeft: '42px', height: '46px', fontSize: '0.92rem' }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Kitchen / Delivery Instructions */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.88rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.4rem' }}>
                    Kitchen / Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Ring the doorbell, leave extra seasoning and oregano packets"
                    className="form-input"
                    style={{ height: '46px', fontSize: '0.92rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div
              className="card"
              style={{
                padding: '2rem',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid #E5E7EB',
                marginBottom: '2.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--accent-green-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-green)',
                  }}
                >
                  <CreditCard size={18} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1F2937' }}>
                  Payment Method
                </h3>
              </div>

              {/* Razorpay Gateway Pill Card */}
              <div
                style={{
                  border: '2px solid var(--primary)',
                  background: 'var(--primary-light)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    }}
                  >
                    💳
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#1F2937' }}>
                      Razorpay Payment Gateway
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      UPI, Cards, NetBanking, Wallets, EMI & Test Mode
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '6px solid var(--primary)',
                    background: '#FFFFFF',
                  }}
                />
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                boxShadow: 'var(--shadow-primary)',
              }}
            >
              {loading ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <span>Pay ₹{totalAmount} via Razorpay</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <div
          className="card"
          style={{
            padding: '2rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid #E5E7EB',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: '900',
              color: '#1F2937',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #F3F4F6',
              paddingBottom: '0.75rem',
            }}
          >
            Items in Order ({cartItems.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {cartItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <div>
                  <p style={{ fontWeight: '800', color: '#1F2937' }}>
                    {item.quantity}x {item.name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {item.customBase} &bull; {item.customCheese}
                  </p>
                </div>
                <span style={{ fontWeight: '800', color: 'var(--primary)' }}>₹{item.totalPrice}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid #E5E7EB',
              paddingTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '700', color: '#1F2937' }}>₹{subtotal}</span>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: '800' }}>
                <span>Coupon ({appliedCoupon.code}):</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>GST (5%):</span>
              <span style={{ fontWeight: '700', color: '#1F2937' }}>₹{tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>Delivery Fee:</span>
              <span style={{ fontWeight: '700', color: deliveryFee === 0 ? 'var(--accent-green)' : '#1F2937' }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '2px dashed #E5E7EB',
                fontSize: '1.3rem',
                fontWeight: '900',
                color: '#1F2937',
              }}
            >
              <span>Total Payable:</span>
              <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>₹{totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY TEST SIMULATION MODAL */}
      {showSimModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2.5rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #E5E7EB',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: 'var(--primary)',
              }}
            >
              <CreditCard size={28} />
            </div>

            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1F2937', marginBottom: '0.4rem' }}>
              Razorpay Test Gateway
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Simulating payment verification for Order #{pendingOrderInfo?.orderNumber}
            </p>

            <div
              style={{
                background: '#F9FAFB',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.75rem',
                fontSize: '0.9rem',
                border: '1px solid #E5E7EB',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6B7280' }}>Amount:</span>
                <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>₹{totalAmount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Merchant:</span>
                <strong style={{ color: '#1F2937' }}>PizzaNest Artisan Kitchen</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleSimulateSuccess}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
              >
                <CheckCircle2 size={18} />
                <span>{loading ? 'Verifying Payment...' : 'Simulate Successful Payment'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
