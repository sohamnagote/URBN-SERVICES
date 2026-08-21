import { Request, Response, NextFunction } from 'express';
import { serviceabilityService } from '../services/serviceabilityService';

export class ServiceabilityController {
  public getAreas(req: Request, res: Response, next: NextFunction) {
    try {
      const data = serviceabilityService.getAllAreas();
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  public checkServiceability(req: Request, res: Response, next: NextFunction) {
    try {
      const { locality, pincode, categoryId } = req.body;
      const result = serviceabilityService.checkLocality(locality, pincode, categoryId);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const serviceabilityController = new ServiceabilityController();
