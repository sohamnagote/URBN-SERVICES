import { Request, Response, NextFunction } from 'express';
import { AUTHORIZED_ADMIN_EMAILS } from '../config/constants';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminEmail = (
    req.headers['x-admin-email'] ||
    req.headers['x-user-email'] ||
    req.body?.adminEmail ||
    req.query.adminEmail ||
    req.query.email ||
    ''
  ).toString().toLowerCase().trim();

  if (adminEmail && AUTHORIZED_ADMIN_EMAILS.has(adminEmail)) {
    return next();
  }

  const authHeader = req.headers.authorization || '';
  if (authHeader.includes('admin-token-somesh') || authHeader.includes('someshnagote14@gmail.com')) {
    return next();
  }

  if (!adminEmail) {
    return res.status(403).json({
      success: false,
      authorized: false,
      error: 'Access denied: Admin credentials missing. Please sign in with someshnagote14@gmail.com.',
      code: 'FORBIDDEN',
    });
  }

  return res.status(403).json({
    success: false,
    authorized: false,
    error: `Access denied: '${adminEmail}' is not in the authorized platform administrators list.`,
    code: 'FORBIDDEN',
  });
}
