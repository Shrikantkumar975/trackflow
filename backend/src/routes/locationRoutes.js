import express from 'express';
import { updateLocation, getLocation } from '../controllers/locationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('agent', 'admin'), updateLocation);
router.get('/:orderId', getLocation);

export default router;
