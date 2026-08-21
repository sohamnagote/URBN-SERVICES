import { Router } from 'express';
import { providerController } from '../controllers/providerController';
import { validate } from '../middlewares/validateMiddleware';
import { validateProviderApply } from '../validators/providerValidators';

const router = Router();

// GET /api/providers - List all registered providers
router.get('/', (req, res, next) => providerController.getAll(req, res, next));

// POST /api/providers/apply - Apply to become a service provider
router.post('/apply', validate(validateProviderApply), (req, res, next) => providerController.apply(req, res, next));

// GET /api/providers/application-status/:userId - Check applicant status
router.get('/application-status/:userId', (req, res, next) => providerController.getApplicationStatus(req, res, next));

// GET /api/providers/:id - Get specific provider details, active jobs, and earnings summary
router.get('/:id', (req, res, next) => providerController.getById(req, res, next));

// PATCH /api/providers/:id/duty - Toggle Duty Online/Offline
router.patch('/:id/duty', (req, res, next) => providerController.toggleDuty(req, res, next));

// POST /api/providers/:id/payout - Initiate payout settlement
router.post('/:id/payout', (req, res, next) => providerController.initiatePayout(req, res, next));

export default router;
