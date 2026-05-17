import { Box, Typography, Grid, Chip, Button } from '@mui/material';
import { CheckCircle, Accessibility, ArrowBack } from '@mui/icons-material';

interface Seat {
  id: string;
  seat_row: string;
  seat_number: string;
  is_handicap_accessible: boolean;
  is_taken: boolean;
}

interface SeatSelectorProps {
  seats: Seat[];
  selectedSeat: Seat | null;
  onSelect: (seat: Seat) => void;
  sector: { sector_number: string };
}

export default function SeatSelector({ seats, selectedSeat, onSelect, sector }: SeatSelectorProps) {
  const rows = [...new Set(seats.map(s => s.seat_row))].sort();

  const getSeatStatus = (seat: Seat) => {
    if (seat.is_taken) return 'taken';
    if (selectedSeat?.id === seat.id) return 'selected';
    return 'available';
  };

  const getSeatStyles = (status: string) => {
    switch (status) {
      case 'taken':
        return {
          bgcolor: '#F5F5F5',
          borderColor: '#E0E0E0',
          color: '#BDBDBD',
          cursor: 'not-allowed',
          opacity: 0.5,
        };
      case 'selected':
        return {
          bgcolor: '#4CAF50',
          borderColor: '#4CAF50',
          color: 'white',
          cursor: 'pointer',
        };
      default:
        return {
          bgcolor: 'white',
          borderColor: '#BDBDBD',
          color: '#2C3E4E',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: '#E8F5E9',
            borderColor: '#4CAF50',
            transform: 'scale(1.05)',
          },
        };
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          Сектор {sector.sector_number}
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => window.history.back()}>
          Назад к секторам
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3}>
        <Chip icon={<CheckCircle />} label="Свободно" size="small" sx={{ bgcolor: '#E8F5E9' }} />
        <Chip
          icon={<CheckCircle />}
          label="Выбрано"
          size="small"
          sx={{ bgcolor: '#4CAF50', color: 'white' }}
        />
        <Chip label="Занято" size="small" sx={{ bgcolor: '#F5F5F5' }} />
        <Chip icon={<Accessibility />} label="Для инвалидов" size="small" />
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        {rows.map(row => (
          <Box key={row} mb={2}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
              Ряд {row}
            </Typography>
            <Grid container spacing={1}>
              {seats
                .filter(seat => seat.seat_row === row)
                .sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number))
                .map(seat => {
                  const status = getSeatStatus(seat);
                  const styles = getSeatStyles(status);

                  return (
                    <Grid item key={seat.id}>
                      <Box
                        onClick={() => !seat.is_taken && onSelect(seat)}
                        sx={{
                          width: 48,
                          height: 48,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 2,
                          border: '2px solid',
                          transition: 'all 0.2s',
                          position: 'relative',
                          ...styles,
                        }}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {seat.seat_number}
                        </Typography>
                        {seat.is_handicap_accessible && !seat.is_taken && (
                          <Accessibility
                            sx={{ fontSize: 14, position: 'absolute', bottom: 2, right: 2 }}
                          />
                        )}
                      </Box>
                    </Grid>
                  );
                })}
            </Grid>
          </Box>
        ))}
      </Box>

      {selectedSeat && (
        <Box mt={3} p={2} bgcolor="#E8F5E9" borderRadius={2}>
          <Typography variant="body2" color="textSecondary">
            Выбрано место
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            Ряд {selectedSeat.seat_row}, место {selectedSeat.seat_number}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
