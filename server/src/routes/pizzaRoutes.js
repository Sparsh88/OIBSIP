import express from 'express';
import {
  getAllPizzas,
  getPizzaById,
  getCustomizerOptions,
} from '../controllers/pizzaController.js';

const router = express.Router();

router.get('/', getAllPizzas);
router.get('/customizer/options', getCustomizerOptions);
router.get('/:id', getPizzaById);

export default router;
