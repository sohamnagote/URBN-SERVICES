import express from 'express';
import { notificationController } from '../controllers/notificationController';
import { requireAdmin } from '../middlewares/adminAuthMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { validateCreateNotificationJob, validateRegisterDevice } from '../validators/notificationValidators';

export const notificationRouter = express.Router();

// -------------------------------------------------------------
// 1. CLIENT DEVICE REGISTRATION & USER INBOX ENDPOINTS
// -------------------------------------------------------------

// Register or refresh device token
notificationRouter.post('/devices/register', validate(validateRegisterDevice), (req, res, next) =>
  notificationController.registerDevice(req, res, next)
);

// Unregister device token
notificationRouter.post('/devices/unregister', (req, res, next) =>
  notificationController.unregisterDevice(req, res, next)
);

// Get user inbox notifications
notificationRouter.get('/user', (req, res, next) =>
  notificationController.getUserInbox(req, res, next)
);

// Mark single user inbox item as read
notificationRouter.patch('/user/:id/read', (req, res, next) =>
  notificationController.markUserItemRead(req, res, next)
);

// Mark all user inbox items as read
notificationRouter.post('/user/mark-all-read', (req, res, next) =>
  notificationController.markAllUserItemsRead(req, res, next)
);

// Get / update user notification preferences
notificationRouter.get('/user/preferences', (req, res, next) =>
  notificationController.getUserPreferences(req, res, next)
);

notificationRouter.patch('/user/preferences', (req, res, next) =>
  notificationController.updateUserPreferences(req, res, next)
);

// -------------------------------------------------------------
// 2. ADMIN CUSTOM NOTIFICATION MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

// Calculate estimated audience count before sending
notificationRouter.post('/admin/audience-estimate', requireAdmin, (req, res, next) =>
  notificationController.estimateAudience(req, res, next)
);

// Get all notification jobs (Scheduled, Sent, Drafts, Failed)
notificationRouter.get('/admin/jobs', requireAdmin, (req, res, next) =>
  notificationController.getJobs(req, res, next)
);

// Create new custom push notification (Send Now or Schedule)
notificationRouter.post('/admin/jobs', requireAdmin, validate(validateCreateNotificationJob), (req, res, next) =>
  notificationController.createJob(req, res, next)
);

// Get job details by ID
notificationRouter.get('/admin/jobs/:id', requireAdmin, (req, res, next) =>
  notificationController.getJobById(req, res, next)
);

// Cancel a scheduled job
notificationRouter.patch('/admin/jobs/:id/cancel', requireAdmin, (req, res, next) =>
  notificationController.cancelJob(req, res, next)
);

// Trigger immediate send of a scheduled job
notificationRouter.post('/admin/jobs/:id/send-now', requireAdmin, (req, res, next) =>
  notificationController.sendJobNow(req, res, next)
);

// Delete notification job
notificationRouter.delete('/admin/jobs/:id', requireAdmin, (req, res, next) =>
  notificationController.deleteJob(req, res, next)
);

// Send Test Notification (Admin only test device)
notificationRouter.post('/admin/test', requireAdmin, (req, res, next) =>
  notificationController.sendTest(req, res, next)
);

// Get Templates
notificationRouter.get('/admin/templates', requireAdmin, (req, res, next) =>
  notificationController.getTemplates(req, res, next)
);

// Save custom template
notificationRouter.post('/admin/templates', requireAdmin, (req, res, next) =>
  notificationController.saveTemplate(req, res, next)
);

// Notification summary analytics
notificationRouter.get('/admin/analytics', requireAdmin, (req, res, next) =>
  notificationController.getAnalytics(req, res, next)
);

export default notificationRouter;
