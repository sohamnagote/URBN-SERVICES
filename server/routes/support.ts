import { Router } from 'express';
import { backendStore } from '../store';
import { SupportTicket } from '../../src/types';

const router = Router();

// GET /api/support/tickets - List support tickets
router.get('/tickets', (req, res) => {
  const { userId, bookingId } = req.query;
  let list = Array.from(backendStore.supportTickets.values());

  if (userId) {
    list = list.filter((t: any) => t.userId === userId);
  }
  if (bookingId) {
    list = list.filter((t) => t.bookingId === bookingId);
  }

  res.json({ count: list.length, tickets: list });
});

// POST /api/support/tickets - Create or update support ticket
router.post('/tickets', (req, res) => {
  const { bookingId, subject, category, messageText, userId, userName } = req.body;

  if (!subject || !category || !messageText) {
    return res.status(400).json({ error: 'Subject, category, and message text are required.' });
  }

  const ticketId = `ticket-${Date.now()}`;
  const newTicket: SupportTicket = {
    id: ticketId,
    bookingId,
    subject,
    category,
    status: 'Open',
    lastUpdated: 'Just now',
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: 'user',
        senderName: userName || 'Customer',
        text: messageText,
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

  backendStore.supportTickets.set(ticketId, newTicket);

  backendStore.recordAudit({
    actorId: userId || 'customer',
    actorRole: 'customer',
    action: 'SUPPORT_TICKET_CREATED',
    resource: 'support_ticket',
    resourceId: ticketId,
    newState: { bookingId, category, status: 'Open' },
    reason: `Support request for ${subject}`,
  });

  backendStore.trackAnalytics('support_ticket_created', {
    ticketId,
    bookingId,
    category,
  }, userId);

  res.status(201).json({
    success: true,
    message: 'Support ticket registered. Central coordinator assigned.',
    ticket: newTicket,
  });
});

// POST /api/support/tickets/:id/reply - Add message to ticket
router.post('/tickets/:id/reply', (req, res) => {
  const { id } = req.params;
  const { text, sender, senderName } = req.body;

  const ticket = backendStore.supportTickets.get(id);
  if (!ticket) {
    return res.status(404).json({ error: `Support ticket ${id} not found.` });
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    sender: sender || 'user',
    senderName: senderName || 'Customer',
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  ticket.messages.push(newMsg);
  ticket.lastUpdated = 'Just now';
  backendStore.supportTickets.set(id, ticket);

  res.json({
    success: true,
    ticket,
  });
});

export default router;
