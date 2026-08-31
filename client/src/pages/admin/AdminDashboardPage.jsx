import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Flame,
  Bike,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
} from 'lucide-react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { AdminNav } from '../../components/AdminNav';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, joinAdminRoom } = useSocket();
  const { info, success, error } = useToast();

  const fetchStats = async () => {
    try {
      const data = await API.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Join Socket Admin Room for Live Events
  useEffect(() => {
    joinAdminRoom();

    if (socket) {
      const handleNewOrder = (order) => {
        info(`🔔 New Incoming Order #${order.orderNumber} (₹${order.totalAmount})!`);
        fetchStats();
      };

      const handleOrderUpdate = () => {
        fetchStats();
      };

      const handleInventoryUpdate = () => {
        fetchStats();
      };

      socket.on('new_order_received', handleNewOrder);
      socket.on('admin_order_updated', handleOrderUpdate);
      socket.on('inventory_updated', handleInventoryUpdate);

      return () => {
        socket.off('new_order_received', handleNewOrder);
        socket.off('admin_order_updated', handleOrderUpdate);
        socket.off('inventory_updated', handleInventoryUpdate);
      };
    }
  }, [socket]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      success(`Order status updated to "${newStatus}"`);
      fetchStats();
    } catch (err) {
      error(err.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return <Loader text="Loading live kitchen control metrics..." />;
  }

  const kpis = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue || 0}`,
      subtitle: 'From confirmed paid orders',
      icon: DollarSign,
      color: '#10B981',
      bg: '#ECFDF5',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      subtitle: `${stats?.ordersDelivered || 0} Delivered`,
      icon: ShoppingBag,
      color: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      title: 'Active Orders in Queue',
      value: stats?.activeOrders || 0,
      subtitle: 'Currently preparing / on route',
      icon: Flame,
      color: '#C8102E',
      bg: '#FFF0F2',
    },
    {
      title: 'Low Stock Alerts',
      value: stats?.lowStockItems || 0,
      subtitle: 'Ingredients below safety limit',
      icon: AlertTriangle,
      color: stats?.lowStockItems > 0 ? '#DC2626' : '#6B7280',
      bg: stats?.lowStockItems > 0 ? '#FEF2F2' : '#F9FAFB',
    },
  ];

  return (
    <div className="max-w-7xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      <AdminNav
        title="Kitchen Command Center"
        subtitle="Real-time kitchen dispatch pipeline, live sales metrics & automated stock monitoring."
      />

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem',
        }}
      >
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="card card-hover-lift"
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid #E5E7EB',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                padding: '1.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#6B7280' }}>
                  {kpi.title}
                </span>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: kpi.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: kpi.color,
                  }}
                >
                  <Icon size={22} />
                </div>
              </div>
              <h3
                style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  color: '#1F2937',
                  fontFamily: 'var(--font-display)',
                  marginBottom: '0.2rem',
                }}
              >
                {kpi.value}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{kpi.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Real-Time Live Orders Dispatch Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E5E7EB',
            paddingBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Flame size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1F2937' }}>
              Live Kitchen Dispatch Queue
            </h2>
          </div>
          <Link
            to="/admin/orders"
            style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <span>View Full Order History</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {stats?.recentOrders?.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: 'center',
              padding: '3rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            <CheckCircle2 size={40} color="var(--accent-green)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.3rem' }}>
              Kitchen Queue Clear
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
              All current orders have been fulfilled and delivered.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats?.recentOrders?.map((order) => (
              <div
                key={order._id}
                className="card card-hover-lift"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid #E5E7EB',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1F2937' }}>
                      #{order.orderNumber}
                    </h3>
                    <span
                      className={`badge ${
                        order.orderStatus === 'Delivered'
                          ? 'badge-veg'
                          : order.orderStatus === 'Cancelled'
                          ? 'badge-nonveg'
                          : 'badge-special'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      {order.user?.name || 'Customer'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>
                    {order.items?.length} items &bull; ₹{order.totalAmount} &bull;{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Quick Status Dispatch Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {order.orderStatus === 'Order Received' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'In Kitchen')}
                      className="btn btn-sm"
                      style={{ background: '#FFF0F2', color: 'var(--primary)', border: '1px solid rgba(200, 16, 46, 0.3)' }}
                    >
                      <Flame size={14} />
                      <span>Start Kitchen Bake</span>
                    </button>
                  )}

                  {order.orderStatus === 'In Kitchen' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Sent to Delivery')}
                      className="btn btn-sm"
                      style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid rgba(37, 99, 235, 0.3)' }}
                    >
                      <Bike size={14} />
                      <span>Dispatch Rider</span>
                    </button>
                  )}

                  {order.orderStatus === 'Sent to Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                      className="btn btn-sm"
                      style={{ background: '#ECFDF5', color: 'var(--accent-green)', border: '1px solid rgba(46, 125, 50, 0.3)' }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Delivered</span>
                    </button>
                  )}

                  <Link to="/admin/orders" className="btn btn-secondary btn-sm">
                    <span>Inspect</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
