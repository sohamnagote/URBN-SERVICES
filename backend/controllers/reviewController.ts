import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/reviewService';

export class ReviewController {
  public getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceTitle } = req.query;
      const reviews = reviewService.getAllReviews(serviceTitle as string);
      return res.json({ count: reviews.length, reviews });
    } catch (err) {
      next(err);
    }
  }

  public submit(req: Request, res: Response, next: NextFunction) {
    try {
      const review = reviewService.submitReview(req.body);
      return res.status(201).json({
        success: true,
        message: 'Thank you for your review! It has been published.',
        review,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const reviewController = new ReviewController();
