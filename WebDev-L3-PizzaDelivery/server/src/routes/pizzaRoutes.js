import express from 'express';
import {
  getAllPizzas,
  getPizzaById,
  getCustomizerOptions,
  createPizza,
  updatePizza,
  togglePizzaAvailability,
  deletePizza,
} from '../controllers/pizzaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllPizzas);
router.get('/customizer/options', getCustomizerOptions);
router.get('/:id', getPizzaById);

// Admin-only mutation routes
router.post('/', protect, authorizeAdmin, createPizza);
router.patch('/:id', protect, authorizeAdmin, updatePizza);
router.patch('/:id/toggle-availability', protect, authorizeAdmin, togglePizzaAvailability);
router.delete('/:id', protect, authorizeAdmin, deletePizza);

export default router;
