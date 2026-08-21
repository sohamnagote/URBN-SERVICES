import { Request, Response, NextFunction } from 'express';
import { providerService } from '../services/providerService';
import { providerRepository } from '../repositories/providerRepository';

export class ProviderController {
  public getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, locality, onlineOnly } = req.query;
      const list = providerRepository.findAll({
        category: category as string,
        locality: locality as string,
        onlineOnly: onlineOnly === 'true',
      });
      return res.json({ count: list.length, providers: list });
    } catch (err) {
      next(err);
    }
  }

  public getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const details = providerService.getProviderDetails(id);
      return res.json(details);
    } catch (err) {
      next(err);
    }
  }

  public toggleDuty(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isOnline } = req.body;
      const provider = providerService.toggleDuty(id, isOnline);
      return res.json({
        success: true,
        message: `Duty status updated to ${provider.isOnline ? 'Online' : 'Offline'}`,
        provider,
      });
    } catch (err) {
      next(err);
    }
  }

  public initiatePayout(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = providerService.initiatePayout(id);
      return res.json({
        success: true,
        message: `Payout of ₹${result.payoutAmount} successfully initiated to provider bank account via UPI.`,
        payoutAmount: result.payoutAmount,
        payoutStatus: result.payoutStatus,
      });
    } catch (err) {
      next(err);
    }
  }

  public apply(req: Request, res: Response, next: NextFunction) {
    try {
      const application = providerService.apply(req.body);
      return res.status(201).json({
        success: true,
        message: 'Your service partner application has been submitted and is under operational review.',
        application,
      });
    } catch (err) {
      next(err);
    }
  }

  public getApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const email = req.query.email as string;
      const result = providerService.getApplicationStatus(userId, email);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const providerController = new ProviderController();
