import { Review } from '../types';
import { reviewRepository } from '../repositories/reviewRepository';
import { bookingRepository } from '../repositories/bookingRepository';
import { auditRepository } from '../repositories/auditRepository';

export interface SubmitReviewInput {
  bookingId?: string;
  rating: number;
  comment: string;
  authorName?: string;
  locality?: string;
  serviceTitle?: string;
  userId?: string;
}

export class ReviewService {
  public getAllReviews(serviceTitle?: string): Review[] {
    return reviewRepository.findAll(serviceTitle);
  }

  public submitReview(input: SubmitReviewInput): Review {
    if (input.bookingId) {
      const booking = bookingRepository.findById(input.bookingId);
      if (booking) {
        booking.userRating = Number(input.rating);
        booking.userReview = String(input.comment);
        bookingRepository.save(booking);
      }
    }

    const reviewId = `rev-${Date.now()}`;
    const newReview: Review = {
      id: reviewId,
      author: input.authorName || 'Nashik Resident',
      locality: input.locality || 'Nashik',
      rating: Number(input.rating),
      comment: String(input.comment),
      timeAgo: 'Just now',
      serviceTitle: input.serviceTitle || 'Household Service',
      verified: true,
      avatarInitials: (input.authorName || 'NR').substring(0, 2).toUpperCase(),
      avatarColor: 'bg-blue-600',
    };

    reviewRepository.save(newReview);

    auditRepository.record({
      actorId: input.userId || 'customer',
      actorRole: 'customer',
      action: 'REVIEW_SUBMITTED',
      resource: 'review',
      resourceId: reviewId,
      newState: { rating: input.rating, serviceTitle: input.serviceTitle },
      reason: `Review submitted for ${input.serviceTitle || 'Service'}`,
    });

    auditRepository.trackAnalytics('review_submitted', {
      reviewId,
      rating: input.rating,
      serviceTitle: input.serviceTitle,
    }, input.userId);

    return newReview;
  }
}

export const reviewService = new ReviewService();
