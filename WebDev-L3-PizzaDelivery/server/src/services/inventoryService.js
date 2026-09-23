import { Inventory } from '../models/Inventory.js';
import { emitInventoryUpdate } from '../config/socket.js';

/**
 * Validate that sufficient inventory exists for all items in an order
 * @param {Array} orderItems - Array of pizza items with custom ingredients
 * @returns {Object} { isValid: boolean, missingItems: Array }
 */
export const validateInventoryForOrder = async (orderItems) => {
  const ingredientDemands = {};

  // Accumulate total ingredient portions needed
  for (const item of orderItems) {
    const qty = Number(item.quantity) || 1;

    // Base (1 per pizza)
    if (item.customBase) {
      ingredientDemands[item.customBase] = (ingredientDemands[item.customBase] || 0) + 1 * qty;
    }

    // Sauce (1 portion per pizza)
    if (item.customSauce) {
      ingredientDemands[item.customSauce] = (ingredientDemands[item.customSauce] || 0) + 1 * qty;
    }

    // Cheese (1 portion per pizza)
    if (item.customCheese) {
      ingredientDemands[item.customCheese] = (ingredientDemands[item.customCheese] || 0) + 1 * qty;
    }

    // Veggies (1 portion per chosen veggie per pizza)
    if (Array.isArray(item.customVeggies)) {
      for (const veg of item.customVeggies) {
        if (veg) {
          ingredientDemands[veg] = (ingredientDemands[veg] || 0) + 1 * qty;
        }
      }
    }
  }

  const missingItems = [];

  for (const [ingredientName, requiredQty] of Object.entries(ingredientDemands)) {
    const inventoryItem = await Inventory.findOne({
      name: { $regex: new RegExp(`^${ingredientName}$`, 'i') },
    });

    if (!inventoryItem) {
      // If item is not in inventory table, allow with warning or fail
      console.warn(`[Inventory] Ingredient "${ingredientName}" not tracked in inventory table`);
      continue;
    }

    if (inventoryItem.quantity < requiredQty) {
      missingItems.push({
        name: inventoryItem.name,
        available: inventoryItem.quantity,
        required: requiredQty,
        unit: inventoryItem.unit,
      });
    }
  }

  return {
    isValid: missingItems.length === 0,
    missingItems,
    demands: ingredientDemands,
  };
};

/**
 * Automatically deduct inventory after order confirmation
 * @param {Array} orderItems - Array of pizza items
 */
export const deductInventoryForOrder = async (orderItems) => {
  const { demands } = await validateInventoryForOrder(orderItems);
  const updatedItems = [];

  for (const [ingredientName, deductQty] of Object.entries(demands)) {
    const inventoryItem = await Inventory.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${ingredientName}$`, 'i') } },
      {
        $inc: { quantity: -deductQty },
      },
      { new: true }
    );

    if (inventoryItem) {
      // Ensure quantity does not fall below zero
      if (inventoryItem.quantity < 0) {
        inventoryItem.quantity = 0;
        await inventoryItem.save();
      }

      updatedItems.push(inventoryItem);
      emitInventoryUpdate(inventoryItem);
      console.log(`[Inventory Deducted] ${inventoryItem.name}: -${deductQty} (Remaining: ${inventoryItem.quantity} ${inventoryItem.unit})`);
    }
  }

  return updatedItems;
};

/**
 * Restock an inventory ingredient
 */
export const restockInventoryItem = async (itemId, addedQuantity) => {
  const item = await Inventory.findByIdAndUpdate(
    itemId,
    {
      $inc: { quantity: Number(addedQuantity) },
      $set: { isAvailable: true },
    },
    { new: true }
  );

  if (item) {
    emitInventoryUpdate(item);
  }

  return item;
};
