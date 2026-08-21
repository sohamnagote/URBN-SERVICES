import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.post('/google', (req, res, next) => authController.handleGoogleAuth(req, res, next));

export default router;
