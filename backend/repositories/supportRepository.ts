import { SupportTicket } from '../types';
import { backendStore } from '../store/backendStore';

export class SupportRepository {
  public findAll(filters: { userId?: string; bookingId?: string } = {}): SupportTicket[] {
    let list = Array.from(backendStore.supportTickets.values());
    if (filters.userId) {
      list = list.filter((t: any) => t.userId === filters.userId);
    }
    if (filters.bookingId) {
      list = list.filter((t) => t.bookingId === filters.bookingId);
    }
    return list;
  }

  public findById(id: string): SupportTicket | undefined {
    return backendStore.supportTickets.get(id);
  }

  public save(ticket: SupportTicket): SupportTicket {
    backendStore.supportTickets.set(ticket.id, ticket);
    return ticket;
  }
}

export const supportRepository = new SupportRepository();
