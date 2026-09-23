import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChefHat, Check, ShoppingBag, Sparkles, Info, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { Loader } from '../components/Loader';

export const DEFAULT_CUSTOMIZER_OPTIONS = {
  bases: [
    { name: 'Thin Crust', priceModifier: 0, description: 'Crispy, lightweight artisan Italian style thin crust.' },
    { name: 'Classic Hand Tossed', priceModifier: 0, description: 'Soft, golden crust with fluffy interior and crisp outer edge.' },
    { name: 'Cheese Burst', priceModifier: 60, description: 'Molten liquid mozzarella cheese oozing from the center crust.' },
    { name: 'Whole Wheat', priceModifier: 30, description: '100% stone-ground whole grain high-fiber healthy crust.' },
    { name: 'Gluten Free', priceModifier: 50, description: 'Almond & tapioca blend naturally gluten-free dough.' },
  ],
  sauces: [
    { name: 'Classic Tomato Basil', priceModifier: 0, description: 'San Marzano Italian tomatoes simmered with fresh Genovese basil.' },
    { name: 'Spicy Arrabbiata', priceModifier: 15, description: 'Fiery chili garlic infused slow-roasted tomato reduction.' },
    { name: 'Roasted Garlic Alfredo', priceModifier: 25, description: 'Silky cream sauce with roasted whole garlic and white pepper.' },
    { name: 'Smoky BBQ Sauce', priceModifier: 20, description: 'Rich sweet and tangy hickory-smoked barbecue sauce.' },
    { name: 'Basil Pesto', priceModifier: 35, description: 'Crushed sweet basil, pine nuts, garlic, and olive oil.' },
  ],
  cheeses: [
    { name: 'Mozzarella', priceModifier: 0, description: 'Whole milk shredded mozzarella with exceptional stretch.' },
    { name: 'Aged Cheddar', priceModifier: 30, description: 'Sharp, bold Wisconsin aged yellow cheddar.' },
    { name: 'Parmesan Reggiano', priceModifier: 40, description: 'Finely grated authentic aged Italian hard cheese.' },
    { name: 'Vegan Mozzarella', priceModifier: 50, description: '100% plant-based dairy-free melts smoothly.' },
    { name: 'Smoked Gouda', priceModifier: 45, description: 'Creamy Dutch cheese with delicate natural woodsmoke notes.' },
  ],
  veggies: [
    { name: 'Red Onion', priceModifier: 15, description: 'Crisp caramelized sweet red onion slices.' },
    { name: 'Crisp Capsicum', priceModifier: 15, description: 'Fresh crunchy green bell peppers.' },
    { name: 'Button Mushroom', priceModifier: 25, description: 'Earthy freshly sliced button mushrooms.' },
    { name: 'Sweet Golden Corn', priceModifier: 20, description: 'Tender juicy sweet yellow American corn kernels.' },
    { name: 'Pickled Jalapeño', priceModifier: 20, description: 'Spicy tangy sliced pickled jalapeño peppers.' },
    { name: 'Black Olives', priceModifier: 30, description: 'Rich Spanish pitted black olive rings.' },
    { name: 'Fresh Tomato', priceModifier: 15, description: 'Fresh farm juicy diced tomatoes.' },
    { name: 'Smoked Pepperoni', priceModifier: 60, description: 'Crisp cured spicy pepperoni slices.' },
    { name: 'Grilled Herb Chicken', priceModifier: 50, description: 'Tender chicken breast marinated in herbs.' },
  ],
};

export const CustomizationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [pizza, setPizza] = useState(null);
  const [options, setOptions] = useState(DEFAULT_CUSTOMIZER_OPTIONS);
  const [loading, setLoading] = useState(true);

  // Customization selection state
  const [selectedBase, setSelectedBase] = useState('Classic Hand Tossed');
  const [selectedSauce, setSelectedSauce] = useState('Classic Tomato Basil');
  const [selectedCheese, setSelectedCheese] = useState('Mozzarella');
  const [selectedVeggies, setSelectedVeggies] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch Pizza details
        const pizzaRes = await API.get(`/pizzas/${id}`);
        const currentPizza = pizzaRes.pizza;
        setPizza(currentPizza);

        // Set default selections based on pizza data
        if (currentPizza) {
          setSelectedBase(currentPizza.defaultBase || 'Classic Hand Tossed');
          setSelectedSauce(currentPizza.defaultSauce || 'Classic Tomato Basil');
          setSelectedCheese(currentPizza.defaultCheese || 'Mozzarella');
          setSelectedVeggies(Array.isArray(currentPizza.defaultVeggies) ? currentPizza.defaultVeggies : []);
        }

        // Fetch options from API
        try {
          const optRes = await API.get('/pizzas/customizer/options');
          if (optRes.options) {
            setOptions({
              bases: optRes.options.bases?.length ? optRes.options.bases : DEFAULT_CUSTOMIZER_OPTIONS.bases,
              sauces: optRes.options.sauces?.length ? optRes.options.sauces : DEFAULT_CUSTOMIZER_OPTIONS.sauces,
              cheeses: optRes.options.cheeses?.length ? optRes.options.cheeses : DEFAULT_CUSTOMIZER_OPTIONS.cheeses,
              veggies: optRes.options.veggies?.length ? optRes.options.veggies : DEFAULT_CUSTOMIZER_OPTIONS.veggies,
            });
          }
        } catch (optErr) {
          console.warn('Could not load customizer options API, using defaults:', optErr);
        }
      } catch (err) {
        error(err.message || 'Failed to load pizza details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return <Loader text="Preparing artisan customization station..." />;
  }

  if (!pizza) {
    return (
      <div className="max-w-5xl" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2>Pizza Not Found</h2>
        <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Menu
        </Link>
      </div>
    );
  }

  // Pricing Calculation
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

  // Toggle Veggie selection
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
      error('Please select a pizza base');
      return;
    }
    if (!selectedSauce) {
      error('Please select a sauce option');
      return;
    }
    if (!selectedCheese) {
      error('Please select a cheese option');
      return;
    }

    const itemToAdd = {
      pizza: pizza._id,
      name: `${pizza.name} (Customized)`,
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
    success(`Added customized ${pizza.name} to cart! 🍕`);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl" style={{ padding: '2.5rem 1.5rem 6rem' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#6B7280',
            fontWeight: '700',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to Menu Catalog</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChefHat size={26} color="#D97706" />
          </div>
          <div>
            <h1
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: '2.25rem',
                fontWeight: '900',
                color: '#1F2937',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Craft & Customize: {pizza.name}
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
              Select your preferred crust base, rich sauce spread, gourmet cheese, and fresh toppings.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div
        className="responsive-2col-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: '2.5rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: CUSTOMIZATION SECTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* SECTION 1: PIZZA BASE SELECTION */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid #E5E7EB',
            }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1F2937', margin: 0 }}>
                  1. Pizza Crust Base
                </h2>
                <span className="badge badge-special">Select 1 Base</span>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Choose the foundation for your hand-crafted pizza crust
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {options.bases.map((base) => {
                const isSelected = selectedBase.toLowerCase() === base.name.toLowerCase();
                return (
                  <div
                    key={base.name}
                    onClick={() => setSelectedBase(base.name)}
                    style={{
                      padding: '1.1rem 1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: isSelected ? '2.5px solid #1E3F20' : '1.5px solid #E5E7EB',
                      background: isSelected ? 'rgba(30, 63, 32, 0.04)' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 4px 14px rgba(30, 63, 32, 0.1)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid #1E3F20' : '2px solid #D1D5DB',
                            background: '#FFFFFF',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#1F2937' }}>
                          {base.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          color: base.priceModifier > 0 ? '#C8102E' : '#166534',
                          background: base.priceModifier > 0 ? '#FFF1F2' : '#F0FDF4',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '20px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {base.priceModifier > 0 ? `+ ₹${base.priceModifier}` : 'Free'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                      {base.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: SAUCE SELECTION */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid #E5E7EB',
            }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1F2937', margin: 0 }}>
                  2. Signature Pizza Sauce
                </h2>
                <span className="badge badge-special">Select 1 Sauce</span>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Select slow-simmered artisanal tomato or cream sauce reduction
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {options.sauces.map((sauce) => {
                const isSelected = selectedSauce.toLowerCase() === sauce.name.toLowerCase();
                return (
                  <div
                    key={sauce.name}
                    onClick={() => setSelectedSauce(sauce.name)}
                    style={{
                      padding: '1.1rem 1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: isSelected ? '2.5px solid #1E3F20' : '1.5px solid #E5E7EB',
                      background: isSelected ? 'rgba(30, 63, 32, 0.04)' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 4px 14px rgba(30, 63, 32, 0.1)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid #1E3F20' : '2px solid #D1D5DB',
                            background: '#FFFFFF',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#1F2937' }}>
                          {sauce.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          color: sauce.priceModifier > 0 ? '#C8102E' : '#166534',
                          background: sauce.priceModifier > 0 ? '#FFF1F2' : '#F0FDF4',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '20px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sauce.priceModifier > 0 ? `+ ₹${sauce.priceModifier}` : 'Free'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                      {sauce.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: CHEESE SELECTION */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid #E5E7EB',
            }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1F2937', margin: 0 }}>
                  3. Gourmet Cheese Layer
                </h2>
                <span className="badge badge-special">Select 1 Cheese</span>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Pick your preferred stretchy, sharp, or dairy-free cheese
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {options.cheeses.map((cheese) => {
                const isSelected = selectedCheese.toLowerCase() === cheese.name.toLowerCase();
                return (
                  <div
                    key={cheese.name}
                    onClick={() => setSelectedCheese(cheese.name)}
                    style={{
                      padding: '1.1rem 1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: isSelected ? '2.5px solid #1E3F20' : '1.5px solid #E5E7EB',
                      background: isSelected ? 'rgba(30, 63, 32, 0.04)' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 4px 14px rgba(30, 63, 32, 0.1)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid #1E3F20' : '2px solid #D1D5DB',
                            background: '#FFFFFF',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#1F2937' }}>
                          {cheese.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          color: cheese.priceModifier > 0 ? '#C8102E' : '#166534',
                          background: cheese.priceModifier > 0 ? '#FFF1F2' : '#F0FDF4',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '20px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {cheese.priceModifier > 0 ? `+ ₹${cheese.priceModifier}` : 'Free'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                      {cheese.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: VEGETABLES & EXTRA TOPPINGS (MULTI-SELECT) */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid #E5E7EB',
            }}
          >
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1F2937', margin: 0 }}>
                  4. Fresh Vegetables & Toppings
                </h2>
                <span className="badge badge-veg">Multi-Select Allowed</span>
              </div>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Select one or multiple fresh garden vegetables & savory toppings
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {options.veggies.map((veg) => {
                const isSelected = selectedVeggies.some(
                  (item) => item.toLowerCase() === veg.name.toLowerCase()
                );
                return (
                  <div
                    key={veg.name}
                    onClick={() => toggleVeggie(veg.name)}
                    style={{
                      padding: '1rem 1.15rem',
                      borderRadius: 'var(--radius-lg)',
                      border: isSelected ? '2.5px solid #166534' : '1.5px solid #E5E7EB',
                      background: isSelected ? '#F0FDF4' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 4px 12px rgba(22, 101, 52, 0.1)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          background: isSelected ? '#166534' : '#FFFFFF',
                          border: isSelected ? 'none' : '2px solid #D1D5DB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                      </div>
                      <div>
                        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1F2937', display: 'block' }}>
                          {veg.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {veg.description}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#C8102E', flexShrink: 0, marginLeft: '0.5rem' }}>
                      +₹{veg.priceModifier || 15}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY ORDER SUMMARY & PREVIEW */}
        <div
          className="card"
          style={{
            position: 'sticky',
            top: '100px',
            padding: '1.75rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid #E5E7EB',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          }}
        >
          {/* Pizza Image Preview */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '180px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              marginBottom: '1.25rem',
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
                background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)',
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '14px',
                color: '#FFFFFF',
                fontWeight: '900',
                fontSize: '1.15rem',
              }}
            >
              {pizza.name}
            </span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1F2937', marginBottom: '1rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem' }}>
            Customization Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
              <span>Base Crust:</span>
              <strong style={{ color: '#1E3F20' }}>{selectedBase}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
              <span>Sauce:</span>
              <strong style={{ color: '#1E3F20' }}>{selectedSauce}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
              <span>Cheese:</span>
              <strong style={{ color: '#1E3F20' }}>{selectedCheese}</strong>
            </div>
            <div>
              <span style={{ color: '#374151', display: 'block', marginBottom: '0.3rem' }}>
                Veggies ({selectedVeggies.length}):
              </span>
              {selectedVeggies.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedVeggies.map((veg) => (
                    <span
                      key={veg}
                      style={{
                        background: '#DCFCE7',
                        color: '#166534',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      {veg}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                  No extra veggies selected
                </span>
              )}
            </div>
          </div>

          {/* Pricing Calculation Breakdown */}
          <div
            style={{
              background: '#F9FAFB',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              border: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
              <span>Base Pizza Price:</span>
              <span>₹{basePrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
              <span>Customization Charges:</span>
              <span>+ ₹{customizationCost}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
              <span>Unit Price:</span>
              <strong style={{ color: '#1F2937' }}>₹{unitPrice}</strong>
            </div>
            <div
              style={{
                borderTop: '1px solid #E5E7EB',
                marginTop: '0.4rem',
                paddingTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.15rem',
                fontWeight: '900',
                color: '#1F2937',
              }}
            >
              <span>Total Price:</span>
              <span style={{ color: '#1E3F20' }}>₹{finalPrice}</span>
            </div>
          </div>

          {/* Quantity Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#374151' }}>Quantity:</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F3F4F6',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid #E5E7EB',
                padding: '0.2rem',
              }}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1F2937',
                  cursor: 'pointer',
                }}
              >
                <Minus size={14} />
              </button>
              <span style={{ width: '36px', textAlign: 'center', fontWeight: '800', color: '#1F2937' }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#1E3F20',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1rem',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: '#1E3F20',
            }}
          >
            <ShoppingBag size={18} />
            <span>Add to Cart (₹{finalPrice})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
