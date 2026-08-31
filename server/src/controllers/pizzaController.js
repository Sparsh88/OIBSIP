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
    const inventory = await Inventory.find({ quantity: { $gt: 0 } });

    const bases = inventory.filter((item) => item.category === 'base');
    const sauces = inventory.filter((item) => item.category === 'sauce');
    const cheeses = inventory.filter((item) => item.category === 'cheese');
    const veggies = inventory.filter((item) => item.category === 'veggie');

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
