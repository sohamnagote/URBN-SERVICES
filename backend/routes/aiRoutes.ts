import { Router } from 'express';
import { aiController } from '../controllers/aiController';

const router = Router();

router.post('/grounding', (req, res, next) => aiController.handleGrounding(req, res, next));
router.post('/route-advisor', (req, res, next) => aiController.handleRouteAdvisor(req, res, next));

export default router;
