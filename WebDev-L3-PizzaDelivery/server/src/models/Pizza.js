import mongoose from 'mongoose';

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide item name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
    },
    category: {
      type: String,
      default: 'Pizzas',
    },
    pizzaType: {
      type: String,
      enum: ['Veg', 'Non-Veg', 'Special', 'Beverages', 'Desserts', 'Extras', 'Sides', 'All'],
      default: 'Veg',
    },
    servings: {
      type: String,
      default: '1',
    },
    basePrice: {
      type: Number,
      required: [true, 'Please provide base price'],
      min: [0, 'Price must be positive'],
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    },
    defaultBase: {
      type: String,
      default: 'Classic Hand Tossed',
    },
    defaultSauce: {
      type: String,
      default: 'Classic Tomato Basil',
    },
    defaultCheese: {
      type: String,
      default: 'Mozzarella',
    },
    defaultVeggies: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 42,
    },
    preparationTime: {
      type: String,
      default: '15-20 mins',
    },
    isChefSpecial: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Pizza = mongoose.model('Pizza', pizzaSchema);
