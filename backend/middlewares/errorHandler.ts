import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public errors?: any[];

  constructor(message: string, statusCode: number = 400, code: string = 'ERROR', errors?: any[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const code = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred on the server.';

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}: ${message}`, {
    stack: err.stack,
    body: req.body,
    query: req.query,
  });

  return res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(err.errors ? { errors: err.errors } : {}),
  });
}
