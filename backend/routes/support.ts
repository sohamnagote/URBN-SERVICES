import { Router } from 'express';
import { supportController } from '../controllers/supportController';

const router = Router();

// GET /api/support/tickets - List support tickets
router.get('/tickets', (req, res, next) => supportController.getTickets(req, res, next));

// POST /api/support/tickets - Create support ticket
router.post('/tickets', (req, res, next) => supportController.createTicket(req, res, next));

// POST /api/support/tickets/:id/reply - Add message to ticket
router.post('/tickets/:id/reply', (req, res, next) => supportController.replyTicket(req, res, next));

export default router;
