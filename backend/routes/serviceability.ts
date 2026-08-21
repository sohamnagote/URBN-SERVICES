import { Router } from 'express';
import { serviceabilityController } from '../controllers/serviceabilityController';

const router = Router();

// GET /api/serviceability/areas - List all Nashik service areas & operational status
router.get('/areas', (req, res, next) => serviceabilityController.getAreas(req, res, next));

// POST /api/serviceability/check - Authoritative serviceability and 1-Day Promise verification
router.post('/check', (req, res, next) => serviceabilityController.checkServiceability(req, res, next));

export default router;
