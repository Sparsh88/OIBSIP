import React, { useState, useEffect } from 'react';
import { X, Check, ChefHat, Sparkles, AlertCircle, ShoppingBag, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

export const DEFAULT_CUSTOMIZER_OPTIONS = {
  bases: [
    { name: 'Thin Crust', priceModifier: 0, description: 'Crispy, lightweight artisan Italian style thin crust.' },
    { name: 'Classic Hand Tossed', priceModifier: 0, description: 'Soft, golden crust with fluffy interior and crisp outer edge.' },
    { name: 'Cheese Burst', priceModifier: 60, description: 'Molten liquid mozzarella cheese oozing from the center crust.' },
    { name: 'Whole Wheat', priceModifier: 30, description: '100% stone-ground whole grain high-fiber healthy crust.' },
    { name: 'Gluten Free', priceModifier: 50, description: 'Almond & tapioca blend naturally gluten-free dough.' },
  ],
  sauces: [
    { name: 'Classic Tomato', priceModifier: 0, description: 'San Marzano Italian tomatoes simmered with fresh Genovese basil.' },
    { name: 'Spicy Arrabbiata', priceModifier: 15, description: 'Fiery chili garlic infused slow-roasted tomato reduction.' },
    { name: 'Garlic Sauce', priceModifier: 25, description: 'Silky cream sauce with roasted whole garlic and white pepper.' },
    { name: 'BBQ Sauce', priceModifier: 20, description: 'Rich sweet and tangy hickory-smoked barbecue sauce.' },
    { name: 'Pesto Sauce', priceModifier: 35, description: 'Crushed sweet basil, pine nuts, garlic, and olive oil.' },
  ],
  cheeses: [
    { name: 'Mozzarella', priceModifier: 0, description: 'Whole milk shredded mozzarella with exceptional stretch.' },
    { name: 'Cheddar', priceModifier: 30, description: 'Sharp, bold Wisconsin aged yellow cheddar.' },
    { name: 'Parmesan', priceModifier: 40, description: 'Finely grated authentic aged Italian hard cheese.' },
    { name: 'Vegan Cheese', priceModifier: 50, description: '100% plant-based dairy-free melts smoothly.' },
  ],
  veggies: [
    { name: 'Onion', priceModifier: 15, description: 'Crisp caramelized sweet red onion slices.' },
    { name: 'Capsicum', priceModifier: 15, description: 'Fresh crunchy green bell peppers.' },
    { name: 'Mushroom', priceModifier: 25, description: 'Earthy freshly sliced button mushrooms.' },
    { name: 'Sweet Corn', priceModifier: 20, description: 'Tender juicy sweet yellow American corn kernels.' },
    { name: 'Jalapeño', priceModifier: 20, description: 'Spicy tangy sliced pickled jalapeño peppers.' },
    { name: 'Black Olives', priceModifier: 30, description: 'Rich Spanish pitted black olive rings.' },
    { name: 'Tomato', priceModifier: 15, description: 'Fresh farm juicy diced tomatoes.' },
  ],
};

export const PizzaCustomizerModal = ({ isOpen, onClose, pizza }) => {
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [options, setOptions] = useState(DEFAULT_CUSTOMIZER_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Base, 2: Sauce, 3: Cheese, 4: Veggies

  // Customization selection state
  const [selectedBase, setSelectedBase] = useState('Classic Hand Tossed');
  const [selectedSauce, setSelectedSauce] = useState('Classic Tomato');
  const [selectedCheese, setSelectedCheese] = useState('Mozzarella');
  const [selectedVeggies, setSelectedVeggies] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!pizza) return;

    // Reset defaults whenever pizza changes
    setSelectedBase(pizza.defaultBase || 'Classic Hand Tossed');
    setSelectedSauce(pizza.defaultSauce || 'Classic Tomato');
    setSelectedCheese(pizza.defaultCheese || 'Mozzarella');
    setSelectedVeggies(Array.isArray(pizza.defaultVeggies) ? pizza.defaultVeggies : []);
    setQuantity(1);
    setActiveStep(1);

    // Fetch dynamic options from API
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const data = await API.get('/pizzas/customizer/options');
        if (data.options) {
          setOptions({
            bases: data.options.bases?.length ? data.options.bases : DEFAULT_CUSTOMIZER_OPTIONS.bases,
            sauces: data.options.sauces?.length ? data.options.sauces : DEFAULT_CUSTOMIZER_OPTIONS.sauces,
            cheeses: data.options.cheeses?.length ? data.options.cheeses : DEFAULT_CUSTOMIZER_OPTIONS.cheeses,
            veggies: data.options.veggies?.length ? data.options.veggies : DEFAULT_CUSTOMIZER_OPTIONS.veggies,
          });
        }
      } catch (err) {
        console.warn('Using fallback preset options for customizer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [pizza, isOpen]);

  if (!isOpen || !pizza) return null;

  // Pricing math
  const basePrice = Number(pizza.basePrice) || 299;

  const currentBaseObj = options.bases.find((b) => b.name.toLowerCase() === selectedBase.toLowerCase());
  const currentSauceObj = options.sauces.find((s) => s.name.toLowerCase() === selectedSauce.toLowerCase());
  const currentCheeseObj = options.cheeses.find((c) => c.name.toLowerCase() === selectedCheese.toLowerCase());

  const basePriceModifier = currentBaseObj ? Number(currentBaseObj.priceModifier || 0) : 0;
  const saucePriceModifier = currentSauceObj ? Number(currentSauceObj.priceModifier || 0) : 0;
  const cheesePriceModifier = currentCheeseObj ? Number(currentCheeseObj.priceModifier || 0) : 0;

  const veggiesPriceModifier = selectedVeggies.reduce((sum, vegName) => {
    const found = options.veggies.find((v) => v.name.toLowerCase() === vegName.toLowerCase());
    return sum + (found ? Number(found.priceModifier || 0) : 15);
  }, 0);

  const customizationCost = basePriceModifier + saucePriceModifier + cheesePriceModifier + veggiesPriceModifier;
  const unitPrice = basePrice + customizationCost;
  const finalPrice = unitPrice * quantity;

  // Handlers for veggies multi-select
  const toggleVeggie = (vegName) => {
    setSelectedVeggies((prev) => {
      const exists = prev.some((item) => item.toLowerCase() === vegName.toLowerCase());
      if (exists) {
        return prev.filter((item) => item.toLowerCase() !== vegName.toLowerCase());
      } else {
        return [...prev, vegName];
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedBase) {
      error('Please select a pizza base to proceed');
      setActiveStep(1);
      return;
    }
    if (!selectedSauce) {
      error('Please select a sauce to proceed');
      setActiveStep(2);
      return;
    }
    if (!selectedCheese) {
      error('Please select a cheese option to proceed');
      setActiveStep(3);
      return;
    }

    const itemToAdd = {
      pizza: pizza._id,
      name: pizza.name,
      image: pizza.image,
      basePrice,
      customizationCost,
      customBase: selectedBase,
      customSauce: selectedSauce,
      customCheese: selectedCheese,
      customVeggies: selectedVeggies,
      unitPrice,
      quantity,
      totalPrice: finalPrice,
    };

    addToCart(itemToAdd);
    success(`Customized ${pizza.name} added to your cart! 🍕`);
    onClose();
  };

  const steps = [
    { id: 1, label: '1. Crust Base', desc: 'Select 1 Base' },
    { id: 2, label: '2. Sauce', desc: 'Select 1 Sauce' },
    { id: 3, label: '3. Cheese', desc: 'Select 1 Cheese' },
    { id: 4, label: '4. Vegetables', desc: 'Multi-Select' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(135deg, #1E3F20 0%, #152C16 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChefHat size={24} color="#F59E0B" />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: '1.35rem',
                  fontWeight: '900',
                  color: '#FFFFFF',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                Customize Your Pizza
                <Sparkles size={18} color="#F59E0B" />
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#D1D5DB', margin: 0 }}>
                Build your perfect slice for {pizza.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP PROGRESS NAVIGATION TABS */}
        <div
          style={{
            display: 'flex',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            overflowX: 'auto',
            padding: '0 1rem',
          }}
        >
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                style={{
                  flex: 1,
                  minWidth: '130px',
                  padding: '0.85rem 0.75rem',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #1E3F20' : '3px solid transparent',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: isActive ? '900' : '700',
                    color: isActive ? '#1E3F20' : '#64748B',
                  }}
                >
                  {step.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: isActive ? '#152C16' : '#94A3B8' }}>
                  {step.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* MODAL MAIN CONTENT GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            flex: 1,
            overflow: 'hidden',
          }}
          className="customizer-modal-body"
        >
          {/* LEFT: SELECTION SECTIONS */}
          <div
            style={{
              padding: '1.5rem 1.75rem',
              overflowY: 'auto',
              maxHeight: '65vh',
            }}
          >
            {/* STEP 1: PIZZA BASE SELECTION */}
            {activeStep === 1 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1E293B', marginBottom: '0.2rem' }}>
                    1. Select Pizza Crust Base
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    Choose 1 base option for your pizza crust:
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {options.bases.map((base) => {
                    const isSelected = selectedBase.toLowerCase() === base.name.toLowerCase();
                    return (
                      <div
                        key={base.name}
                        onClick={() => setSelectedBase(base.name)}
                        style={{
                          padding: '1rem 1.15rem',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid #1E3F20' : '1.5px solid #E2E8F0',
                          background: isSelected ? 'rgba(30, 63, 32, 0.04)' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 12px rgba(30, 63, 32, 0.08)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              border: isSelected ? '6px solid #1E3F20' : '2px solid #CBD5E1',
                              background: '#FFFFFF',
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <span style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A', display: 'block' }}>
                              {base.name}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{base.description}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            color: base.priceModifier > 0 ? '#C8102E' : '#166534',
                            background: base.priceModifier > 0 ? '#FFF1F2' : '#F0FDF4',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {base.priceModifier > 0 ? `+ ₹${base.priceModifier}` : 'Free'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: SAUCE SELECTION */}
            {activeStep === 2 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1E293B', marginBottom: '0.2rem' }}>
                    2. Select Pizza Sauce
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    Choose 1 sauce spread for your artisan pizza:
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {options.sauces.map((sauce) => {
                    const isSelected = selectedSauce.toLowerCase() === sauce.name.toLowerCase();
                    return (
                      <div
                        key={sauce.name}
                        onClick={() => setSelectedSauce(sauce.name)}
                        style={{
                          padding: '1rem 1.15rem',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid #1E3F20' : '1.5px solid #E2E8F0',
                          background: isSelected ? 'rgba(30, 63, 32, 0.04)' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 12px rgba(30, 63, 32, 0.08)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              border: isSelected ? '6px solid #1E3F20' : '2px solid #CBD5E1',
                              background: '#FFFFFF',
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <span style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A', display: 'block' }}>
                              {sauce.name}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{sauce.description}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            color: sauce.priceModifier > 0 ? '#C8102E' : '#166534',
                            background: sauce.priceModifier > 0 ? '#FFF1F2' : '#F0FDF4',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {sauce.priceModifier > 0 ? `+ ₹${sauce.priceModifier}` : 'Free'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: CHEESE SELECTION */}
            {activeStep === 3 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1E293B', marginBottom: '0.2rem' }}>
                    3. Select Cheese Layer
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    Choose your favorite cheese topping option:
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {options.cheeses.map((cheese) => {
                    const isSelected = selectedCheese.toLowerCase() === cheese.name.toLowerCase();
                    return (
                      <div
                        key={cheese.name}
                        onClick={() => setSelectedCheese(cheese.name)}
                        style={{
                          padding: '1rem 1.15rem',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid #1E3F20' : '1.5px solid #E2E8F0',
                          background: isSelected ? 'rgba(30, 63, 32, 0.04)' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 12px rgba(30, 63, 32, 0.08)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              border: isSelected ? '6px solid #1E3F20' : '2px solid #CBD5E1',
                              background: '#FFFFFF',
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <span style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A', display: 'block' }}>
                              {cheese.name}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{cheese.description}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: '800',
                            color: cheese.priceModifier > 0 ? '#C8102E' : '#166534',
                            background: cheese.priceModifier > 0 ? '#FFF1F2' : '#F0FDF4',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cheese.priceModifier > 0 ? `+ ₹${cheese.priceModifier}` : 'Free'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: VEGETABLE & EXTRA TOPPINGS (MULTI-SELECT) */}
            {activeStep === 4 && (
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1E293B', marginBottom: '0.2rem' }}>
                    4. Select Vegetables & Toppings
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    Select multiple fresh garden vegetables and toppings:
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.85rem',
                  }}
                >
                  {options.veggies.map((veg) => {
                    const isSelected = selectedVeggies.some(
                      (item) => item.toLowerCase() === veg.name.toLowerCase()
                    );
                    return (
                      <div
                        key={veg.name}
                        onClick={() => toggleVeggie(veg.name)}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid #1E3F20' : '1.5px solid #E2E8F0',
                          background: isSelected ? 'rgba(30, 63, 32, 0.06)' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '6px',
                              background: isSelected ? '#1E3F20' : '#FFFFFF',
                              border: isSelected ? 'none' : '2px solid #CBD5E1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F172A' }}>
                            {veg.name}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#C8102E' }}>
                          +₹{veg.priceModifier || 15}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE SUMMARY & PREVIEW SIDEBAR */}
          <div
            style={{
              background: '#F8FAFC',
              borderLeft: '1px solid #E2E8F0',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Pizza Thumbnail Preview */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '140px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              >
                <img
                  src={pizza.image}
                  alt={pizza.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '12px',
                    color: '#FFFFFF',
                    fontWeight: '900',
                    fontSize: '1rem',
                  }}
                >
                  {pizza.name}
                </span>
              </div>

              {/* Selected Summary Breakdown */}
              <h4
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.75rem',
                }}
              >
                Your Customization:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B' }}>
                  <span>Base Crust:</span>
                  <strong style={{ color: '#1E3F20' }}>{selectedBase}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B' }}>
                  <span>Sauce:</span>
                  <strong style={{ color: '#1E3F20' }}>{selectedSauce}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B' }}>
                  <span>Cheese:</span>
                  <strong style={{ color: '#1E3F20' }}>{selectedCheese}</strong>
                </div>
                <div>
                  <span style={{ color: '#1E293B', display: 'block', marginBottom: '0.25rem' }}>
                    Veggies ({selectedVeggies.length}):
                  </span>
                  {selectedVeggies.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {selectedVeggies.map((v) => (
                        <span
                          key={v}
                          style={{
                            background: '#DCFCE7',
                            color: '#166534',
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '6px',
                          }}
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>
                      No veggies selected
                    </span>
                  )}
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div
                style={{
                  borderTop: '1px dashed #CBD5E1',
                  marginTop: '1.25rem',
                  paddingTop: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Base Pizza Price:</span>
                  <span>₹{basePrice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Customization Charges:</span>
                  <span>+ ₹{customizationCost}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: '900',
                    fontSize: '1.05rem',
                    color: '#0F172A',
                    marginTop: '0.4rem',
                  }}
                >
                  <span>Unit Price:</span>
                  <span style={{ color: '#1E3F20' }}>₹{unitPrice}</span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper & Add to Cart CTA */}
            <div style={{ marginTop: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.85rem',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569' }}>Quantity:</span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid #CBD5E1',
                    padding: '0.15rem',
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#F1F5F9',
                      fontWeight: '900',
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>
                  <span style={{ width: '32px', textAlign: 'center', fontWeight: '800' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: 'none',
                      background: '#1E3F20',
                      color: '#FFFFFF',
                      fontWeight: '900',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Navigation / Confirm buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {activeStep < 4 ? (
                  <button
                    onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#0F172A',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '800',
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                    }}
                  >
                    Next Step →
                  </button>
                ) : null}

                <button
                  onClick={handleAddToCart}
                  style={{
                    flex: 1.5,
                    padding: '0.75rem',
                    background: '#1E3F20',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '900',
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(30, 63, 32, 0.25)',
                  }}
                >
                  <ShoppingBag size={17} />
                  <span>Add to Cart (₹{finalPrice})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
