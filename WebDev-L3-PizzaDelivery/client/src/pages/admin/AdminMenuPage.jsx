import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  Clock,
  Pizza,
  Filter,
  DollarSign,
  AlertCircle,
  Tag,
} from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { AdminNav } from '../../components/AdminNav';

const CATEGORIES = [
  'All',
  'Pizzas',
  'Protein Packed',
  'Sides',
  'Beverages',
  'Desserts',
  'Extras',
];

export const AdminMenuPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'Pizzas',
    pizzaType: 'Veg',
    basePrice: '',
    description: '',
    image: '',
    preparationTime: '15-20 mins',
    servings: '1',
    isChefSpecial: false,
    isAvailable: true,
  });

  const { success, error, info } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await API.get('/pizzas?all=true');
      setItems(data.pizzas || []);
    } catch (err) {
      console.error('Failed to load menu items:', err);
      error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'Pizzas',
      pizzaType: 'Veg',
      basePrice: '',
      description: '',
      image: '',
      preparationTime: '15-20 mins',
      servings: '1',
      isChefSpecial: false,
      isAvailable: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'Pizzas',
      pizzaType: item.pizzaType || 'Veg',
      basePrice: item.basePrice || '',
      description: item.description || '',
      image: item.image || '',
      preparationTime: item.preparationTime || '15-20 mins',
      servings: item.servings || '1',
      isChefSpecial: Boolean(item.isChefSpecial),
      isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || formData.basePrice === '') {
      error('Please fill in all required fields (Name, Description, Price)');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingItem) {
        // Update
        const data = await API.patch(`/pizzas/${editingItem._id}`, formData);
        success(`Updated "${data.pizza?.name || formData.name}" successfully!`);
      } else {
        // Create
        const data = await API.post('/pizzas', formData);
        success(`Added "${data.pizza?.name || formData.name}" to menu!`);
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error('Save menu item error:', err);
      error(err.response?.data?.message || 'Failed to save menu item');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const data = await API.patch(`/pizzas/${item._id}/toggle-availability`);
      success(data.message || 'Availability updated');
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isAvailable: !i.isAvailable } : i))
      );
    } catch (err) {
      console.error('Toggle error:', err);
      error('Failed to update availability');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await API.delete(`/pizzas/${deleteConfirmItem._id}`);
      success(`Deleted "${deleteConfirmItem.name}" from menu`);
      setDeleteConfirmItem(null);
      fetchItems();
    } catch (err) {
      console.error('Delete error:', err);
      error('Failed to delete item');
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      <AdminNav
        title="Menu & Catalog Management"
        subtitle="Add, edit, reprice, or toggle availability for all pizzas, sides, beverages, and dips."
      />

      {/* Action & Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          background: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search
            size={18}
            color="#9CA3AF"
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search menu items by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.75rem', height: '42px', fontSize: '0.9rem' }}
          />
        </div>

        {/* Add Item Button */}
        <button onClick={openAddModal} className="btn btn-primary btn-sm">
          <Plus size={17} />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Category Pills Row */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {CATEGORIES.map((cat) => {
          const isCatActive = selectedCategory === cat;
          const count =
            cat === 'All' ? items.length : items.filter((i) => i.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.45rem 1.1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: '800',
                fontSize: '0.85rem',
                border: '1.5px solid',
                borderColor: isCatActive ? '#1E3F20' : '#E5E7EB',
                background: isCatActive ? '#1E3F20' : '#FFFFFF',
                color: isCatActive ? '#FFFFFF' : '#4B5563',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{cat}</span>
              <span
                style={{
                  background: isCatActive ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
                  color: isCatActive ? '#FFFFFF' : '#6B7280',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: '900',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Menu Items Table / Grid */}
      {loading ? (
        <Loader text="Loading menu catalog..." />
      ) : filteredItems.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid #E5E7EB',
          }}
        >
          <Pizza size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.5rem' }}>
            No Menu Items Found
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            {searchTerm
              ? `No items match "${searchTerm}". Try a different keyword.`
              : 'There are no items listed in this category.'}
          </p>
          <button onClick={openAddModal} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add First Item</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="card card-hover-lift"
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid #E5E7EB',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                opacity: item.isAvailable ? 1 : 0.65,
                transition: 'all 0.25s',
              }}
            >
              {/* Image & Header Badges */}
              <div style={{ position: 'relative', height: '170px', background: '#F9FAFB' }}>
                <img
                  src={item.image || '/images/special_garlic_sauce.jpg'}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Top Badges */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    left: '0.75rem',
                    display: 'flex',
                    gap: '0.4rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(4px)',
                      color: item.pizzaType === 'Non-Veg' ? '#C8102E' : '#2E7D32',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    {item.pizzaType}
                  </span>
                  <span
                    style={{
                      background: 'rgba(31, 41, 55, 0.85)',
                      color: '#FFFFFF',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                    }}
                  >
                    {item.category}
                  </span>
                  {item.isChefSpecial && (
                    <span
                      style={{
                        background: '#FFF7ED',
                        color: '#EA580C',
                        border: '1px solid rgba(234, 88, 12, 0.3)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                      }}
                    >
                      ⭐ Chef Special
                    </span>
                  )}
                </div>

                {/* Availability Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      background: item.isAvailable ? '#DCFCE7' : '#FEE2E2',
                      color: item.isAvailable ? '#15803D' : '#B91C1C',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '900',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: item.isAvailable ? '#15803D' : '#B91C1C',
                      }}
                    />
                    {item.isAvailable ? 'ACTIVE' : 'OUT OF STOCK'}
                  </span>
                </div>
              </div>

              {/* Item Info Body */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <h4
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      color: '#1F2937',
                      lineHeight: 1.25,
                    }}
                  >
                    {item.name}
                  </h4>
                  <span
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: '900',
                      color: '#1E3F20',
                      marginLeft: '0.5rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ₹{item.basePrice}
                  </span>
                </div>

                <p
                  style={{
                    color: '#6B7280',
                    fontSize: '0.86rem',
                    lineHeight: 1.45,
                    marginBottom: '1rem',
                    flex: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.78rem',
                    color: '#9CA3AF',
                    marginBottom: '1.25rem',
                    borderTop: '1px solid #F3F4F6',
                    paddingTop: '0.75rem',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> {item.preparationTime || '15-20 mins'}
                  </span>
                  <span>•</span>
                  <span>Servings: {item.servings || '1'}</span>
                </div>

                {/* Card Action Controls */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    style={{
                      padding: '0.45rem 0.8rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      border: '1.5px solid',
                      borderColor: item.isAvailable ? '#FECACA' : '#BBF7D0',
                      background: item.isAvailable ? '#FEF2F2' : '#F0FDF4',
                      color: item.isAvailable ? '#DC2626' : '#16A34A',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
                  </button>

                  <button
                    onClick={() => openEditModal(item)}
                    style={{
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      background: '#F9FAFB',
                      color: '#1F2937',
                      border: '1.5px solid #E5E7EB',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                    title="Edit Item"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteConfirmItem(item)}
                    style={{
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-md)',
                      background: '#FFF0F2',
                      color: '#C8102E',
                      border: '1.5px solid rgba(200, 16, 46, 0.2)',
                      cursor: 'pointer',
                    }}
                    title="Delete Item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? `Edit Menu Item: ${editingItem.name}` : 'Add New Menu Item'}
          maxWidth="640px"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Item Name */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smoky Pepperoni Gourmet Pizza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-select"
                >
                  <option value="Pizzas">Pizzas</option>
                  <option value="Protein Packed">Protein Packed</option>
                  <option value="Sides">Sides & Breads</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Extras">Extras & Dips</option>
                </select>
              </div>

              {/* Pizza / Diet Type */}
              <div className="form-group">
                <label className="form-label">Dietary Type *</label>
                <select
                  value={formData.pizzaType}
                  onChange={(e) => setFormData({ ...formData, pizzaType: e.target.value })}
                  className="form-select"
                >
                  <option value="Veg">Vegetarian (Veg)</option>
                  <option value="Non-Veg">Non-Vegetarian (Non-Veg)</option>
                  <option value="Special">Special / Specialty</option>
                </select>
              </div>

              {/* Base Price */}
              <div className="form-group">
                <label className="form-label">Base Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g. 399"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Preparation Time */}
              <div className="form-group">
                <label className="form-label">Prep Time</label>
                <input
                  type="text"
                  placeholder="e.g. 15-20 mins"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Image URL */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Image URL / Asset Path</label>
                <input
                  type="text"
                  placeholder="e.g. /images/special_garlic_sauce.jpg or https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="form-input"
                />
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.25rem', display: 'block' }}>
                  Use local paths (e.g. <code>/images/coca_cola.jpg</code>) or high-res Unsplash links.
                </span>
              </div>

              {/* Description */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the crust, cheese blend, premium toppings, or taste notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              {/* Checkboxes: Chef Special & Available */}
              <div
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  gap: '2rem',
                  padding: '0.75rem 1rem',
                  background: '#F9FAFB',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #E5E7EB',
                }}
              >
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700' }}>
                  <input
                    type="checkbox"
                    checked={formData.isChefSpecial}
                    onChange={(e) => setFormData({ ...formData, isChefSpecial: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#EA580C' }}
                  />
                  <span>⭐ Chef Specialty Badge</span>
                </label>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700' }}>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#1E3F20' }}
                  />
                  <span>✅ Available for Order</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="btn btn-primary btn-sm"
              >
                {formSubmitting ? 'Saving Item...' : editingItem ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <Modal
          isOpen={Boolean(deleteConfirmItem)}
          onClose={() => setDeleteConfirmItem(null)}
          title="Confirm Delete Menu Item"
          maxWidth="460px"
        >
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FFF0F2',
                color: '#C8102E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Trash2 size={26} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.5rem' }}>
              Delete "{deleteConfirmItem.name}"?
            </h4>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              This item will be permanently removed from the catalog. Customers will no longer be able to view or order it.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  background: '#C8102E',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.5rem 1.4rem',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Yes, Delete Item
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
