import { Review } from '../types';
import { backendStore } from '../store/backendStore';

export class ReviewRepository {
  public findAll(serviceTitle?: string): Review[] {
    let list = Array.from(backendStore.reviews.values());
    if (serviceTitle) {
      list = list.filter((r) =>
        r.serviceTitle.toLowerCase().includes(serviceTitle.toLowerCase())
      );
    }
    return list;
  }

  public save(review: Review): Review {
    backendStore.reviews.set(review.id, review);
    return review;
  }
}

export const reviewRepository = new ReviewRepository();
