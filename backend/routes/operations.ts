import { Router } from 'express';
import { operationsController } from '../controllers/operationsController';

const router = Router();

// GET /api/operations/dashboard - Consolidated metrics & live dispatch feed
router.get('/dashboard', (req, res, next) => operationsController.getDashboard(req, res, next));

// POST /api/operations/reassign - Manually reassign technician to a booking
router.post('/reassign', (req, res, next) => operationsController.reassign(req, res, next));

// GET /api/operations/audit-logs - Query immutable audit logs
router.get('/audit-logs', (req, res, next) => operationsController.getAuditLogs(req, res, next));

// GET /api/operations/analytics - Query analytics funnel events
router.get('/analytics', (req, res, next) => operationsController.getAnalytics(req, res, next));

export default router;
