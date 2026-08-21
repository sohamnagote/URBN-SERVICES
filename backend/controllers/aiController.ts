import { Request, Response, NextFunction } from 'express';
import { aiGroundingService } from '../services/aiGroundingService';

export class AIController {
  public async handleGrounding(req: Request, res: Response, next: NextFunction) {
    try {
      const { prompt, locality } = req.body;
      const result = await aiGroundingService.queryMapsGrounding(prompt, locality);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public async handleRouteAdvisor(req: Request, res: Response, next: NextFunction) {
    try {
      const { originLocality, destinationLocality, serviceType } = req.body;
      const result = await aiGroundingService.getRouteAdvice(originLocality, destinationLocality, serviceType);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AIController();
