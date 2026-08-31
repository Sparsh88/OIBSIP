import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  Bike,
  Home,
  XCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { socket, joinAdminRoom } = useSocket();
  const { success, error, info } = useToast();

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (search.trim()) params.append('search', search.trim());

      const data = await API.get(`/admin/orders?${params.toString()}`);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, search]);

  // Real-time events
  useEffect(() => {
    joinAdminRoom();

    if (socket) {
      const handleNew = (order) => {
        info(`New order #${order.orderNumber} added to queue`);
        fetchOrders();
      };
      const handleUpdate = () => {
        fetchOrders();
      };

      socket.on('new_order_received', handleNew);
      socket.on('admin_order_updated', handleUpdate);

      return () => {
        socket.off('new_order_received', handleNew);
        socket.off('admin_order_updated', handleUpdate);
      };
    }
  }, [socket]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await API.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      success(`Order updated to "${newStatus}" & live-synced to customer!`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      error(err.message || 'Failed to update order status');
    }
  };

  const statusOptions = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];
  const filterTabs = ['All', ...statusOptions];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Order Received':
        return <span className="badge badge-special">Order Received</span>;
      case 'In Kitchen':
        return <span className="badge" style={{ background: 'rgba(255, 94, 58, 0.2)', color: '#FF5E3A' }}>🔥 In Kitchen</span>;
      case 'Sent to Delivery':
        return <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA' }}>🛵 Sent to Delivery</span>;
      case 'Delivered':
        return <span className="badge badge-veg">✅ Delivered</span>;
      case 'Cancelled':
        return <span className="badge badge-nonveg">❌ Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '900' }}>Live Order Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time kitchen order dispatch and status pipeline control.
          </p>
        </div>

        <button onClick={fetchOrders} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Toolbar: Filters & Search */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        {/* Status Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: selectedStatus === tab ? 'var(--primary)' : 'var(--border-subtle)',
                background: selectedStatus === tab ? 'var(--primary)' : 'var(--bg-elevated)',
                color: selectedStatus === tab ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '42px' }}
            placeholder="Search Order # or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List Table */}
      {loading ? (
        <Loader text="Loading live orders..." />
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem' }}>No Orders in Queue</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No orders match your current filter criteria.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem' }}>Order # & Date</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Items Summary</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Transition Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>#{order.orderNumber}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <p style={{ fontWeight: '700', color: '#fff' }}>{order.user?.name || 'Customer'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.deliveryAddress?.phone}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </p>
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {order.items?.map((item, idx) => (
                        <span key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <strong>{item.quantity}x</strong> {item.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: '1rem', fontWeight: '900', color: '#fff', fontSize: '1rem' }}>
                    ₹{order.totalAmount}
                  </td>

                  <td style={{ padding: '1rem' }}>
                    {getStatusBadge(order.orderStatus)}
                  </td>

                  {/* Status Dropdown Transition */}
                  <td style={{ padding: '1rem' }}>
                    <select
                      className="form-select"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem 0.7rem' }}
                      title="View Full Itemized Breakdown"
                    >
                      <Eye size={15} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber} Details`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer</p>
                <h4 style={{ fontWeight: '800' }}>{selectedOrder.user?.name} ({selectedOrder.user?.email})</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedOrder.deliveryAddress?.phone}</p>
              </div>
              <div>{getStatusBadge(selectedOrder.orderStatus)}</div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Delivery Address</p>
              <p style={{ fontSize: '0.9rem', color: '#fff' }}>
                {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.zipCode}
              </p>
              {selectedOrder.customerNotes && (
                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                  Kitchen Note: "{selectedOrder.customerNotes}"
                </p>
              )}
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.4rem' }}>
                Customized Items
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div>
                      <p style={{ fontWeight: '800', color: '#fff' }}>{item.quantity}x {item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Crust: {item.customBase} &bull; Sauce: {item.customSauce} &bull; Cheese: {item.customCheese}
                      </p>
                      {item.customVeggies?.length > 0 && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
                          Toppings: {item.customVeggies.join(', ')}
                        </p>
                      )}
                    </div>
                    <span style={{ fontWeight: '800' }}>₹{item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '900' }}>
              <span>Total Amount:</span>
              <span style={{ color: 'var(--primary)' }}>₹{selectedOrder.totalAmount}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
