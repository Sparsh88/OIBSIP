import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide ingredient name'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: ['base', 'sauce', 'cheese', 'veggie'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 100,
    },
    unit: {
      type: String,
      default: 'portions',
    },
    lowStockThreshold: {
      type: Number,
      default: 20,
      min: [1, 'Threshold must be at least 1'],
    },
    priceModifier: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lastAlertSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to flag low stock
inventorySchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

export const Inventory = mongoose.model('Inventory', inventorySchema);
