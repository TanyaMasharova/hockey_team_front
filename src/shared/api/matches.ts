import { api } from '@/shared/config/axiosConfig';

export interface Match {
  id: string;
  opponent: string;
  logo_opponent: string;
  match_date: string;
  home_away: 'home' | 'away';
  our_score: number;
  opponent_score: number;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  is_derby: boolean;
  win_type?: 'regular' | 'overtime' | 'penalty';
}

export interface Sector {
  id: string;
  sector_number: string;
  capacity: number;
  sector_type: string;
  price_coefficient: number;
  color_code: string;
}

export interface Seat {
  ID: string; // с большой буквы
  SeatRow: string; // с большой буквы
  SeatNumber: string; // с большой буквы
  IsHandicapAccessible: boolean; // с большой буквы
  IsTaken: boolean; // с большой буквы
}

// Получение будущих матчей
export const getFutureMatches = async (limit?: number): Promise<Match[]> => {
  try {
    const response = await api.get('/matches', {
      params: { limit, futurePast: 'future' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching future matches', error);
    throw error;
  }
};

// Получение прошедших матчей
export const getLastMatches = async (limit?: number): Promise<Match[]> => {
  try {
    const response = await api.get('/matches', {
      params: { limit, futurePast: 'past' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching past matches', error);
    throw error;
  }
};

// Получение статистики матчей
export const getMatchesStats = async () => {
  try {
    const response = await api.get('/matchesStats');
    return response.data;
  } catch (error) {
    console.error('Error fetching matches stats', error);
    throw error;
  }
};

// Получение матча по ID (через axios)
export const getMatchById = async (id: string): Promise<Match> => {
  try {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching match by id:', error);
    throw error;
  }
};

// Получение всех секторов стадиона
export const getStadiumSectors = async (): Promise<Sector[]> => {
  try {
    const response = await api.get('/stadium/sectors');
    return response.data;
  } catch (error) {
    console.error('Error fetching stadium sectors:', error);
    throw error;
  }
};

// Получение мест по сектору
// shared/api/matches.ts
export const getSeatsBySector = async (sectorId: string, matchId: string): Promise<Seat[]> => {
  try {
    console.log('Calling API with:', { sectorId, matchId });
    const response = await api.get(`/stadium/sectors/${sectorId}/seats`, {
      params: { matchId },
    });
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching seats by sector:', error);
    throw error;
  }
};
