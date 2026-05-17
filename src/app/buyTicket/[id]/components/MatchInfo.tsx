import { Card, CardContent, Typography, Box, Chip, Divider } from '@mui/material';
import { CalendarToday, LocationOn, SportsSoccer, Star } from '@mui/icons-material';

interface MatchInfoProps {
  match: {
    opponent: string;
    match_date: string;
    home_away: string;
    our_score: number;
    opponent_score: number;
    status: string;
    is_derby: boolean;
  };
}

export default function MatchInfo({ match }: MatchInfoProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card sx={{ borderRadius: 3, position: 'sticky', top: 20 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Информация о матче
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Соперник
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {/* {console.log(match.opponent)} */}
            {match.opponent}
          </Typography>
          {match.is_derby && (
            <Chip icon={<Star />} label="Дерби!" size="small" color="error" sx={{ mt: 1 }} />
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Дата и время
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <CalendarToday fontSize="small" color="action" />
            <Typography variant="body1">{formatDate(match.match_date)}</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Место проведения
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body1">
              {match.home_away === 'home' ? 'Стадион "Арена"' : 'Выездной матч'}
            </Typography>
          </Box>
        </Box>

        {match.status === 'finished' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Счёт
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <SportsSoccer fontSize="small" color="action" />
              <Typography variant="h4" fontWeight={600}>
                {match.our_score} : {match.opponent_score}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
