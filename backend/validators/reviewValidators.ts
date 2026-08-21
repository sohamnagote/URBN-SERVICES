import { Request } from 'express';

export function validateReviewSubmit(req: Request) {
  const errors: string[] = [];
  const { rating, comment } = req.body;

  if (rating === undefined || rating === null) {
    errors.push('Rating is required.');
  } else {
    const r = Number(rating);
    if (isNaN(r) || r < 1 || r > 5) {
      errors.push('Rating must be a numeric score between 1 and 5.');
    }
  }

  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    errors.push('Review comment is required.');
  }

  return { valid: errors.length === 0, errors };
}
