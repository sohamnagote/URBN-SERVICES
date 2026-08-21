import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/paymentService';

export class PaymentController {
  public initiate(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId, amount, paymentMethod, userId } = req.body;
      if (!bookingId || !amount) {
        return res.status(400).json({ error: 'bookingId and amount are required.' });
      }
      const result = paymentService.initiate(bookingId, amount, paymentMethod, userId);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId, transactionId, paymentMethod, userId } = req.body;
      const booking = paymentService.confirm(bookingId, transactionId, paymentMethod, userId);
      return res.json({
        success: true,
        message: 'Payment confirmed & digitized invoice generated.',
        booking,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
