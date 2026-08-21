import { Request, Response, NextFunction } from 'express';
import { operationsService } from '../services/operationsService';
import { auditRepository } from '../repositories/auditRepository';

export class OperationsController {
  public getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = operationsService.getOverviewMetrics();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  public reassign(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId, newProviderId, actorId, reason } = req.body;
      const booking = operationsService.reassignBooking(
        bookingId,
        newProviderId,
        reason,
        actorId || 'ops_controller',
        'operations'
      );
      return res.json({
        success: true,
        message: `Booking successfully reassigned to ${booking.provider?.name || 'new technician'}`,
        booking,
      });
    } catch (err) {
      next(err);
    }
  }

  public getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 50;
      return res.json({
        total: auditRepository.getTotalAuditCount(),
        logs: auditRepository.getAuditLogs(limit),
      });
    } catch (err) {
      next(err);
    }
  }

  public getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 100;
      const events = auditRepository.getAnalyticsEvents(limit);
      return res.json({
        total: events.length,
        events,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const operationsController = new OperationsController();
