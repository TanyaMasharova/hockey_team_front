// src/shared/api/tickets.ts

export interface CreateTicketData {
  user_id: string;
  match_id: string;
  seat_id: string;
  final_price: number;
  full_name: string;
  phone: string;
  email: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  match_id: string;
  seat_id: string;
  final_price: number;
  purchase_date: string;
  qr_code_hash: string;
  status: 'active' | 'used' | 'refunded' | 'cancelled';
}

export const createTicket = async (data: CreateTicketData): Promise<Ticket> => {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create ticket');
  }

  return response.json();
};

export const getUserTickets = async (userId: string): Promise<{ tickets: Ticket[] }> => {
  const response = await fetch(`/api/tickets?userId=${userId}`);

  if (!response.ok) {
    throw new Error('Failed to load tickets');
  }

  return response.json();
};

export const cancelTicket = async (ticketId: string): Promise<void> => {
  const response = await fetch(`/api/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'cancelled' }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel ticket');
  }
};
