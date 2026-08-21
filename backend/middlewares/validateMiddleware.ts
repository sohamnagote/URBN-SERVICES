import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export type ValidatorFn = (req: Request) => { valid: boolean; errors?: string[] };

export function validate(validator: ValidatorFn) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validator(req);
    if (!result.valid) {
      const errMsg = result.errors?.[0] || 'Validation failed for request payload.';
      return res.status(400).json({
        success: false,
        error: errMsg,
        code: 'VALIDATION_ERROR',
        errors: result.errors,
      });
    }
    next();
  };
}
