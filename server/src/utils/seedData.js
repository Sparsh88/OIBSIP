import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Pizza } from '../models/Pizza.js';
import { Inventory } from '../models/Inventory.js';
import { Order } from '../models/Order.js';
import { Coupon } from '../models/Coupon.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/pizza_delivery_db';

const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizzanest.com';
const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AdminSecretPass123!';

const initialUsers = [
  {
    name: 'Sparsh Chauhan (Admin)',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    phone: '+91 98765 43210',
    address: {
      street: '101 Cyber Hub, Executive Office',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
    },
  },
];

const initialInventory = [
  // 1. Pizza Bases (5 options)
  {
    name: 'Thin Crust',
    category: 'base',
    quantity: 120,
    unit: 'crusts',
    lowStockThreshold: 20,
    priceModifier: 0,
    description: 'Crispy, lightweight artisan Italian style thin crust.',
  },
  {
    name: 'Classic Hand Tossed',
    category: 'base',
    quantity: 150,
    unit: 'crusts',
    lowStockThreshold: 25,
    priceModifier: 0,
    description: 'Soft, golden crust with fluffy interior and crisp outer edge.',
  },
  {
    name: 'Cheese Burst',
    category: 'base',
    quantity: 80,
    unit: 'crusts',
    lowStockThreshold: 20,
    priceModifier: 60,
    description: 'Molten liquid mozzarella cheese oozing from the center crust.',
  },
  {
    name: 'Whole Wheat',
    category: 'base',
    quantity: 90,
    unit: 'crusts',
    lowStockThreshold: 15,
    priceModifier: 30,
    description: '100% stone-ground whole grain high-fiber healthy crust.',
  },
  {
    name: 'Gluten Free',
    category: 'base',
    quantity: 50,
    unit: 'crusts',
    lowStockThreshold: 10,
    priceModifier: 50,
    description: 'Almond & tapioca blend naturally gluten-free dough.',
  },

  // 2. Sauces (5 options)
  {
    name: 'Classic Tomato Basil',
    category: 'sauce',
    quantity: 200,
    unit: 'ladles',
    lowStockThreshold: 30,
    priceModifier: 0,
    description: 'San Marzano Italian tomatoes simmered with fresh Genovese basil.',
  },
  {
    name: 'Spicy Arrabbiata',
    category: 'sauce',
    quantity: 160,
    unit: 'ladles',
    lowStockThreshold: 25,
    priceModifier: 15,
    description: 'Fiery chili garlic infused slow-roasted tomato reduction.',
  },
  {
    name: 'Roasted Garlic Alfredo',
    category: 'sauce',
    quantity: 120,
    unit: 'ladles',
    lowStockThreshold: 20,
    priceModifier: 25,
    description: 'Silky cream sauce with roasted whole garlic and white pepper.',
  },
  {
    name: 'Smoky BBQ Sauce',
    category: 'sauce',
    quantity: 140,
    unit: 'ladles',
    lowStockThreshold: 20,
    priceModifier: 20,
    description: 'Rich sweet and tangy hickory-smoked barbecue sauce.',
  },
  {
    name: 'Basil Pesto',
    category: 'sauce',
    quantity: 110,
    unit: 'ladles',
    lowStockThreshold: 15,
    priceModifier: 35,
    description: 'Crushed sweet basil, pine nuts, garlic, and cold pressed olive oil.',
  },

  // 3. Artisan Cheeses (5 options)
  {
    name: 'Mozzarella',
    category: 'cheese',
    quantity: 250,
    unit: 'portions',
    lowStockThreshold: 40,
    priceModifier: 0,
    description: 'Whole milk shredded mozzarella with exceptional stretch.',
  },
  {
    name: 'Aged Cheddar',
    category: 'cheese',
    quantity: 180,
    unit: 'portions',
    lowStockThreshold: 30,
    priceModifier: 30,
    description: 'Sharp, bold Wisconsin aged yellow cheddar.',
  },
  {
    name: 'Parmesan Reggiano',
    category: 'cheese',
    quantity: 130,
    unit: 'portions',
    lowStockThreshold: 20,
    priceModifier: 40,
    description: 'Finely grated authentic aged Italian hard cheese.',
  },
  {
    name: 'Smoked Gouda',
    category: 'cheese',
    quantity: 110,
    unit: 'portions',
    lowStockThreshold: 20,
    priceModifier: 45,
    description: 'Creamy Dutch cheese with delicate natural woodsmoke notes.',
  },
  {
    name: 'Vegan Mozzarella',
    category: 'cheese',
    quantity: 90,
    unit: 'portions',
    lowStockThreshold: 15,
    priceModifier: 50,
    description: '100% plant-based dairy-free melts smoothly.',
  },

  // 4. Veggies and Meat Toppings (9 options)
  {
    name: 'Smoked Pepperoni',
    category: 'veggie',
    quantity: 180,
    unit: 'portions',
    lowStockThreshold: 30,
    priceModifier: 60,
    description: 'Crisp cured pork & beef slices seasoned with paprika and chili.',
  },
  {
    name: 'Grilled Herb Chicken',
    category: 'veggie',
    quantity: 200,
    unit: 'portions',
    lowStockThreshold: 35,
    priceModifier: 50,
    description: 'Tender chicken breast chunks marinated in Italian herbs.',
  },
  {
    name: 'Spiced Chicken Sausage',
    category: 'veggie',
    quantity: 170,
    unit: 'portions',
    lowStockThreshold: 30,
    priceModifier: 45,
    description: 'Smoked and seasoned artisan chicken sausage rounds.',
  },
  {
    name: 'Red Onion',
    category: 'veggie',
    quantity: 300,
    unit: 'portions',
    lowStockThreshold: 50,
    priceModifier: 15,
    description: 'Crisp caramelized sweet red onion slices.',
  },
  {
    name: 'Crisp Capsicum',
    category: 'veggie',
    quantity: 280,
    unit: 'portions',
    lowStockThreshold: 45,
    priceModifier: 15,
    description: 'Fresh crunchy green bell peppers.',
  },
  {
    name: 'Button Mushroom',
    category: 'veggie',
    quantity: 210,
    unit: 'portions',
    lowStockThreshold: 35,
    priceModifier: 25,
    description: 'Earthy freshly sliced portobello & button mushrooms.',
  },
  {
    name: 'Sweet Golden Corn',
    category: 'veggie',
    quantity: 260,
    unit: 'portions',
    lowStockThreshold: 40,
    priceModifier: 20,
    description: 'Tender juicy sweet yellow American corn kernels.',
  },
  {
    name: 'Pickled Jalapeño',
    category: 'veggie',
    quantity: 190,
    unit: 'portions',
    lowStockThreshold: 30,
    priceModifier: 20,
    description: 'Spicy tangy Mexican sliced pickled jalapeño peppers.',
  },
  {
    name: 'Black Olives',
    category: 'veggie',
    quantity: 180,
    unit: 'portions',
    lowStockThreshold: 30,
    priceModifier: 30,
    description: 'Rich Spanish pitted black olive rings in extra virgin oil.',
  },
];

const initialPizzas = [
  // ==========================================
  // --- 1. DESSERTS (ONLY 1 OPTION: CHOCO LAVA) ---
  // ==========================================
  {
    name: 'CHOCO LAVA CAKE',
    slug: 'choco-lava-cake',
    description: "A volcano you'll actually love erupting. Rich fudgy chocolate cake with warm, gooey liquid chocolate fudge center.",
    category: 'Desserts',
    pizzaType: 'Veg',
    basePrice: 139,
    image: '/images/choco_lava.jpg',
    rating: 4.9,
    reviewsCount: 380,
    isChefSpecial: true,
  },

  // ==========================================
  // --- 2. BEVERAGES (ONLY 4 ITEMS: COKE, SPRITE, FANTA, THUMS UP) ---
  // ==========================================
  {
    name: 'COCA COLA 350 ML GLASS',
    slug: 'coca-cola-350-ml-glass',
    description: 'Ice-cold classic Coca-Cola served with sparkling effervescence and ice.',
    category: 'Beverages',
    pizzaType: 'Veg',
    basePrice: 59,
    image: '/images/coca_cola.jpg',
    servings: '1',
    rating: 4.8,
    reviewsCount: 450,
  },
  {
    name: 'SPRITE 350 ML GLASS',
    slug: 'sprite-350-ml-glass',
    description: 'Crisp, refreshing lemon-lime soda with bubbly carbonation and ice.',
    category: 'Beverages',
    pizzaType: 'Veg',
    basePrice: 59,
    image: '/images/sprite.jpg',
    servings: '1',
    rating: 4.8,
    reviewsCount: 310,
  },
  {
    name: 'FANTA 350 ML GLASS',
    slug: 'fanta-350-ml-glass',
    description: 'Bright, bubbly orange soda bursting with real citrus flavor and ice.',
    category: 'Beverages',
    pizzaType: 'Veg',
    basePrice: 59,
    image: '/images/fanta.jpg',
    servings: '1',
    rating: 4.7,
    reviewsCount: 280,
  },
  {
    name: 'THUMS UP 350 ML GLASS',
    slug: 'thums-up-350-ml-glass',
    description: 'Bold, strong and fizzy Indian classic Thums Up cola with maximum kick and ice.',
    category: 'Beverages',
    pizzaType: 'Veg',
    basePrice: 59,
    image: '/images/thums_up.jpg',
    servings: '1',
    rating: 4.9,
    reviewsCount: 410,
    isChefSpecial: true,
  },

  // ==========================================
  // --- 3. EXTRAS & DIPS (EXACT 4 ITEMS ONLY) ---
  // ==========================================
  {
    name: 'SPECIAL GARLIC SAUCE',
    slug: 'special-garlic-sauce',
    description: 'Dairy rich, buttery, and garlicky in all the right ways - our signature dip.',
    category: 'Extras',
    pizzaType: 'Veg',
    basePrice: 30,
    image: '/images/special_garlic_sauce.jpg',
    rating: 4.9,
    reviewsCount: 310,
    isChefSpecial: true,
  },
  {
    name: 'BBQ SAUCE',
    slug: 'bbq-sauce-dip',
    description: 'Smoky, sweet, and bold enough to turn any slice into a flame-kissed treat.',
    category: 'Extras',
    pizzaType: 'Veg',
    basePrice: 30,
    image: '/images/bbq_sauce.jpg',
    rating: 4.8,
    reviewsCount: 220,
  },
  {
    name: 'PIZZA SAUCE',
    slug: 'pizza-sauce-dip',
    description: 'Tomato-rich, herby, and slow-simmered to be the heart of every great pizza.',
    category: 'Extras',
    pizzaType: 'Veg',
    basePrice: 30,
    image: '/images/pizza_sauce.jpg',
    rating: 4.8,
    reviewsCount: 195,
  },
  {
    name: 'Tomato Ketchup Sachets',
    slug: 'tomato-ketchup-sachets',
    description: 'Del Monte Premium Quality Tomato Ketchup Sachets.',
    category: 'Extras',
    pizzaType: 'Veg',
    basePrice: 1.43,
    image: '/images/del_monte_ketchup.jpg',
    rating: 4.6,
    reviewsCount: 95,
  },

  // ==========================================
  // --- 4. PIZZAS: VEG, NON-VEG & SPECIAL ONLY ---
  // ==========================================
  // --- A. VEG PIZZAS ---
  {
    name: 'MARGHERITA',
    slug: 'margherita',
    description: 'Pizza sauce and molten real mozzarella in golden harmony over cold-fermented dough.',
    category: 'Pizzas',
    pizzaType: 'Veg',
    basePrice: 299,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Classic Hand Tossed',
    defaultSauce: 'Classic Tomato Basil',
    defaultCheese: 'Mozzarella',
    rating: 4.9,
    reviewsCount: 310,
    isChefSpecial: true,
    servings: '2-4',
  },
  {
    name: 'SPINACH ALFREDO',
    slug: 'spinach-alfredo',
    description: 'Creamy spinach alfredo sauce and melted real mozzarella on a golden crust. Kid friendly favorite.',
    category: 'Pizzas',
    pizzaType: 'Veg',
    basePrice: 349,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Classic Hand Tossed',
    defaultSauce: 'Roasted Garlic Alfredo',
    defaultCheese: 'Mozzarella',
    defaultVeggies: ['Fresh Baby Spinach'],
    rating: 4.8,
    reviewsCount: 190,
    servings: '2-4',
  },
  {
    name: 'VEG BBQ',
    slug: 'veg-bbq-pizza',
    description: 'Onions, capsicums, tomatoes, black olives, mushrooms, pizza sauce & smoky barbecue drizzle.',
    category: 'Pizzas',
    pizzaType: 'Veg',
    basePrice: 379,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Classic Hand Tossed',
    defaultSauce: 'Smoky BBQ Sauce',
    defaultCheese: 'Mozzarella',
    defaultVeggies: ['Red Onion', 'Crisp Capsicum', 'Button Mushroom', 'Black Olives'],
    rating: 4.8,
    reviewsCount: 220,
    servings: '2-4',
  },
  {
    name: 'Farmhouse Garden Fresh',
    slug: 'farmhouse-garden-fresh',
    description: 'Loaded with farm-crisp capsicum, sweet golden corn, crunchy red onions, juicy tomatoes, and melted mozzarella.',
    category: 'Pizzas',
    pizzaType: 'Veg',
    basePrice: 349,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Classic Hand Tossed',
    defaultSauce: 'Classic Tomato Basil',
    defaultCheese: 'Mozzarella',
    defaultVeggies: ['Crisp Capsicum', 'Sweet Golden Corn', 'Red Onion'],
    rating: 4.7,
    reviewsCount: 160,
    servings: '2-4',
  },

  // --- B. NON-VEG PIZZAS ---
  {
    name: 'Pepperoni Feast Supreme',
    slug: 'pepperoni-feast-supreme',
    description: 'Generously loaded with authentic crisp pepperoni slices, stretchy mozzarella, and San Marzano Italian tomato sauce.',
    category: 'Pizzas',
    pizzaType: 'Non-Veg',
    basePrice: 489,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Thin Crust',
    defaultSauce: 'Classic Tomato Basil',
    defaultCheese: 'Mozzarella',
    defaultVeggies: ['Smoked Pepperoni'],
    rating: 4.9,
    reviewsCount: 290,
    isChefSpecial: true,
    servings: '2-4',
  },
  {
    name: 'BBQ Smoked Chicken',
    slug: 'bbq-smoked-chicken',
    description: 'Hickory wood smoked tender chicken breast, caramelized red onions, sweet corn, melted mozzarella, and tangy barbecue glaze.',
    category: 'Pizzas',
    pizzaType: 'Non-Veg',
    basePrice: 459,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Classic Hand Tossed',
    defaultSauce: 'Smoky BBQ Sauce',
    defaultCheese: 'Mozzarella',
    defaultVeggies: ['Grilled Herb Chicken', 'Sweet Golden Corn', 'Red Onion'],
    rating: 4.8,
    reviewsCount: 240,
    isChefSpecial: true,
    servings: '2-4',
  },
  {
    name: 'Peri-Peri Chicken Inferno',
    slug: 'peri-peri-chicken-inferno',
    description: 'Fiery peri-peri glazed roast chicken, pickled jalapeños, crisp capsicum, and molten cheddar with chili flakes.',
    category: 'Pizzas',
    pizzaType: 'Non-Veg',
    basePrice: 479,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Cheese Burst',
    defaultSauce: 'Spicy Arrabbiata',
    defaultCheese: 'Aged Cheddar',
    defaultVeggies: ['Grilled Herb Chicken', 'Pickled Jalapeño', 'Crisp Capsicum'],
    rating: 4.9,
    reviewsCount: 195,
    servings: '2-4',
  },
  {
    name: 'Smoked Sausage & Garlic Alfredo',
    slug: 'smoked-sausage-garlic-alfredo',
    description: 'Artisan smoked chicken sausage slices over rich roasted garlic white sauce, portobello mushrooms, and aged parmesan.',
    category: 'Pizzas',
    pizzaType: 'Non-Veg',
    basePrice: 469,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Thin Crust',
    defaultSauce: 'Roasted Garlic Alfredo',
    defaultCheese: 'Parmesan Reggiano',
    defaultVeggies: ['Spiced Chicken Sausage', 'Button Mushroom'],
    rating: 4.7,
    reviewsCount: 140,
    servings: '2-4',
  },

  // --- C. SPECIAL PIZZAS ---
  {
    name: 'Truffle Mushroom Delight',
    slug: 'truffle-mushroom-delight',
    description: 'Gourmet wild button mushrooms, roasted garlic alfredo sauce, melted smoked gouda, and aromatic herb truffle oil infusion.',
    category: 'Pizzas',
    pizzaType: 'Special',
    basePrice: 449,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Thin Crust',
    defaultSauce: 'Roasted Garlic Alfredo',
    defaultCheese: 'Smoked Gouda',
    defaultVeggies: ['Button Mushroom', 'Red Onion'],
    rating: 4.9,
    reviewsCount: 175,
    isChefSpecial: true,
    servings: '2-4',
  },
  {
    name: 'Four Cheese Extravaganza',
    slug: 'four-cheese-extravaganza',
    description: 'A decadent four-cheese blend of stretchy Mozzarella, sharp Aged Cheddar, authentic Parmesan Reggiano, and rich Smoked Gouda.',
    category: 'Pizzas',
    pizzaType: 'Special',
    basePrice: 479,
    image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=800&auto=format&fit=crop&q=80',
    defaultBase: 'Cheese Burst',
    defaultSauce: 'Classic Tomato Basil',
    defaultCheese: 'Parmesan Reggiano',
    defaultVeggies: ['Fresh Baby Spinach'],
    rating: 5.0,
    reviewsCount: 220,
    isChefSpecial: true,
    servings: '2-4',
  },

  // ==========================================
  // --- 5. PROTEIN PACKED & SIDES ---
  // ==========================================
  {
    name: 'SPICY CHICKEN POPPERS 8 PCS',
    slug: 'spicy-chicken-poppers-8-pcs',
    description: 'Bite-sized bombs of joy! Whole-muscle chicken chunks marinated in fiery spices and fried to golden perfection.',
    category: 'Protein Packed',
    pizzaType: 'Non-Veg',
    basePrice: 359,
    image: '/images/chicken_poppers.jpg',
    rating: 4.9,
    reviewsCount: 215,
    isChefSpecial: true,
  },
  {
    name: 'BBQ CHICKEN WINGS 4 PCS',
    slug: 'bbq-chicken-wings-4-pcs',
    description: 'Smoky, sticky, and oh-so-addictive! Roasted wings glazed with rich signature hickory barbecue sauce.',
    category: 'Protein Packed',
    pizzaType: 'Non-Veg',
    basePrice: 299,
    image: '/images/bbq_wings.jpg',
    rating: 4.8,
    reviewsCount: 180,
  },
  {
    name: 'ROASTED CHICKEN WINGS 4 PCS',
    slug: 'roasted-chicken-wings-4-pcs',
    description: 'Wings, the honest way. Roasted with coarse sea salt, black pepper, and garlic herb drizzle.',
    category: 'Protein Packed',
    pizzaType: 'Non-Veg',
    basePrice: 249,
    image: '/images/roasted_wings.jpg',
    rating: 4.7,
    reviewsCount: 155,
  },
  {
    name: 'Garlic Parmesan Breadsticks',
    slug: 'garlic-parmesan-breadsticks',
    description: 'Freshly baked dough sticks brushed with garlic butter and sprinkled with aged Italian parmesan.',
    category: 'Sides',
    pizzaType: 'Veg',
    basePrice: 149,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 190,
  },
  {
    name: 'Cheesy Garlic Bread',
    slug: 'cheesy-garlic-bread',
    description: 'Crispy stone-baked bread generously layered with melted whole-milk mozzarella and garlic herbs.',
    category: 'Sides',
    pizzaType: 'Veg',
    basePrice: 179,
    image: 'https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 230,
  },
];

const initialCoupons = [
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

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to database.');

    // Clear existing data
    console.log('[Seed] Purging previous collections...');
    await User.deleteMany({});
    await Inventory.deleteMany({});
    await Pizza.deleteMany({});
    await Order.deleteMany({});
    await Coupon.deleteMany({});

    // Seed Users
    console.log('[Seed] Creating Administrator account...');
    for (const userData of initialUsers) {
      await User.create(userData);
    }
    console.log(`[Seed] Created Administrator (${adminEmail}) successfully.`);

    // Seed Inventory
    console.log('[Seed] Seeding Pizza Bases, Sauces, Cheeses, and Veggies/Meat Toppings...');
    await Inventory.insertMany(initialInventory);
    console.log(`[Seed] Created ${initialInventory.length} inventory items.`);

    // Seed Pizzas, Desserts, Beverages & Extras
    console.log('[Seed] Seeding exact catalog (1 Dessert, 4 Beverages, Extras, Sides, Pizzas)...');
    await Pizza.insertMany(initialPizzas);
    console.log(`[Seed] Created ${initialPizzas.length} items across all categories.`);

    // Seed Coupons
    console.log('[Seed] Seeding active promotional coupons...');
    await Coupon.insertMany(initialCoupons);
    console.log(`[Seed] Created ${initialCoupons.length} promotional coupons.`);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`👑 Administrator Email: ${adminEmail}`);
    console.log('🔒 Password has been securely hashed and stored in MongoDB Atlas.');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    process.exit(1);
  }
};

if (process.argv[1].endsWith('seedData.js')) {
  seedDatabase();
}
