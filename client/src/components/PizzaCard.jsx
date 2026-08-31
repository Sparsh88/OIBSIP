import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Info, ChevronDown, User, Users } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const PizzaCard = ({ pizza }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState('Large');
  const [selectedCrust, setSelectedCrust] = useState('Original Crust');

  const isExtra = pizza.category === 'Extras';
  const isDessert = pizza.category === 'Desserts';
  const isBeverage = pizza.category === 'Beverages';
  const isPurePizza = pizza.category === 'Pizzas';
  const isProtein = pizza.category === 'Protein Packed';

  const sizeMultipliers = {
    Regular: 0.8,
    Medium: 1.0,
    Large: 1.3,
  };

  const crustModifiers = {
    'Original Crust': 0,
    'Thin Crust': 0,
    'Cheese Burst': 60,
    'Whole Wheat': 30,
  };

  const currentPrice = isPurePizza
    ? Math.round(pizza.basePrice * (sizeMultipliers[selectedSize] || 1) + (crustModifiers[selectedCrust] || 0))
    : pizza.basePrice;

  const handleQuickAdd = () => {
    const itemName = isPurePizza
      ? `${pizza.name} (${selectedSize}, ${selectedCrust})`
      : pizza.name;

    addToCart({
      pizza: pizza._id,
      name: itemName,
      image: pizza.image,
      customBase: selectedCrust || pizza.defaultBase || 'Original Crust',
      customSauce: pizza.defaultSauce || 'Classic Tomato Basil',
      customCheese: pizza.defaultCheese || 'Mozzarella',
      customVeggies: pizza.defaultVeggies || [],
      unitPrice: currentPrice,
      quantity: 1,
    });
    success(`Added ${itemName} to cart!`);
  };

  const isVeg =
    pizza.pizzaType === 'Veg' ||
    pizza.category === 'Extras' ||
    pizza.category === 'Desserts' ||
    pizza.category === 'Beverages' ||
    pizza.category === 'Sides';

  // Beverage background colors matching product brand colors
  const getBeverageBg = (name) => {
    const upper = name.toUpperCase();
    if (upper.includes('FANTA')) return 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)';
    if (upper.includes('SPRITE')) return 'linear-gradient(135deg, #15803D 0%, #166534 100%)';
    if (upper.includes('THUMS')) return 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)';
    return 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)';
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.25s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 24px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* 1. TOP IMAGE CONTAINER WITH HEART */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '215px',
          background: isBeverage ? getBeverageBg(pizza.name) : '#F3F4F6',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={pizza.image}
          alt={pizza.name}
          style={{
            width: isBeverage ? '88%' : '100%',
            height: isBeverage ? '92%' : '100%',
            objectFit: isBeverage ? 'contain' : 'cover',
            transition: 'transform 0.4s ease',
          }}
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Favorite Heart Button (Top Right) */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            transition: 'transform 0.2s',
          }}
          aria-label="Save to favorites"
        >
          <Heart
            size={17}
            color={isLiked ? '#C8102E' : '#6B7280'}
            fill={isLiked ? '#C8102E' : 'none'}
          />
        </button>
      </div>

      {/* 2. CARD CONTENT AREA */}
      <div
        style={{
          padding: '1.15rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Title & Veg/Non-veg Dot with Info Icon & Servings */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.35rem',
          }}
        >
          <h3
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: '1.05rem',
              fontWeight: '900',
              color: '#1F2937',
              textTransform: 'uppercase',
              lineHeight: 1.25,
            }}
          >
            {pizza.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {/* Veg / Non-Veg Box Symbol */}
              <div
                style={{
                  width: '15px',
                  height: '15px',
                  border: `1.5px solid ${isVeg ? '#2E7D32' : '#C8102E'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '3px',
                  padding: '2px',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: isVeg ? '50%' : '0',
                    background: isVeg ? '#2E7D32' : '#C8102E',
                  }}
                />
              </div>
              <Info size={14} color="#9CA3AF" />
            </div>

            {/* Servings Indicator (👥 2-4 or 👤 1) */}
            {pizza.servings && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#6B7280',
                }}
              >
                {pizza.servings === '1' ? <User size={12} /> : <Users size={12} />}
                <span>{pizza.servings}</span>
              </div>
            )}
          </div>
        </div>

        {/* Short Description */}
        <p
          style={{
            fontSize: '0.8rem',
            color: '#6B7280',
            lineHeight: 1.45,
            marginBottom: isPurePizza ? '0.85rem' : '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {pizza.description}
        </p>

        {/* TWO SIDE-BY-SIDE DROPDOWNS: (Select Size & Select Crust) */}
        {isPurePizza && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            {/* Select Size Dropdown */}
            <div>
              <label
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#6B7280',
                  display: 'block',
                  marginBottom: '0.2rem',
                }}
              >
                Select Size
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    color: '#1F2937',
                    appearance: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="Regular">Regular</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
                <ChevronDown
                  size={13}
                  color="#6B7280"
                  style={{ position: 'absolute', right: '6px', top: '9px', pointerEvents: 'none' }}
                />
              </div>
            </div>

            {/* Select Crust Dropdown */}
            <div>
              <label
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#6B7280',
                  display: 'block',
                  marginBottom: '0.2rem',
                }}
              >
                Select Crust
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedCrust}
                  onChange={(e) => setSelectedCrust(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.4rem 0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    color: '#1F2937',
                    appearance: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="Original Crust">Original Crust</option>
                  <option value="Thin Crust">Thin Crust</option>
                  <option value="Cheese Burst">Cheese Burst</option>
                  <option value="Whole Wheat">Whole Wheat</option>
                </select>
                <ChevronDown
                  size={13}
                  color="#6B7280"
                  style={{ position: 'absolute', right: '6px', top: '9px', pointerEvents: 'none' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. BOTTOM PRICE & DEEP FOREST GREEN ADD TO CART BUTTON */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid #F3F4F6',
          }}
        >
          <span
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: '1.25rem',
              fontWeight: '900',
              color: '#1F2937',
            }}
          >
            ₹ {currentPrice.toFixed(2)}
          </span>

          <button
            onClick={handleQuickAdd}
            style={{
              background: '#1E3F20',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 1.35rem',
              fontSize: '0.88rem',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30, 63, 32, 0.25)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#152C16';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#1E3F20';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};
