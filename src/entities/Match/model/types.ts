export interface Match {
  id: string;
  opponent: string;
  opponentIconSrc: string;
  homeAway: 'home' | 'away';
  date: Date;
}
