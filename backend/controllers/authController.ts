import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export class AuthController {
  public async handleGoogleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      const user = await authService.verifyGoogleToken(idToken);
      return res.json({
        success: true,
        message: 'Google identity securely verified.',
        user,
      });
    } catch (err: any) {
      next(err);
    }
  }
}

export const authController = new AuthController();
