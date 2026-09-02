import { Pizza } from '../models/Pizza.js';
import { Inventory } from '../models/Inventory.js';

/**
 * @desc    Get all pizzas/items with category, pizzaType, search, and availability filters
 * @route   GET /api/pizzas
 * @access  Public / Admin
 */
export const getAllPizzas = async (req, res, next) => {
  try {
    const { category, pizzaType, search, all } = req.query;
    const filter = {};

    // Customer view only shows available items; admin (all=true) sees all
    if (all !== 'true') {
      filter.isAvailable = true;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (pizzaType && pizzaType !== 'All') {
      filter.pizzaType = pizzaType;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const pizzas = await Pizza.find(filter).sort({ isChefSpecial: -1, rating: -1, createdAt: -1 });

    res.json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single pizza by ID or slug
 * @route   GET /api/pizzas/:id
 * @access  Public
 */
export const getPizzaById = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.json({
      success: true,
      pizza,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all available customizer ingredients categorized
 * @route   GET /api/pizzas/customizer/options
 * @access  Public
 */
export const getCustomizerOptions = async (req, res, next) => {
  try {
    const inventory = await Inventory.find({ isAvailable: true, quantity: { $gt: 0 } });

    let bases = inventory.filter((item) => item.category === 'base');
    let sauces = inventory.filter((item) => item.category === 'sauce');
    let cheeses = inventory.filter((item) => item.category === 'cheese');
    let veggies = inventory.filter((item) => item.category === 'veggie');

    // Default Fallbacks to guarantee minimum required choices
    const defaultBases = [
      { name: 'Thin Crust', category: 'base', priceModifier: 0, description: 'Crispy, lightweight artisan Italian style thin crust.' },
      { name: 'Classic Hand Tossed', category: 'base', priceModifier: 0, description: 'Soft, golden crust with fluffy interior and crisp outer edge.' },
      { name: 'Cheese Burst', category: 'base', priceModifier: 60, description: 'Molten liquid mozzarella cheese oozing from the center crust.' },
      { name: 'Whole Wheat', category: 'base', priceModifier: 30, description: '100% stone-ground whole grain high-fiber healthy crust.' },
      { name: 'Gluten Free', category: 'base', priceModifier: 50, description: 'Almond & tapioca blend naturally gluten-free dough.' },
    ];

    const defaultSauces = [
      { name: 'Classic Tomato', category: 'sauce', priceModifier: 0, description: 'San Marzano tomatoes simmered with fresh basil.' },
      { name: 'Spicy Arrabbiata', category: 'sauce', priceModifier: 15, description: 'Fiery chili garlic infused slow-roasted tomato sauce.' },
      { name: 'Garlic Sauce', category: 'sauce', priceModifier: 25, description: 'Silky cream sauce with roasted whole garlic.' },
      { name: 'BBQ Sauce', category: 'sauce', priceModifier: 20, description: 'Rich sweet and tangy hickory-smoked barbecue sauce.' },
      { name: 'Pesto Sauce', category: 'sauce', priceModifier: 35, description: 'Crushed sweet basil, pine nuts, and olive oil.' },
    ];

    const defaultCheeses = [
      { name: 'Mozzarella', category: 'cheese', priceModifier: 0, description: 'Whole milk shredded mozzarella with exceptional stretch.' },
      { name: 'Cheddar', category: 'cheese', priceModifier: 30, description: 'Sharp, bold Wisconsin aged yellow cheddar.' },
      { name: 'Parmesan', category: 'cheese', priceModifier: 40, description: 'Finely grated authentic aged Italian hard cheese.' },
      { name: 'Vegan Cheese', category: 'cheese', priceModifier: 50, description: '100% plant-based dairy-free melts smoothly.' },
      { name: 'Smoked Gouda', category: 'cheese', priceModifier: 45, description: 'Creamy Dutch cheese with delicate natural woodsmoke notes.' },
    ];

    const defaultVeggies = [
      { name: 'Onion', category: 'veggie', priceModifier: 15, description: 'Crisp caramelized sweet red onion slices.' },
      { name: 'Capsicum', category: 'veggie', priceModifier: 15, description: 'Fresh crunchy green bell peppers.' },
      { name: 'Mushroom', category: 'veggie', priceModifier: 25, description: 'Earthy freshly sliced button mushrooms.' },
      { name: 'Sweet Corn', category: 'veggie', priceModifier: 20, description: 'Tender juicy sweet yellow American corn kernels.' },
      { name: 'Jalapeño', category: 'veggie', priceModifier: 20, description: 'Spicy tangy sliced pickled jalapeño peppers.' },
      { name: 'Black Olives', category: 'veggie', priceModifier: 30, description: 'Rich Spanish pitted black olive rings.' },
      { name: 'Tomato', category: 'veggie', priceModifier: 15, description: 'Fresh farm juicy diced tomatoes.' },
      { name: 'Grilled Herb Chicken', category: 'veggie', priceModifier: 50, description: 'Tender chicken breast marinated in herbs.' },
      { name: 'Smoked Pepperoni', category: 'veggie', priceModifier: 60, description: 'Crisp cured spicy pepperoni slices.' },
    ];

    if (bases.length < 5) bases = defaultBases;
    if (sauces.length < 5) sauces = defaultSauces;
    if (cheeses.length < 4) cheeses = defaultCheeses;
    if (veggies.length < 7) veggies = defaultVeggies;

    res.json({
      success: true,
      options: {
        bases,
        sauces,
        cheeses,
        veggies,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new menu item
 * @route   POST /api/pizzas
 * @access  Private/Admin
 */
export const createPizza = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      pizzaType,
      basePrice,
      image,
      isChefSpecial,
      isAvailable,
      servings,
      preparationTime,
      defaultBase,
      defaultSauce,
      defaultCheese,
      defaultVeggies,
    } = req.body;

    if (!name || !description || basePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and base price are required',
      });
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const pizza = await Pizza.create({
      name: name.trim(),
      slug,
      description: description.trim(),
      category: category || 'Pizzas',
      pizzaType: pizzaType || 'Veg',
      basePrice: Number(basePrice),
      image: image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      isChefSpecial: Boolean(isChefSpecial),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      servings: servings || '1',
      preparationTime: preparationTime || '15-20 mins',
      defaultBase: defaultBase || 'Classic Hand Tossed',
      defaultSauce: defaultSauce || 'Classic Tomato Basil',
      defaultCheese: defaultCheese || 'Mozzarella',
      defaultVeggies: defaultVeggies || [],
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      pizza,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing menu item
 * @route   PATCH /api/pizzas/:id
 * @access  Private/Admin
 */
export const updatePizza = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      pizzaType,
      basePrice,
      image,
      isChefSpecial,
      isAvailable,
      servings,
      preparationTime,
      defaultBase,
      defaultSauce,
      defaultCheese,
      defaultVeggies,
    } = req.body;

    const pizza = await Pizza.findById(id);
    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    if (name !== undefined) pizza.name = name.trim();
    if (description !== undefined) pizza.description = description.trim();
    if (category !== undefined) pizza.category = category;
    if (pizzaType !== undefined) pizza.pizzaType = pizzaType;
    if (basePrice !== undefined) pizza.basePrice = Number(basePrice);
    if (image !== undefined) pizza.image = image;
    if (isChefSpecial !== undefined) pizza.isChefSpecial = Boolean(isChefSpecial);
    if (isAvailable !== undefined) pizza.isAvailable = Boolean(isAvailable);
    if (servings !== undefined) pizza.servings = servings;
    if (preparationTime !== undefined) pizza.preparationTime = preparationTime;
    if (defaultBase !== undefined) pizza.defaultBase = defaultBase;
    if (defaultSauce !== undefined) pizza.defaultSauce = defaultSauce;
    if (defaultCheese !== undefined) pizza.defaultCheese = defaultCheese;
    if (defaultVeggies !== undefined) pizza.defaultVeggies = defaultVeggies;

    await pizza.save();

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      pizza,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle item availability (Available vs Out of Stock)
 * @route   PATCH /api/pizzas/:id/toggle-availability
 * @access  Private/Admin
 */
export const togglePizzaAvailability = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    pizza.isAvailable = !pizza.isAvailable;
    await pizza.save();

    res.json({
      success: true,
      message: `Item '${pizza.name}' is now ${pizza.isAvailable ? 'Available' : 'Out of Stock'}`,
      pizza,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a menu item
 * @route   DELETE /api/pizzas/:id
 * @access  Private/Admin
 */
export const deletePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);
    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.json({
      success: true,
      message: `Menu item '${pizza.name}' deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
