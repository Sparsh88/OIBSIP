import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const CartContext = createContext(null);

export const DEFAULT_COUPONS = [
  {
    code: 'BOGO2026',
    title: 'Buy 1 Get 1 FREE',
    tagline: 'WEEKEND SPECIAL',
    description: 'Get 50% OFF on your entire order subtotal',
    discountType: 'percentage',
    discountValue: 50,
    minOrder: 0,
    isActive: true,
  },
  {
    code: 'CUSTOM30',
    title: 'Flat 30% OFF',
    tagline: 'SPECIAL GOURMET OFFER',
    description: 'Flat 30% OFF on artisan handcrafted pizzas',
    discountType: 'percentage',
    discountValue: 30,
    minOrder: 0,
    isActive: true,
  },
  {
    code: 'FEAST499',
    title: 'Feast Deal @ ₹499',
    tagline: 'PARTY FEAST COMBO',
    description: 'Flat ₹150 OFF on orders of ₹499 or more',
    discountType: 'fixed',
    discountValue: 150,
    minOrder: 499,
    isActive: true,
  },
  {
    code: 'FREEBREAD',
    title: 'Free Garlic Breadsticks',
    tagline: 'WELCOME BONUS',
    description: 'Enjoy ₹149 OFF (Free Garlic Breadsticks value)',
    discountType: 'fixed',
    discountValue: 149,
    minOrder: 0,
    isActive: true,
  },
];

export const AVAILABLE_COUPONS = DEFAULT_COUPONS;

export const CartProvider = ({ children }) => {
  const [couponsList, setCouponsList] = useState(DEFAULT_COUPONS);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('pizzanest_cart') || localStorage.getItem('pizzaro_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('pizzanest_coupon') || localStorage.getItem('pizzaro_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch active coupons from API
  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        const data = await API.get('/coupons');
        if (data.coupons && data.coupons.length > 0) {
          setCouponsList(data.coupons);
        }
      } catch (err) {
        console.warn('Could not load dynamic coupons, using fallback presets:', err);
      }
    };

    fetchActiveCoupons();
  }, []);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('pizzanest_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  // Sync coupon to local storage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('pizzanest_coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('pizzanest_coupon');
      }
    } catch (e) {
      console.warn('Failed to save coupon to localStorage:', e);
    }
  }, [appliedCoupon]);

  const addToCart = (newItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const sameId = item._id === newItem._id;
        const sameSize = item.size === newItem.size;
        const sameCrust = item.crust === newItem.crust;
        const sameCustom = JSON.stringify(item.customization || {}) === JSON.stringify(newItem.customization || {});
        return sameId && sameSize && sameCrust && sameCustom;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        const exist = updated[existingIndex];
        const nextQty = (exist.quantity || 1) + (newItem.quantity || 1);
        const unitPrice = exist.unitPrice || exist.price || 0;
        updated[existingIndex] = {
          ...exist,
          quantity: nextQty,
          totalPrice: unitPrice * nextQty,
        };
        return updated;
      }

      const qty = newItem.quantity || 1;
      const unitPrice = newItem.unitPrice || newItem.price || newItem.basePrice || 0;
      return [
        ...prev,
        {
          ...newItem,
          quantity: qty,
          unitPrice,
          totalPrice: unitPrice * qty,
        },
      ];
    });
  };

  const removeFromCart = (indexOrItem) => {
    setCartItems((prev) => {
      if (typeof indexOrItem === 'number') {
        return prev.filter((_, idx) => idx !== indexOrItem);
      }
      return prev.filter((item) => item !== indexOrItem && item._id !== indexOrItem._id);
    });
  };

  const updateQuantity = (index, deltaOrExact, isExact = false) => {
    setCartItems((prev) => {
      if (!prev[index]) return prev;
      const updated = [...prev];
      const currentItem = updated[index];
      const nextQty = isExact ? deltaOrExact : (currentItem.quantity || 1) + deltaOrExact;

      if (nextQty <= 0) {
        return prev.filter((_, idx) => idx !== index);
      }

      const unitPrice = currentItem.unitPrice || currentItem.price || currentItem.basePrice || (currentItem.totalPrice / (currentItem.quantity || 1));
      updated[index] = {
        ...currentItem,
        quantity: nextQty,
        unitPrice,
        totalPrice: unitPrice * nextQty,
      };
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('pizzanest_cart');
    localStorage.removeItem('pizzanest_coupon');
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  // Calculate discount amount based on applied coupon
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    const minReq = Number(appliedCoupon.minOrder) || 0;
    if (minReq > 0 && subtotal < minReq) {
      discountAmount = 0; // Subtotal below minimum order required
    } else if (appliedCoupon.discountType === 'percentage') {
      const calculated = Math.round((subtotal * Number(appliedCoupon.discountValue || 0)) / 100);
      discountAmount = appliedCoupon.maxDiscount
        ? Math.min(calculated, Number(appliedCoupon.maxDiscount))
        : calculated;
    } else {
      // Fixed discount amount
      discountAmount = Math.min(subtotal, Number(appliedCoupon.discountValue || 0));
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(discountedSubtotal * 0.05); // 5% GST on discounted amount
  const deliveryFee = discountedSubtotal > 500 || subtotal === 0 ? 0 : 40; // Free delivery above ₹500
  const totalAmount = discountedSubtotal + tax + deliveryFee;
  const totalItemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Apply Coupon Function
  const applyCoupon = (rawCode) => {
    if (!rawCode || typeof rawCode !== 'string') {
      return { success: false, message: 'Please enter a valid coupon code' };
    }

    const code = rawCode.trim().toUpperCase();
    const found = couponsList.find((c) => c.code === code && c.isActive !== false);

    if (!found) {
      return {
        success: false,
        message: `Coupon "${code}" is invalid, inactive, or expired.`,
      };
    }

    const minReq = Number(found.minOrder) || 0;
    if (minReq > 0 && subtotal < minReq) {
      return {
        success: false,
        message: `Coupon "${found.code}" requires a minimum order of ₹${minReq}. Add ₹${minReq - subtotal} more!`,
      };
    }

    setAppliedCoupon(found);
    return {
      success: true,
      coupon: found,
      message: `Coupon "${found.code}" applied successfully! You saved with ${found.title}.`,
    };
  };

  // Remove Coupon Function
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        availableCoupons: couponsList,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discountAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        tax,
        deliveryFee,
        totalAmount,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
