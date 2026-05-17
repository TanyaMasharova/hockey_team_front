import { api } from '@/shared/config/axiosConfig';

export interface TicketResponse {
  id: string;
  match_date: string;
  opponent_name: string;
  home_away: string;
  sector_number: string;
  seat_row: string;
  seat_number: string;
  purchase_date: string;
  final_price: number;
  status: string;
}

export interface UserTicketsResponse {
  user_id: string;
  tickets: TicketResponse[];
  total: number;
}

export const getUserTickets = async (userId: string): Promise<UserTicketsResponse> => {
  try {
    const response = await api.get(`/tickets/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

export const createTicket = async (data: any) => {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};
