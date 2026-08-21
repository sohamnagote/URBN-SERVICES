import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { validate } from '../middlewares/validateMiddleware';
import { validateReviewSubmit } from '../validators/reviewValidators';

const router = Router();

// GET /api/reviews - List verified customer reviews
router.get('/', (req, res, next) => reviewController.getAll(req, res, next));

// POST /api/reviews - Submit verified review for completed booking
router.post('/', validate(validateReviewSubmit), (req, res, next) => reviewController.submit(req, res, next));

export default router;
