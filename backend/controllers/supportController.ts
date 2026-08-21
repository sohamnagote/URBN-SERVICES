import { Request, Response, NextFunction } from 'express';
import { supportService } from '../services/supportService';

export class SupportController {
  public getTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, bookingId } = req.query;
      const list = supportService.getTickets({
        userId: userId as string,
        bookingId: bookingId as string,
      });
      return res.json({ count: list.length, tickets: list });
    } catch (err) {
      next(err);
    }
  }

  public createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId, subject, category, messageText, userId, userName } = req.body;
      if (!subject || !category || !messageText) {
        return res.status(400).json({ error: 'Subject, category, and message text are required.' });
      }
      const ticket = supportService.createTicket({
        bookingId,
        subject,
        category,
        messageText,
        userId,
        userName,
      });
      return res.status(201).json({
        success: true,
        message: 'Support ticket registered. Central coordinator assigned.',
        ticket,
      });
    } catch (err) {
      next(err);
    }
  }

  public replyTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { text, sender, senderName } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Message text is required.' });
      }
      const ticket = supportService.replyTicket(id, text, sender, senderName);
      return res.json({
        success: true,
        ticket,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const supportController = new SupportController();
