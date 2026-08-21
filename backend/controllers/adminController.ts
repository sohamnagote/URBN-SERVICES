import { Request, Response, NextFunction } from 'express';
import { AUTHORIZED_ADMIN_EMAILS } from '../config/constants';
import { backendStore } from '../store/backendStore';
import { bookingRepository } from '../repositories/bookingRepository';
import { providerRepository } from '../repositories/providerRepository';
import { auditRepository } from '../repositories/auditRepository';
import { operationsService } from '../services/operationsService';
import { providerService } from '../services/providerService';

export class AdminController {
  public authCheck(req: Request, res: Response) {
    const userEmail = (
      req.headers['x-admin-email'] ||
      req.headers['x-user-email'] ||
      req.query.email ||
      ''
    ).toString().toLowerCase().trim();

    const isAuthorized = AUTHORIZED_ADMIN_EMAILS.has(userEmail);

    if (isAuthorized) {
      return res.json({
        authorized: true,
        role: 'admin',
        user: {
          email: userEmail,
          name: userEmail === 'someshnagote14@gmail.com' ? 'Somesh Nagote' : 'Platform Administrator',
          role: 'Super Administrator',
          permissions: ['ALL_PERMISSIONS', 'MANAGE_PROVIDERS', 'MANAGE_BOOKINGS', 'OVERRIDE_SLA', 'FINANCE_ACCESS', 'AUDIT_LOGS'],
        },
      });
    }

    return res.status(403).json({
      authorized: false,
      role: 'customer',
      error: 'User is not an authorized administrator.',
    });
  }

  public getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = operationsService.getOverviewMetrics();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  public getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, locality, category, search } = req.query;
      const list = bookingRepository.findAll({
        status: status as string,
        locality: locality as string,
        category: category as string,
        search: search as string,
      });
      return res.json({ count: list.length, bookings: list });
    } catch (err) {
      next(err);
    }
  }

  public reassignBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newProviderId, reason, adminEmail } = req.body;
      const booking = operationsService.reassignBooking(
        id,
        newProviderId,
        reason,
        adminEmail || req.headers['x-admin-email']?.toString() || 'someshnagote14@gmail.com',
        'admin'
      );
      return res.json({
        success: true,
        message: `Booking reassigned to ${booking.provider?.name || 'new technician'}`,
        booking,
      });
    } catch (err) {
      next(err);
    }
  }

  public getProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const providers = providerRepository.findAll();
      const allBookings = bookingRepository.findAll();

      const enrichedProviders = providers.map((p) => {
        const assigned = allBookings.filter((b) => b.provider?.id === p.id);
        const active = assigned.filter((b) => b.status !== 'Completed' && b.status !== 'Cancelled');
        const completed = assigned.filter((b) => b.status === 'Completed');
        return {
          ...p,
          activeJobsCount: active.length,
          completedJobsCount: completed.length,
        };
      });

      return res.json({ count: enrichedProviders.length, providers: enrichedProviders });
    } catch (err) {
      next(err);
    }
  }

  public updateProviderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { verificationStatus, reason, adminEmail } = req.body;

      const provider = providerRepository.findById(id);
      if (!provider) {
        return res.status(404).json({ error: `Provider ${id} not found.` });
      }

      const prevStatus = provider.verificationStatus;
      provider.verificationStatus = verificationStatus;
      if (verificationStatus === 'Suspended' || verificationStatus === 'Rejected') {
        provider.isOnline = false;
      }
      providerRepository.save(provider);

      auditRepository.record({
        actorId: adminEmail || 'someshnagote14@gmail.com',
        actorRole: 'admin',
        action: 'ADMIN_PROVIDER_STATUS_CHANGE',
        resource: 'provider',
        resourceId: id,
        previousState: { verificationStatus: prevStatus },
        newState: { verificationStatus },
        reason: reason || `Admin updated status to ${verificationStatus}`,
      });

      return res.json({ success: true, message: `Provider status updated to ${verificationStatus}`, provider });
    } catch (err) {
      next(err);
    }
  }

  public getProviderApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const applications = providerRepository.findAllApplications();
      return res.json({ count: applications.length, applications });
    } catch (err) {
      next(err);
    }
  }

  public reviewProviderApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { action, internalNotes, rejectionReason, adminEmail } = req.body;
      const result = providerService.reviewApplication(id, action, internalNotes, rejectionReason, adminEmail);
      return res.json({
        success: true,
        message: action === 'approve'
          ? `Partner application for ${result.application.applicantName} approved. Provider profile activated!`
          : `Application for ${result.application.applicantName} rejected.`,
        application: result.application,
        ...(result.provider ? { provider: result.provider } : {}),
      });
    } catch (err) {
      next(err);
    }
  }

  public getNotifications(req: Request, res: Response) {
    const unreadCount = backendStore.notifications.filter((n) => !n.read).length;
    return res.json({
      unreadCount,
      totalCount: backendStore.notifications.length,
      notifications: backendStore.notifications,
      preferences: backendStore.notificationPreferences,
    });
  }

  public markNotificationRead(req: Request, res: Response) {
    const { id } = req.params;
    const notif = backendStore.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
    }
    return res.json({ success: true, notification: notif });
  }

  public markAllNotificationsRead(req: Request, res: Response) {
    backendStore.notifications.forEach((n) => {
      n.read = true;
    });
    return res.json({ success: true, message: 'All notifications marked as read' });
  }

  public updateNotificationPreferences(req: Request, res: Response) {
    backendStore.notificationPreferences = {
      ...backendStore.notificationPreferences,
      ...req.body,
    };
    return res.json({ success: true, preferences: backendStore.notificationPreferences });
  }

  public getServiceAreas(req: Request, res: Response) {
    return res.json({ hubs: backendStore.serviceAreas });
  }

  public updateServiceArea(req: Request, res: Response) {
    const { id } = req.params;
    const hub = backendStore.serviceAreas.find((h) => h.id === id);
    if (!hub) {
      return res.status(404).json({ error: `Hub ${id} not found.` });
    }

    Object.assign(hub, req.body);

    auditRepository.record({
      actorId: req.headers['x-admin-email']?.toString() || 'someshnagote14@gmail.com',
      actorRole: 'admin',
      action: 'ADMIN_SERVICE_AREA_UPDATED',
      resource: 'service_area',
      resourceId: id,
      newState: hub,
      reason: 'Updated hub coverage settings',
    });

    return res.json({ success: true, hub });
  }

  public getAuditLogs(req: Request, res: Response) {
    const limit = Number(req.query.limit) || 100;
    return res.json({
      total: auditRepository.getTotalAuditCount(),
      logs: auditRepository.getAuditLogs(limit),
    });
  }

  public getSystemHealth(req: Request, res: Response) {
    return res.json(operationsService.getSystemHealth());
  }
}

export const adminController = new AdminController();
