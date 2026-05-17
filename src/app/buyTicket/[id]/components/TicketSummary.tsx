import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { ConfirmationNumber, Email, LocationOn, CalendarToday } from '@mui/icons-material';

interface TicketSummaryProps {
  match: any;
  sector: any;
  seat: any;
  price: number;
  userData: { email: string };
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function TicketSummary({
  match,
  sector,
  seat,
  price,
  userData,
  onConfirm,
  onBack,
  loading,
}: TicketSummaryProps) {
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
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Подтверждение заказа
      </Typography>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Информация о билете
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <ConfirmationNumber color="primary" />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Матч
              </Typography>
              <Typography fontWeight={500}>{match.opponent_name}</Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <CalendarToday color="action" />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Дата и время
              </Typography>
              <Typography fontWeight={500}>{formatDate(match.match_date)}</Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <LocationOn color="action" />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Место
              </Typography>
              <Typography fontWeight={500}>
                Сектор {sector.sector_number}, ряд {seat.seat_row}, место {seat.seat_number}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Куда отправить билет
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box display="flex" alignItems="center" gap={2}>
            <Email color="action" />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Email
              </Typography>
              <Typography fontWeight={500}>{userData.email}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3, bgcolor: '#F8FAFC' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Итого к оплате</Typography>
            <Typography variant="h4" color="primary" fontWeight={700}>
              {price} ₽
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box display="flex" gap={2}>
        <Button variant="outlined" onClick={onBack} disabled={loading}>
          Назад
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading} fullWidth size="large">
          {loading ? <CircularProgress size={24} /> : 'Оплатить'}
        </Button>
      </Box>
    </Box>
  );
}
