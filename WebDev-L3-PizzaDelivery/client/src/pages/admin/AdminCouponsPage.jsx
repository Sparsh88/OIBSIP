import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  Gift,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import API from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { AdminNav } from '../../components/AdminNav';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    tagline: 'SPECIAL PROMO',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrder: '0',
    maxDiscount: '',
    isActive: true,
  });

  const { success, error, info } = useToast();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await API.get('/coupons?all=true');
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
      error('Failed to load promotional coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      title: '',
      tagline: 'WEEKEND SPECIAL',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minOrder: '0',
      maxDiscount: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      title: coupon.title || '',
      tagline: coupon.tagline || 'SPECIAL PROMO',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '',
      minOrder: coupon.minOrder !== undefined ? coupon.minOrder : '0',
      maxDiscount: coupon.maxDiscount || '',
      isActive: coupon.isActive !== undefined ? Boolean(coupon.isActive) : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.title || !formData.description || formData.discountValue === '') {
      error('Please complete all required fields (Code, Title, Description, Discount Value)');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingCoupon) {
        // Update
        const data = await API.patch(`/coupons/${editingCoupon._id}`, formData);
        success(`Coupon "${data.coupon?.code || formData.code}" updated successfully!`);
      } else {
        // Create
        const data = await API.post('/coupons', formData);
        success(`Coupon "${data.coupon?.code || formData.code}" created successfully!`);
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      console.error('Save coupon error:', err);
      error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const data = await API.patch(`/coupons/${coupon._id}/toggle`);
      success(data.message || 'Status updated');
      setCoupons((prev) =>
        prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      console.error('Toggle coupon status error:', err);
      error('Failed to update coupon status');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCoupon) return;
    try {
      await API.delete(`/coupons/${deleteConfirmCoupon._id}`);
      success(`Coupon "${deleteConfirmCoupon.code}" deleted`);
      setDeleteConfirmCoupon(null);
      fetchCoupons();
    } catch (err) {
      console.error('Delete coupon error:', err);
      error('Failed to delete coupon');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    info(`Copied code "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const code = coupon.code.toLowerCase();
    const title = coupon.title.toLowerCase();
    const desc = coupon.description ? coupon.description.toLowerCase() : '';
    const q = searchTerm.toLowerCase();
    return code.includes(q) || title.includes(q) || desc.includes(q);
  });

  return (
    <div className="max-w-7xl" style={{ padding: '3rem 1.5rem 5rem' }}>
      <AdminNav
        title="Promotional Coupons & Discounts"
        subtitle="Create, edit, toggle, or delete promotional codes and discount rates for checkout."
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
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search
            size={18}
            color="#9CA3AF"
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search coupons by code or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.75rem', height: '42px', fontSize: '0.9rem' }}
          />
        </div>

        {/* Create Button */}
        <button onClick={openAddModal} className="btn btn-primary btn-sm">
          <Plus size={17} />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons List */}
      {loading ? (
        <Loader text="Loading promotional coupons..." />
      ) : filteredCoupons.length === 0 ? (
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
          <Tag size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.5rem' }}>
            No Coupons Found
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            {searchTerm
              ? `No coupons match "${searchTerm}".`
              : 'There are currently no discount coupons created.'}
          </p>
          <button onClick={openAddModal} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Create First Coupon</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredCoupons.map((coupon) => (
            <div
              key={coupon._id}
              className="card card-hover-lift"
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid #E5E7EB',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                opacity: coupon.isActive ? 1 : 0.65,
                transition: 'all 0.25s',
              }}
            >
              {/* Header: Tagline & Status */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    background: '#FFF0F2',
                    color: '#C8102E',
                    border: '1px solid rgba(200, 16, 46, 0.2)',
                    padding: '0.2rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    letterSpacing: '0.5px',
                  }}
                >
                  {coupon.tagline || 'DEAL'}
                </span>

                <span
                  style={{
                    background: coupon.isActive ? '#DCFCE7' : '#FEE2E2',
                    color: coupon.isActive ? '#15803D' : '#B91C1C',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: '900',
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
                      background: coupon.isActive ? '#15803D' : '#B91C1C',
                    }}
                  />
                  {coupon.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              {/* Coupon Code Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#F9FAFB',
                  border: '1.5px dashed #D1D5DB',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 1rem',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: '"Impact", "Arial Black", "Outfit", sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: '900',
                    color: '#1E3F20',
                    letterSpacing: '1px',
                  }}
                >
                  {coupon.code}
                </span>

                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#4B5563',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                  }}
                  title="Copy Code"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check size={14} color="#16A34A" />
                      <span style={{ color: '#16A34A' }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title & Description */}
              <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1F2937', marginBottom: '0.35rem' }}>
                {coupon.title}
              </h4>
              <p style={{ color: '#6B7280', fontSize: '0.86rem', lineHeight: 1.45, marginBottom: '1.25rem', flex: 1 }}>
                {coupon.description}
              </p>

              {/* Discount & Threshold Badges */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.75rem 0',
                  borderTop: '1px solid #F3F4F6',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    color: '#1E3F20',
                    background: '#F0FDF4',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #DCFCE7',
                  }}
                >
                  {coupon.discountType === 'percentage'
                    ? `Save ${coupon.discountValue}% OFF`
                    : `Flat ₹${coupon.discountValue} OFF`}
                </span>

                {coupon.minOrder > 0 && (
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#4B5563',
                      background: '#F3F4F6',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                    }}
                  >
                    Min Order: ₹{coupon.minOrder}
                  </span>
                )}
              </div>

              {/* Controls */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '0.5rem',
                  alignItems: 'center',
                }}
              >
                <button
                  onClick={() => handleToggleStatus(coupon)}
                  style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    border: '1.5px solid',
                    borderColor: coupon.isActive ? '#FECACA' : '#BBF7D0',
                    background: coupon.isActive ? '#FEF2F2' : '#F0FDF4',
                    color: coupon.isActive ? '#DC2626' : '#16A34A',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {coupon.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <button
                  onClick={() => openEditModal(coupon)}
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
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmCoupon(coupon)}
                  style={{
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#FFF0F2',
                    color: '#C8102E',
                    border: '1.5px solid rgba(200, 16, 46, 0.2)',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Coupon Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
          maxWidth="560px"
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Code */}
              <div className="form-group">
                <label className="form-label">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH50"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}
                />
              </div>

              {/* Tagline */}
              <div className="form-group">
                <label className="form-label">Tagline Badge</label>
                <input
                  type="text"
                  placeholder="e.g. WEEKEND SPECIAL"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Title */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Offer Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 50% OFF Weekend Mega Feast"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Discount Type */}
              <div className="form-group">
                <label className="form-label">Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="form-select"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div className="form-group">
                <label className="form-label">
                  {formData.discountType === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : '10000'}
                  step="1"
                  placeholder={formData.discountType === 'percentage' ? 'e.g. 50 for 50%' : 'e.g. 150 for ₹150'}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Minimum Order */}
              <div className="form-group">
                <label className="form-label">Minimum Order (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 499 (0 for no minimum)"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Max Discount Limit */}
              <div className="form-group">
                <label className="form-label">Max Discount Cap (₹, Optional)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 200 (optional)"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Description */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Terms & Description *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Get 50% discount on orders of ₹499 or more..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              {/* Active Toggle */}
              <div
                style={{
                  gridColumn: 'span 2',
                  padding: '0.75rem 1rem',
                  background: '#F9FAFB',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #E5E7EB',
                }}
              >
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#1E3F20' }}
                  />
                  <span>Active & available for customer checkout</span>
                </label>
              </div>
            </div>

            {/* Actions */}
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
                {formSubmitting ? 'Saving Coupon...' : editingCoupon ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCoupon && (
        <Modal
          isOpen={Boolean(deleteConfirmCoupon)}
          onClose={() => setDeleteConfirmCoupon(null)}
          title="Confirm Delete Coupon"
          maxWidth="440px"
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
              Delete Coupon "{deleteConfirmCoupon.code}"?
            </h4>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              This coupon will be permanently removed. Customers will no longer be able to apply this code at checkout.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => setDeleteConfirmCoupon(null)}
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
                Yes, Delete Coupon
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
