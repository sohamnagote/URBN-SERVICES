import { SupportTicket } from '../types';
import { supportRepository } from '../repositories/supportRepository';
import { auditRepository } from '../repositories/auditRepository';

export class SupportService {
  public getTickets(filters: { userId?: string; bookingId?: string } = {}): SupportTicket[] {
    return supportRepository.findAll(filters);
  }

  public createTicket(payload: {
    bookingId?: string;
    subject: string;
    category: string;
    messageText: string;
    userId?: string;
    userName?: string;
  }): SupportTicket {
    const ticketId = `ticket-${Date.now()}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      bookingId: payload.bookingId,
      subject: payload.subject,
      category: payload.category,
      status: 'Open',
      lastUpdated: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          senderName: payload.userName || 'Customer',
          text: payload.messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          senderName: 'URBN Central Desk (Nashik)',
          text: 'Namaste! We have received your query. An on-duty coordinator has been assigned to assist you with the 1-Day Promise resolution.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    supportRepository.save(newTicket);

    auditRepository.record({
      actorId: payload.userId || 'customer',
      actorRole: 'customer',
      action: 'SUPPORT_TICKET_CREATED',
      resource: 'support_ticket',
      resourceId: ticketId,
      newState: { bookingId: payload.bookingId, category: payload.category, status: 'Open' },
      reason: `Support request for ${payload.subject}`,
    });

    auditRepository.trackAnalytics('support_ticket_created', {
      ticketId,
      bookingId: payload.bookingId,
      category: payload.category,
    }, payload.userId);

    return newTicket;
  }

  public replyTicket(id: string, text: string, sender: 'user' | 'agent' | 'bot' = 'user', senderName: string = 'Customer'): SupportTicket {
    const ticket = supportRepository.findById(id);
    if (!ticket) {
      throw new Error(`Support ticket ${id} not found.`);
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    ticket.messages.push(newMsg);
    ticket.lastUpdated = 'Just now';
    supportRepository.save(ticket);

    return ticket;
  }
}

export const supportService = new SupportService();
