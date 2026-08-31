import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, CheckCircle2, ChevronRight, Package } from 'lucide-react';
import API from '../services/api';
import { Loader } from '../components/Loader';

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const data = await API.get('/orders/my-orders');
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Order Received':
        return <span className="badge badge-special">Order Received</span>;
      case 'In Kitchen':
        return <span className="badge" style={{ background: '#FFF0F2', color: '#C8102E' }}>🔥 In Kitchen</span>;
      case 'Sent to Delivery':
        return <span className="badge" style={{ background: '#EFF6FF', color: '#2563EB' }}>🛵 Out for Delivery</span>;
      case 'Delivered':
        return <span className="badge badge-veg">✅ Delivered</span>;
      case 'Cancelled':
        return <span className="badge badge-nonveg">❌ Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return <Loader text="Loading your order history..." />;
  }

  return (
    <div className="max-w-7xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1F2937' }}>My Orders</h1>
        <p style={{ color: '#6B7280' }}>
          Review and track all your past and live artisan pizza deliveries.
        </p>
      </div>

      {orders.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <Package size={48} color="#9CA3AF" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.5rem' }}>
            No Orders Found
          </h3>
          <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
            You haven't placed any orders yet. Ready to experience fresh, hot pizza?
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            <span>Explore Menu</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              className="card card-hover-lift"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1F2937' }}>
                    #{order.orderNumber}
                  </h3>
                  {getStatusBadge(order.orderStatus)}
                </div>

                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '0.6rem' }}>
                  Ordered on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {order.items?.map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.8rem',
                        background: '#F9FAFB',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        color: '#4B5563',
                        border: '1px solid #E5E7EB',
                        fontWeight: '600',
                      }}
                    >
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: '700', display: 'block' }}>
                    TOTAL PAID
                  </span>
                  <span
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: '900',
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    ₹{order.totalAmount}
                  </span>
                </div>

                <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">
                  <span>Track Order</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
