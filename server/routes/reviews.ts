import { Router } from 'express';
import { backendStore } from '../store';
import { Review } from '../../src/types';

const router = Router();

// GET /api/reviews - List verified customer reviews
router.get('/', (req, res) => {
  const { serviceTitle } = req.query;
  let list = Array.from(backendStore.reviews.values());

  if (serviceTitle) {
    list = list.filter((r) =>
      r.serviceTitle.toLowerCase().includes(String(serviceTitle).toLowerCase())
    );
  }

  res.json({ count: list.length, reviews: list });
});

// POST /api/reviews - Submit verified review for completed booking
router.post('/', (req, res) => {
  const {
    bookingId,
    rating,
    comment,
    authorName,
    locality,
    serviceTitle,
    userId,
  } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required.' });
  }

  // Check if booking exists
  if (bookingId) {
    const booking = backendStore.bookings.get(bookingId);
    if (booking) {
      booking.userRating = Number(rating);
      booking.userReview = String(comment);
      backendStore.bookings.set(bookingId, booking);
    }
  }

  const reviewId = `rev-${Date.now()}`;
  const newReview: Review = {
    id: reviewId,
    author: authorName || 'Nashik Resident',
    locality: locality || 'Nashik',
    rating: Number(rating),
    comment: String(comment),
    timeAgo: 'Just now',
    serviceTitle: serviceTitle || 'Household Service',
    verified: true,
    avatarInitials: (authorName || 'NR').substring(0, 2).toUpperCase(),
    avatarColor: 'bg-blue-600',
  };

  backendStore.reviews.set(reviewId, newReview);

  backendStore.recordAudit({
    actorId: userId || 'customer',
    actorRole: 'customer',
    action: 'REVIEW_SUBMITTED',
    resource: 'review',
    resourceId: reviewId,
    newState: { rating, serviceTitle },
    reason: `Review submitted for ${serviceTitle}`,
  });

  backendStore.trackAnalytics('review_submitted', {
    reviewId,
    rating,
    serviceTitle,
  }, userId);

  res.status(201).json({
    success: true,
    message: 'Thank you for your review! It has been published.',
    review: newReview,
  });
});

export default router;
