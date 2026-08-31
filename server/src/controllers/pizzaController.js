import { Pizza } from '../models/Pizza.js';
import { Inventory } from '../models/Inventory.js';

/**
 * @desc    Get all pizzas/items with category, pizzaType, and search filters
 * @route   GET /api/pizzas
 * @access  Public
 */
export const getAllPizzas = async (req, res, next) => {
  try {
    const { category, pizzaType, search } = req.query;
    const filter = { isAvailable: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (pizzaType && pizzaType !== 'All') {
      filter.pizzaType = pizzaType;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const pizzas = await Pizza.find(filter).sort({ isChefSpecial: -1, rating: -1 });

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
        message: 'Pizza not found',
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
