import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAdmin } from '../middlewares/adminAuthMiddleware';

const router = Router();

// 1. GET /api/admin/auth-check - Verify admin access for current session
router.get('/auth-check', (req, res) => adminController.authCheck(req, res));

// 2. GET /api/admin/overview - Executive Command Center Metrics
router.get('/overview', requireAdmin, (req, res, next) => adminController.getOverview(req, res, next));

// 3. GET /api/admin/bookings - Query bookings with advanced filters
router.get('/bookings', requireAdmin, (req, res, next) => adminController.getBookings(req, res, next));

// 4. PATCH /api/admin/bookings/:id/reassign - Admin provider reassignment
router.patch('/bookings/:id/reassign', requireAdmin, (req, res, next) => adminController.reassignBooking(req, res, next));

// 5. GET /api/admin/providers - Complete provider directory
router.get('/providers', requireAdmin, (req, res, next) => adminController.getProviders(req, res, next));

// 6. PATCH /api/admin/providers/:id/status - Update provider verification & duty
router.patch('/providers/:id/status', requireAdmin, (req, res, next) => adminController.updateProviderStatus(req, res, next));

// 7. GET /api/admin/provider-applications - Verification review pipeline
router.get('/provider-applications', requireAdmin, (req, res, next) => adminController.getProviderApplications(req, res, next));

// 8. PATCH /api/admin/provider-applications/:id/review - Approve or reject partner application
router.patch('/provider-applications/:id/review', requireAdmin, (req, res, next) => adminController.reviewProviderApplication(req, res, next));

// 9. GET /api/admin/notifications - Operational alert stream
router.get('/notifications', requireAdmin, (req, res) => adminController.getNotifications(req, res));

// 10. PATCH /api/admin/notifications/:id/read - Mark single notification as read
router.patch('/notifications/:id/read', requireAdmin, (req, res) => adminController.markNotificationRead(req, res));

// 11. POST /api/admin/notifications/mark-all-read - Mark all read
router.post('/notifications/mark-all-read', requireAdmin, (req, res) => adminController.markAllNotificationsRead(req, res));

// 12. PATCH /api/admin/notifications/preferences - Update notification alert toggles
router.patch('/notifications/preferences', requireAdmin, (req, res) => adminController.updateNotificationPreferences(req, res));

// 13. GET /api/admin/service-areas - Service areas and hubs
router.get('/service-areas', requireAdmin, (req, res) => adminController.getServiceAreas(req, res));

// 14. PATCH /api/admin/service-areas/:id - Toggle hub serviceability & SLA
router.patch('/service-areas/:id', requireAdmin, (req, res) => adminController.updateServiceArea(req, res));

// 15. GET /api/admin/audit-logs - Immutable system audit logs
router.get('/audit-logs', requireAdmin, (req, res) => adminController.getAuditLogs(req, res));

// 16. GET /api/admin/system-health - Diagnostics & server metrics
router.get('/system-health', requireAdmin, (req, res) => adminController.getSystemHealth(req, res));

export default router;
