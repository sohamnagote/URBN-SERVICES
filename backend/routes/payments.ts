import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';

const router = Router();

// POST /api/payments/initiate - Initiate payment order
router.post('/initiate', (req, res, next) => paymentController.initiate(req, res, next));

// POST /api/payments/confirm - Verify and confirm payment state
router.post('/confirm', (req, res, next) => paymentController.confirm(req, res, next));

export default router;
