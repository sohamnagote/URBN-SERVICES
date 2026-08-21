import { Booking } from '../types';
import { backendStore } from '../store/backendStore';

export class BookingRepository {
  public findAll(filters: { userId?: string; providerId?: string; status?: string; locality?: string; category?: string; search?: string } = {}): Booking[] {
    let list = Array.from(backendStore.bookings.values());

    if (filters.userId) {
      list = list.filter((b: any) => b.userId === filters.userId || (b.address && b.address.userId === filters.userId));
    }
    if (filters.providerId) {
      list = list.filter((b) => b.provider?.id === filters.providerId);
    }
    if (filters.status && filters.status !== 'all') {
      list = list.filter((b) => b.status === filters.status);
    }
    if (filters.locality && filters.locality !== 'all') {
      list = list.filter((b) => b.address?.locality?.toLowerCase().includes(filters.locality!.toLowerCase()));
    }
    if (filters.category && filters.category !== 'all') {
      list = list.filter((b) => b.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.primaryServiceTitle.toLowerCase().includes(q) ||
          b.address?.locality?.toLowerCase().includes(q) ||
          b.provider?.name?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  public findById(id: string): Booking | undefined {
    return backendStore.bookings.get(id);
  }

  public save(booking: Booking): Booking {
    backendStore.bookings.set(booking.id, booking);
    return booking;
  }

  public count(): number {
    return backendStore.bookings.size;
  }
}

export const bookingRepository = new BookingRepository();
