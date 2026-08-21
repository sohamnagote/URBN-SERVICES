import { Request } from 'express';

export function validateCreateNotificationJob(req: Request) {
  const errors: string[] = [];
  const { title, message, category, deliveryType, scheduledFor } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Notification Title is required.');
  } else if (title.trim().length < 3 || title.trim().length > 120) {
    errors.push('Title must be between 3 and 120 characters.');
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    errors.push('Notification Message body is required.');
  } else if (message.trim().length < 5 || message.trim().length > 500) {
    errors.push('Message must be between 5 and 500 characters.');
  }

  if (!category) {
    errors.push('Notification Category is required.');
  }

  if (deliveryType === 'scheduled') {
    if (!scheduledFor) {
      errors.push('Scheduled Date and Time are required for scheduled delivery.');
    } else {
      const scheduledTime = new Date(scheduledFor).getTime();
      if (isNaN(scheduledTime) || scheduledTime <= Date.now()) {
        errors.push('Scheduled time must be strictly in the future.');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRegisterDevice(req: Request) {
  const errors: string[] = [];
  const { userId, pushToken } = req.body;

  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    errors.push('userId is required.');
  }
  if (!pushToken || typeof pushToken !== 'string' || !pushToken.trim()) {
    errors.push('pushToken is required.');
  }

  return { valid: errors.length === 0, errors };
}
