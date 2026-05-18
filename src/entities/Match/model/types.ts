export interface MatchFuture {
  id: string;
  opponent: string;
  logo_opponent: string;
  // opponentIconSrc: string;
  home_away: 'home' | 'away';
  match_date: string;
}

export interface MatchLast {
  id: string;
  opponent: string;
  logo_opponent: string;
  home_away: 'home' | 'away';
  match_date: string;
  our_score: number;
  opponent_score: number;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  win_type?: 'regular' | 'overtime' | 'penalty';
}

export interface WinLossDetails {
  regular: number; // основное время
  overtime: number; // овертайм
  penalty: number; // буллиты
}

// Структура для статистики матчей
export interface MatchStats {
  wins: WinLossDetails;
  losses: WinLossDetails;
  total: number;
}
