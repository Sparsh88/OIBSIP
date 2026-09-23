import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  Bike,
  ShieldCheck,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { OrderStatusTracker } from '../components/OrderStatusTracker';
import { Loader } from '../components/Loader';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../components/ScrollReveal';

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, joinOrderRoom, leaveOrderRoom } = useSocket();
  const { success, info, error } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await API.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        error(err.message || 'Failed to retrieve order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Join Socket Room for Real-Time Synchronization
  useEffect(() => {
    if (id) {
      joinOrderRoom(id);
    }

    if (socket) {
      const handleStatusUpdate = (payload) => {
        if (payload.orderId === id) {
          setOrder((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              orderStatus: payload.orderStatus,
              statusHistory: payload.statusHistory,
              updatedAt: payload.updatedAt,
            };
          });

          info(`Real-Time Update: Order is now "${payload.orderStatus}"!`);
        }
      };

      socket.on('order_status_changed', handleStatusUpdate);

      return () => {
        socket.off('order_status_changed', handleStatusUpdate);
        leaveOrderRoom(id);
      };
    }
  }, [id, socket]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const data = await API.patch(`/orders/${id}/cancel`);
      setOrder(data.order);
      success('Order cancelled successfully');
    } catch (err) {
      error(err.message);
    }
  };

  if (loading) {
    return <Loader text="Connecting to kitchen live stream..." />;
  }

  if (!order) {
    return (
      <div className="max-w-5xl" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1F2937' }}>Order Not Found</h2>
        <Link to="/orders" className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      <Link
        to="/orders"
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
        <span>Back to Order History</span>
      </Link>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1F2937' }}>
              Order #{order.orderNumber}
            </h1>
            <span
              className={`badge ${
                order.orderStatus === 'Delivered'
                  ? 'badge-veg'
                  : order.orderStatus === 'Cancelled'
                  ? 'badge-nonveg'
                  : 'badge-special'
              }`}
              style={{ fontSize: '0.85rem' }}
            >
              {order.orderStatus}
            </span>
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {order.orderStatus === 'Order Received' && (
          <button
            onClick={handleCancelOrder}
            className="btn btn-secondary btn-sm"
            style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
          >
            <XCircle size={16} />
            <span>Cancel Order</span>
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Real-Time Live Status Tracker */}
        <ScrollReveal direction="up" distance={30} duration={0.65}>
          <OrderStatusTracker currentStatus={order.orderStatus} statusHistory={order.statusHistory} />
        </ScrollReveal>

        {/* Order Details & Summary Grid */}
        <StaggerContainer
          staggerDelay={0.12}
          distance={35}
          duration={0.65}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Itemized Order Items */}
          <StaggerItem
            className="card"
            style={{
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid #E5E7EB',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: '900',
                color: '#1F2937',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #F3F4F6',
                paddingBottom: '0.75rem',
              }}
            >
              Items in this Order ({order.items.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <img
                    src={
                      item.image ||
                      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={item.name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      border: '1px solid #E5E7EB',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#1F2937' }}>
                        {item.quantity}x {item.name}
                      </h4>
                      <span style={{ fontWeight: '800', color: 'var(--primary)' }}>₹{item.totalPrice}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.2rem' }}>
                      <span>
                        {item.customBase} &bull; {item.customSauce} &bull; {item.customCheese}
                      </span>
                      {item.customVeggies?.length > 0 && (
                        <p style={{ color: 'var(--primary)', fontWeight: '700', marginTop: '0.15rem' }}>
                          + {item.customVeggies.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                borderTop: '1px solid #E5E7EB',
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: '900',
                color: '#1F2937',
              }}
            >
              <span>Total Paid:</span>
              <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                ₹{order.totalAmount}
              </span>
            </div>
          </StaggerItem>

          {/* Delivery & Payment Details */}
          <StaggerItem
            className="card"
            style={{
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid #E5E7EB',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: '900',
                color: '#1F2937',
                marginBottom: '1.25rem',
                borderBottom: '1px solid #F3F4F6',
                paddingBottom: '0.75rem',
              }}
            >
              Delivery & Payment Info
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.88rem' }}>
              <div>
                <span style={{ color: '#6B7280', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  Delivery Destination
                </span>
                <p style={{ fontWeight: '700', color: '#1F2937', marginTop: '0.2rem' }}>
                  {order.deliveryAddress?.street}
                </p>
                <p style={{ color: '#6B7280' }}>
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.zipCode}
                </p>
                <p style={{ color: '#6B7280', marginTop: '0.2rem' }}>
                  Phone: <strong>{order.deliveryAddress?.phone}</strong>
                </p>
              </div>

              <div>
                <span style={{ color: '#6B7280', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>
                  Payment Status
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className={`badge ${order.paymentStatus === 'Completed' ? 'badge-veg' : 'badge-special'}`}>
                    {order.paymentStatus}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    Method: <strong>{order.paymentMethod}</strong>
                  </span>
                </div>
              </div>

              {order.customerNotes && (
                <div>
                  <span style={{ color: '#6B7280', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    Kitchen Notes
                  </span>
                  <p style={{ color: '#1F2937', marginTop: '0.2rem', fontStyle: 'italic' }}>
                    "{order.customerNotes}"
                  </p>
                </div>
              )}
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  );
};
