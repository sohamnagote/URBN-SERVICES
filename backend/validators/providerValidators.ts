import { Request } from 'express';

export function validateProviderApply(req: Request) {
  const errors: string[] = [];
  const { applicantName, phone, primaryCategory } = req.body;

  if (!applicantName || typeof applicantName !== 'string' || !applicantName.trim()) {
    errors.push('Applicant name is required.');
  }

  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    errors.push('Contact phone number is required.');
  }

  if (!primaryCategory || typeof primaryCategory !== 'string' || !primaryCategory.trim()) {
    errors.push('Primary trade category is required.');
  }

  return { valid: errors.length === 0, errors };
}
