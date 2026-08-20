import express from 'express';
import {
  AudienceCriteria,
  DeepLinkDestination,
  NotificationCategory,
  PushNotificationJob,
} from '../../src/types';
import { backendStore } from '../store';
import { notificationService } from '../services/notificationService';

export const notificationRouter = express.Router();

// Admin Authentication Middleware (Role-Based Access Control)
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const adminEmail = (req.headers['x-admin-email'] as string) || req.body?.adminEmail || (req.query?.adminEmail as string);
  const authorizedAdmins = ['someshnagote14@gmail.com', 'admin@urbnservices.in', 'operations@urbnservices.in'];

  if (!adminEmail || !authorizedAdmins.some((a) => a.toLowerCase() === adminEmail.toLowerCase())) {
    return res.status(403).json({
      error: 'Access Denied: You do not have permission to manage custom notifications.',
      requiredRole: 'admin',
    });
  }
  next();
}

// -------------------------------------------------------------
// 1. CLIENT DEVICE REGISTRATION & USER INBOX ENDPOINTS
// -------------------------------------------------------------

// Register or refresh device token
notificationRouter.post('/devices/register', (req, res) => {
  try {
    const { userId, userRole, userEmail, pushToken, platform, browser, permissionStatus, deviceId } = req.body;
    if (!userId || !pushToken) {
      return res.status(400).json({ error: 'userId and pushToken are required' });
    }

    const deviceRecord = notificationService.registerDevice({
      userId,
      userRole: userRole || 'customer',
      userEmail,
      pushToken,
      platform,
      browser,
      permissionStatus,
      deviceId,
    });

    res.json({ success: true, device: deviceRecord });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register device' });
  }
});

// Unregister device token
notificationRouter.post('/devices/unregister', (req, res) => {
  try {
    const { deviceId } = req.body;
    if (deviceId) {
      notificationService.unregisterDevice(deviceId);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to unregister device' });
  }
});

// Get user inbox notifications
notificationRouter.get('/user', (req, res) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'customer-rohit-nashik';
    const list = notificationService.getUserInbox(userId);
    const unreadCount = list.filter((n) => !n.read).length;

    res.json({
      success: true,
      notifications: list,
      unreadCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user notifications' });
  }
});

// Mark single user inbox item as read
notificationRouter.patch('/user/:id/read', (req, res) => {
  try {
    const userId = (req.body.userId as string) || (req.headers['x-user-id'] as string) || 'customer-rohit-nashik';
    const notifId = req.params.id;

    const marked = notificationService.markInboxItemRead(userId, notifId);
    res.json({ success: marked });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark notification read' });
  }
});

// Mark all user inbox items as read
notificationRouter.post('/user/mark-all-read', (req, res) => {
  try {
    const userId = (req.body.userId as string) || (req.headers['x-user-id'] as string) || 'customer-rohit-nashik';
    const count = notificationService.markAllInboxRead(userId);
    res.json({ success: true, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to mark all read' });
  }
});

// Get / update user notification preferences
notificationRouter.get('/user/preferences', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'customer-rohit-nashik';
    const prefs = notificationService.userPreferences.get(userId) || {
      userId,
      bookingUpdates: true,
      serviceReminders: true,
      promotionsAndOffers: true,
      systemAlerts: true,
      soundEnabled: true,
      pushEnabled: true,
    };
    res.json({ success: true, preferences: prefs });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch preferences' });
  }
});

notificationRouter.patch('/user/preferences', (req, res) => {
  try {
    const { userId, preferences } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const existing = notificationService.userPreferences.get(userId) || {
      userId,
      bookingUpdates: true,
      serviceReminders: true,
      promotionsAndOffers: true,
      systemAlerts: true,
      soundEnabled: true,
      pushEnabled: true,
    };

    const updated = { ...existing, ...preferences, userId };
    notificationService.userPreferences.set(userId, updated);
    res.json({ success: true, preferences: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update preferences' });
  }
});

// -------------------------------------------------------------
// 2. ADMIN CUSTOM NOTIFICATION MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

// Calculate estimated audience count before sending
notificationRouter.post('/admin/audience-estimate', requireAdmin, (req, res) => {
  try {
    const audience: AudienceCriteria = req.body.audience || { type: 'all_users' };
    const userIds = notificationService.resolveAudienceUserIds(audience);
    
    // Count registered active devices
    let activeDevices = 0;
    for (const uid of userIds) {
      const devs = Array.from(notificationService.devices.values()).filter(
        (d) => d.userId === uid && d.isActive && d.permissionStatus === 'granted'
      );
      activeDevices += devs.length;
    }

    res.json({
      success: true,
      estimatedUserCount: userIds.length,
      estimatedDeviceCount: activeDevices,
      audienceType: audience.type,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to estimate audience' });
  }
});

// Get all notification jobs (Scheduled, Sent, Drafts, Failed)
notificationRouter.get('/admin/jobs', requireAdmin, (req, res) => {
  try {
    const statusFilter = req.query.status as string;
    const categoryFilter = req.query.category as string;
    const search = ((req.query.search as string) || '').toLowerCase().trim();

    let jobs = Array.from(notificationService.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (statusFilter && statusFilter !== 'all') {
      jobs = jobs.filter((j) => j.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (categoryFilter && categoryFilter !== 'all') {
      jobs = jobs.filter((j) => j.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (search) {
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search) ||
          j.message.toLowerCase().includes(search) ||
          j.id.toLowerCase().includes(search) ||
          j.createdBy.toLowerCase().includes(search)
      );
    }

    res.json({
      success: true,
      jobs,
      totalCount: jobs.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to list jobs' });
  }
});

// Create new custom push notification (Send Now or Schedule)
notificationRouter.post('/admin/jobs', requireAdmin, async (req, res) => {
  try {
    const adminEmail = (req.headers['x-admin-email'] as string) || req.body.adminEmail || 'someshnagote14@gmail.com';
    const {
      title,
      message,
      category,
      iconType,
      iconUrl,
      audience,
      deepLink,
      deliveryType,
      scheduledFor,
      timezone,
      templateId,
    } = req.body;

    // Strict validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Notification Title is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Notification Message body is required.' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Notification Category is required.' });
    }

    const isScheduled = deliveryType === 'scheduled';
    if (isScheduled) {
      if (!scheduledFor) {
        return res.status(400).json({ error: 'Scheduled Date and Time are required for scheduled delivery.' });
      }
      const scheduledTime = new Date(scheduledFor).getTime();
      if (isNaN(scheduledTime) || scheduledTime <= Date.now()) {
        return res.status(400).json({
          error: 'Invalid Schedule Time: Scheduled time must be strictly in the future.',
        });
      }
    }

    const newJob: PushNotificationJob = {
      id: `job-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      message: message.trim(),
      category: category as NotificationCategory,
      iconType: iconType || 'bell',
      iconUrl: iconUrl || undefined,
      audience: audience || { type: 'all_users' },
      deepLink: deepLink || undefined,
      deliveryType: isScheduled ? 'scheduled' : 'send_now',
      scheduledFor: isScheduled ? new Date(scheduledFor).toISOString() : undefined,
      timezone: timezone || 'Asia/Kolkata',
      status: isScheduled ? 'Scheduled' : 'Processing',
      createdBy: adminEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        targetUserCount: 0,
        activeDeviceCount: 0,
        deliveredCount: 0,
        failedCount: 0,
        invalidTokensCount: 0,
      },
      deliveryLogs: [],
      retryCount: 0,
      maxRetries: 3,
      templateId,
    };

    notificationService.jobs.set(newJob.id, newJob);

    backendStore.recordAudit({
      actorId: adminEmail,
      actorRole: 'admin',
      action: isScheduled ? 'NOTIFICATION_SCHEDULED' : 'NOTIFICATION_DISPATCH_INITIATED',
      resource: 'push_notification_job',
      resourceId: newJob.id,
      reason: isScheduled
        ? `Notification '${newJob.title}' scheduled for ${newJob.scheduledFor} (${newJob.timezone})`
        : `Immediate broadcast for '${newJob.title}' initiated by admin`,
    });

    if (isScheduled) {
      return res.json({
        success: true,
        job: newJob,
        message: `Notification successfully scheduled for ${new Date(newJob.scheduledFor!).toLocaleString('en-IN')}`,
      });
    }

    // Execute immediate dispatch
    const completedJob = await notificationService.dispatchJob(newJob);
    res.json({
      success: true,
      job: completedJob,
      message: `Notification successfully dispatched to ${completedJob.stats.deliveredCount} devices.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process notification creation' });
  }
});

// Get job details by ID
notificationRouter.get('/admin/jobs/:id', requireAdmin, (req, res) => {
  try {
    const job = notificationService.jobs.get(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Notification job not found' });
    }
    res.json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch job details' });
  }
});

// Cancel a scheduled job
notificationRouter.patch('/admin/jobs/:id/cancel', requireAdmin, (req, res) => {
  try {
    const adminEmail = (req.headers['x-admin-email'] as string) || req.body.adminEmail || 'someshnagote14@gmail.com';
    const job = notificationService.jobs.get(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Notification job not found' });
    }

    if (job.status !== 'Scheduled') {
      return res.status(400).json({
        error: `Cannot cancel notification with status '${job.status}'. Only 'Scheduled' notifications can be cancelled.`,
      });
    }

    job.status = 'Cancelled';
    job.cancelledAt = new Date().toISOString();
    job.cancelledBy = adminEmail;
    job.updatedAt = new Date().toISOString();

    backendStore.recordAudit({
      actorId: adminEmail,
      actorRole: 'admin',
      action: 'NOTIFICATION_CANCELLED',
      resource: 'push_notification_job',
      resourceId: job.id,
      reason: `Scheduled notification '${job.title}' was cancelled by admin before dispatch.`,
    });

    res.json({ success: true, job, message: 'Notification schedule cancelled successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to cancel job' });
  }
});

// Trigger immediate send of a scheduled job
notificationRouter.post('/admin/jobs/:id/send-now', requireAdmin, async (req, res) => {
  try {
    const adminEmail = (req.headers['x-admin-email'] as string) || req.body.adminEmail || 'someshnagote14@gmail.com';
    const job = notificationService.jobs.get(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Notification job not found' });
    }

    if (job.status !== 'Scheduled' && job.status !== 'Draft' && job.status !== 'Failed') {
      return res.status(400).json({
        error: `Cannot trigger send for notification with status '${job.status}'.`,
      });
    }

    job.deliveryType = 'send_now';
    const result = await notificationService.dispatchJob(job);

    backendStore.recordAudit({
      actorId: adminEmail,
      actorRole: 'admin',
      action: 'NOTIFICATION_SEND_NOW_OVERRIDE',
      resource: 'push_notification_job',
      resourceId: job.id,
      reason: `Admin overrode schedule to send notification immediately.`,
    });

    res.json({
      success: true,
      job: result,
      message: `Notification immediately dispatched to ${result.stats.deliveredCount} devices.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to execute immediate send' });
  }
});

// Delete notification job
notificationRouter.delete('/admin/jobs/:id', requireAdmin, (req, res) => {
  try {
    const adminEmail = (req.headers['x-admin-email'] as string) || 'someshnagote14@gmail.com';
    const job = notificationService.jobs.get(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Notification job not found' });
    }

    notificationService.jobs.delete(req.params.id);

    backendStore.recordAudit({
      actorId: adminEmail,
      actorRole: 'admin',
      action: 'NOTIFICATION_DELETED',
      resource: 'push_notification_job',
      resourceId: req.params.id,
      reason: `Notification '${job.title}' deleted by admin`,
    });

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete notification' });
  }
});

// Send Test Notification (Admin only test device)
notificationRouter.post('/admin/test', requireAdmin, async (req, res) => {
  try {
    const adminEmail = (req.headers['x-admin-email'] as string) || req.body.adminEmail || 'someshnagote14@gmail.com';
    const testPayload = req.body;

    const result = await notificationService.sendTestNotification(testPayload, adminEmail);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send test notification' });
  }
});

// Get Templates
notificationRouter.get('/admin/templates', requireAdmin, (req, res) => {
  try {
    const list = Array.from(notificationService.templates.values());
    res.json({ success: true, templates: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch templates' });
  }
});

// Save custom template
notificationRouter.post('/admin/templates', requireAdmin, (req, res) => {
  try {
    const { title, message, category, iconType, iconUrl, deepLink, description, audienceSuggestion } = req.body;
    if (!title || !message || !category) {
      return res.status(400).json({ error: 'Title, message and category are required to save a template.' });
    }

    const templateId = `tmpl-custom-${Date.now()}`;
    const newTemplate = {
      id: templateId,
      title: title.trim(),
      message: message.trim(),
      category,
      iconType: iconType || 'bell',
      iconUrl,
      deepLink,
      isBuiltIn: false,
      audienceSuggestion,
      description: description || 'Custom saved admin template',
    };

    notificationService.templates.set(templateId, newTemplate);
    res.json({ success: true, template: newTemplate, message: 'Template saved successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save template' });
  }
});

// Notification summary analytics
notificationRouter.get('/admin/analytics', requireAdmin, (req, res) => {
  try {
    const jobs = Array.from(notificationService.jobs.values());
    const totalJobs = jobs.length;
    const sentJobs = jobs.filter((j) => j.status === 'Sent' || j.status === 'Partially Sent');
    const scheduledJobs = jobs.filter((j) => j.status === 'Scheduled');
    const failedJobs = jobs.filter((j) => j.status === 'Failed');

    let totalDelivered = 0;
    let totalFailed = 0;
    let totalTargeted = 0;

    sentJobs.forEach((j) => {
      totalDelivered += j.stats.deliveredCount || 0;
      totalFailed += j.stats.failedCount || 0;
      totalTargeted += j.stats.targetUserCount || 0;
    });

    const deliverySuccessRate =
      totalDelivered + totalFailed > 0
        ? Math.round((totalDelivered / (totalDelivered + totalFailed)) * 100)
        : 100;

    const totalActiveDevices = Array.from(notificationService.devices.values()).filter((d) => d.isActive).length;

    res.json({
      success: true,
      analytics: {
        totalJobs,
        totalSent: sentJobs.length,
        totalScheduled: scheduledJobs.length,
        totalFailed: failedJobs.length,
        totalDeliveredMessages: totalDelivered,
        totalFailedMessages: totalFailed,
        deliverySuccessRate,
        totalActiveRegisteredDevices: totalActiveDevices,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load notification analytics' });
  }
});
