import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import API from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';

export const AdminInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'base',
    quantity: 100,
    unit: 'portions',
    lowStockThreshold: 20,
    priceModifier: 0,
    description: '',
  });

  const { socket, joinAdminRoom } = useSocket();
  const { success, error, info } = useToast();

  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (search.trim()) params.append('search', search.trim());

      const data = await API.get(`/inventory?${params.toString()}`);
      setInventory(data.inventory || []);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedCategory, search]);

  useEffect(() => {
    joinAdminRoom();

    if (socket) {
      const handleInvUpdate = (updatedItem) => {
        setInventory((prev) =>
          prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
        );
      };

      socket.on('inventory_updated', handleInvUpdate);

      return () => {
        socket.off('inventory_updated', handleInvUpdate);
      };
    }
  }, [socket]);

  const handleRestock = async (itemId, amount) => {
    try {
      const data = await API.post(`/inventory/${itemId}/restock`, { amount });
      success(data.message || `Added +${amount} portions!`);
      fetchInventory();
    } catch (err) {
      error(err.message || 'Restock failed');
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await API.patch(`/inventory/${editingItem._id}`, formData);
        success(`Updated ${formData.name} successfully!`);
      } else {
        await API.post('/inventory', formData);
        success(`Added ${formData.name} to inventory!`);
      }

      setShowAddModal(false);
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'base',
        quantity: 100,
        unit: 'portions',
        lowStockThreshold: 20,
        priceModifier: 0,
        description: '',
      });
      fetchInventory();
    } catch (err) {
      error(err.message || 'Save failed');
    }
  };

  const handleDelete = async (itemId, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    try {
      await API.delete(`/inventory/${itemId}`);
      success(`Deleted ${name}`);
      fetchInventory();
    } catch (err) {
      error(err.message || 'Delete failed');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold,
      priceModifier: item.priceModifier,
      description: item.description || '',
    });
    setShowAddModal(true);
  };

  const categories = ['All', 'base', 'sauce', 'cheese', 'veggie'];

  return (
    <div className="max-w-7xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2.5rem',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '900' }}>Inventory Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time stock monitoring, automated deduction tracking & safety threshold controls.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              name: '',
              category: 'base',
              quantity: 100,
              unit: 'portions',
              lowStockThreshold: 20,
              priceModifier: 0,
              description: '',
            });
            setShowAddModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add New Ingredient</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border-subtle)',
                background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-elevated)',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {cat === 'All' ? '📦 All Categories' : `${cat}s`}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '42px' }}
            placeholder="Search ingredient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Inventory Grid Table */}
      {loading ? (
        <Loader text="Loading live inventory database..." />
      ) : inventory.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.5rem' }}>No Inventory Items</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No ingredients match the selected filter.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem' }}>Ingredient Name</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Current Stock Level</th>
                <th style={{ padding: '1rem' }}>Safety Threshold</th>
                <th style={{ padding: '1rem' }}>Price Add-on</th>
                <th style={{ padding: '1rem' }}>Quick Restock</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const isLow = item.quantity <= item.lowStockThreshold;
                const stockPercent = Math.min(100, Math.round((item.quantity / (item.lowStockThreshold * 3)) * 100));

                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <p style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>{item.name}</p>
                        {isLow && (
                          <span className="badge badge-low-stock" title="Low Stock Warning">
                            <AlertTriangle size={11} /> Low
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '240px' }}>
                          {item.description}
                        </p>
                      )}
                    </td>

                    <td style={{ padding: '1rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {item.category}
                    </td>

                    {/* Stock Level Bar */}
                    <td style={{ padding: '1rem', minWidth: '160px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        <strong style={{ color: isLow ? '#EF4444' : '#fff' }}>
                          {item.quantity} {item.unit}
                        </strong>
                        <span style={{ color: 'var(--text-muted)' }}>{stockPercent}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${stockPercent}%`,
                          height: '100%',
                          background: isLow ? '#EF4444' : stockPercent < 50 ? '#F59E0B' : '#10B981',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      Min {item.lowStockThreshold} {item.unit}
                    </td>

                    <td style={{ padding: '1rem', fontWeight: '700', color: item.priceModifier > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      {item.priceModifier > 0 ? `+₹${item.priceModifier}` : '₹0'}
                    </td>

                    {/* Quick Restock Buttons */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleRestock(item._id, 10)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          title="Restock +10"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleRestock(item._id, 50)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          title="Restock +50"
                        >
                          +50
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditModal(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.4rem' }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.4rem', color: '#EF4444' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Ingredient Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={editingItem ? `Edit ${editingItem.name}` : 'Add New Ingredient'}
        >
          <form onSubmit={handleSaveItem}>
            <div className="form-group">
              <label className="form-label">Ingredient Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Buffalo Mozzarella"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="base">Pizza Base (Crust)</option>
                  <option value="sauce">Sauce Spread</option>
                  <option value="cheese">Cheese</option>
                  <option value="veggie">Vegetable / Topping</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measure</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="portions, crusts, ladles"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Current Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  min={0}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Low Stock Threshold *</label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Price Modifier (₹ Add-on)</label>
              <input
                type="number"
                className="form-input"
                min={0}
                value={formData.priceModifier}
                onChange={(e) => setFormData({ ...formData, priceModifier: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Brief notes regarding flavor, origin, or preparation..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingItem ? 'Update Ingredient' : 'Create Ingredient'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
