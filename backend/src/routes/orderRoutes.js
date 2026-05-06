import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  assignAgent 
} from '../controllers/orderController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('customer'), createOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(authorize('agent', 'admin'), updateOrderStatus);

router.route('/:id/assign')
  .put(authorize('admin'), assignAgent);

export default router;
