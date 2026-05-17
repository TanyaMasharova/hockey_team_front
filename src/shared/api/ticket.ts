// shared/api/ticket.ts
import { api } from '@/shared/config/axiosConfig';

export interface CreateTicketData {
  user_id: string;
  match_id: string;
  seat_id: string;
  final_price: number;
  // full_name: string;
  // phone: string;
  // email: string;
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

// Создание билета через axios
// shared/api/ticket.ts
export const createTicket = async (data: CreateTicketData): Promise<Ticket> => {
  try {
    const response = await api.post('/tickets', data);
    return response.data;
  } catch (error: any) {
    // Подробно логируем ошибку

    throw new Error(
      error.response?.data?.error || error.response?.data?.message || 'Failed to create ticket'
    );
  }
};

// Остальные функции...
export const getUserTickets = async (userId: string) => {
  try {
    const response = await api.get(`/tickets/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

export const cancelTicket = async (ticketId: string) => {
  try {
    const response = await api.patch(`/tickets/${ticketId}`, { status: 'cancelled' });
    return response.data;
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    throw error;
  }
};
