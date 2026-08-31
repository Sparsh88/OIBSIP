import { Inventory } from '../models/Inventory.js';
import { emitInventoryUpdate } from '../config/socket.js';
import { restockInventoryItem } from '../services/inventoryService.js';

/**
 * @desc    Get all inventory ingredients with low-stock status
 * @route   GET /api/inventory
 * @access  Private/Admin
 */
export const getInventory = async (req, res, next) => {
  try {
    const { category, search, lowStockOnly } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    let items = await Inventory.find(filter).sort({ category: 1, name: 1 });

    if (lowStockOnly === 'true') {
      items = items.filter((i) => i.quantity <= i.lowStockThreshold);
    }

    res.json({
      success: true,
      count: items.length,
      inventory: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add new inventory ingredient
 * @route   POST /api/inventory
 * @access  Private/Admin
 */
export const addInventoryItem = async (req, res, next) => {
  try {
    const { name, category, quantity, unit, lowStockThreshold, priceModifier, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required',
      });
    }

    const item = await Inventory.create({
      name: name.trim(),
      category,
      quantity: Number(quantity) || 0,
      unit: unit || 'portions',
      lowStockThreshold: Number(lowStockThreshold) || 20,
      priceModifier: Number(priceModifier) || 0,
      description: description || '',
    });

    emitInventoryUpdate(item);

    res.status(201).json({
      success: true,
      message: 'Ingredient added to inventory successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing inventory item details
 * @route   PATCH /api/inventory/:id
 * @access  Private/Admin
 */
export const updateInventoryItem = async (req, res, next) => {
  try {
    const { name, category, quantity, unit, lowStockThreshold, priceModifier, isAvailable } = req.body;

    const item = await Inventory.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    if (name) item.name = name.trim();
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit) item.unit = unit;
    if (lowStockThreshold !== undefined) item.lowStockThreshold = Number(lowStockThreshold);
    if (priceModifier !== undefined) item.priceModifier = Number(priceModifier);
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    await item.save();
    emitInventoryUpdate(item);

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick restock inventory item
 * @route   POST /api/inventory/:id/restock
 * @access  Private/Admin
 */
export const restockItem = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const addQty = Number(amount) || 10;

    const item = await restockInventoryItem(req.params.id, addQty);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.json({
      success: true,
      message: `Restocked ${addQty} ${item.unit} to ${item.name}`,
      item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private/Admin
 */
export const deleteInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.json({
      success: true,
      message: 'Inventory item removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
