import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const AVAILABLE_COUPONS = [
  {
    code: 'BOGO2026',
    title: 'Buy 1 Get 1 FREE',
    tagline: 'WEEKEND SPECIAL',
    description: 'Get 50% OFF on your entire order subtotal',
    discountType: 'percentage',
    discountValue: 50,
  },
  {
    code: 'CUSTOM30',
    title: 'Flat 30% OFF',
    tagline: 'SPECIAL GOURMET OFFER',
    description: 'Flat 30% OFF on artisan handcrafted pizzas',
    discountType: 'percentage',
    discountValue: 30,
  },
  {
    code: 'FEAST499',
    title: 'Feast Deal @ ₹499',
    tagline: 'PARTY FEAST COMBO',
    description: 'Flat ₹150 OFF on orders of ₹499 or more',
    discountType: 'fixed',
    discountValue: 150,
    minOrder: 499,
  },
  {
    code: 'FREEBREAD',
    title: 'Free Garlic Breadsticks',
    tagline: 'WELCOME BONUS',
    description: 'Enjoy ₹149 OFF (Free Garlic Breadsticks value)',
    discountType: 'fixed',
    discountValue: 149,
  },
];

export const CartProvider = ({ children }) => {
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
        return (
          item.name === newItem.name &&
          item.customBase === newItem.customBase &&
          item.customSauce === newItem.customSauce &&
          item.customCheese === newItem.customCheese &&
          JSON.stringify(item.customVeggies?.sort()) === JSON.stringify(newItem.customVeggies?.sort())
        );
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + (newItem.quantity || 1);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: updated[existingIndex].unitPrice * newQty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          ...newItem,
          quantity: newItem.quantity || 1,
          totalPrice: (newItem.unitPrice || 299) * (newItem.quantity || 1),
        },
      ];
    });
  };

  const resolveItemIndex = (target, items) => {
    if (typeof target === 'number') {
      return target >= 0 && target < items.length ? target : -1;
    }
    if (typeof target === 'string') {
      return items.findIndex((item) => item._id === target || item.name === target);
    }
    if (target && typeof target === 'object') {
      return items.findIndex(
        (item) =>
          item === target ||
          (item._id && item._id === target._id) ||
          item.name === target.name
      );
    }
    return -1;
  };

  const removeFromCart = (target) => {
    setCartItems((prev) => {
      const idx = resolveItemIndex(target, prev);
      if (idx === -1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateQuantity = (target, change) => {
    setCartItems((prev) => {
      const idx = resolveItemIndex(target, prev);
      if (idx === -1) return prev;

      const updated = [...prev];
      const current = updated[idx];

      let newQty;
      // If change is -1 or +1 (relative delta)
      if (change === 1 || change === -1) {
        newQty = current.quantity + change;
      } else if (typeof change === 'number') {
        // If change is target absolute value (e.g. current.quantity - 1)
        newQty = change;
      } else {
        newQty = current.quantity + 1;
      }

      if (newQty <= 0) {
        return updated.filter((_, i) => i !== idx);
      }

      updated[idx] = {
        ...current,
        quantity: newQty,
        totalPrice: current.unitPrice * newQty,
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
    const code = appliedCoupon.code?.toUpperCase();
    if (code === 'BOGO2026') {
      discountAmount = Math.round(subtotal * 0.5); // 50% OFF
    } else if (code === 'CUSTOM30') {
      discountAmount = Math.round(subtotal * 0.3); // 30% OFF
    } else if (code === 'FEAST499') {
      discountAmount = subtotal >= 499 ? 150 : Math.min(subtotal, 100); // ₹150 OFF
    } else if (code === 'FREEBREAD') {
      discountAmount = Math.min(subtotal, 149); // ₹149 OFF
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
    const found = AVAILABLE_COUPONS.find((c) => c.code === code);

    if (!found) {
      return {
        success: false,
        message: `Coupon "${code}" is invalid or expired. Try BOGO2026, CUSTOM30, FEAST499, or FREEBREAD.`,
      };
    }

    setAppliedCoupon(found);
    return {
      success: true,
      coupon: found,
      message: `Coupon "${found.code}" applied! You saved with ${found.title}.`,
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
