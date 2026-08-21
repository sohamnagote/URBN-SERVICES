import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/bookingService';
import { bookingRepository } from '../repositories/bookingRepository';

export class BookingController {
  public getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, providerId, status } = req.query;
      const bookings = bookingRepository.findAll({
        userId: userId as string,
        providerId: providerId as string,
        status: status as string,
      });
      return res.json({ count: bookings.length, bookings });
    } catch (err) {
      next(err);
    }
  }

  public getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const booking = bookingRepository.findById(id);
      if (!booking) {
        return res.status(404).json({ error: `Booking ${id} not found.` });
      }
      return res.json(booking);
    } catch (err) {
      next(err);
    }
  }

  public create(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = bookingService.createBooking(req.body);
      return res.status(201).json({
        success: true,
        message: 'Booking created and professional dispatched successfully.',
        booking,
      });
    } catch (err) {
      next(err);
    }
  }

  public updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, actorId, actorRole, reason } = req.body;
      const booking = bookingService.updateStatus(id, status, actorId, actorRole, reason);
      return res.json({
        success: true,
        message: `Booking status updated to ${status}`,
        booking,
      });
    } catch (err) {
      next(err);
    }
  }

  public verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { otp, providerId } = req.body;
      const booking = bookingService.verifyOtp(id, otp, providerId);
      return res.json({
        success: true,
        message: 'OTP verified. Service started.',
        booking,
      });
    } catch (err) {
      next(err);
    }
  }

  public cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { actorId, actorRole, reason } = req.body;
      const booking = bookingService.cancelBooking(id, actorId, actorRole, reason);
      return res.json({
        success: true,
        message: 'Booking cancelled successfully.',
        booking,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const bookingController = new BookingController();
