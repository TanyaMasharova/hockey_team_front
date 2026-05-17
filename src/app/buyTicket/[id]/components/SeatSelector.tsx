import { Box, Typography, Chip, Button, Paper } from '@mui/material';
import { Accessibility, ArrowBack } from '@mui/icons-material';

export interface Seat {
  ID: string; // с большой буквы
  SeatRow: string; // с большой буквы
  SeatNumber: string; // с большой буквы
  IsHandicapAccessible: boolean; // с большой буквы
  IsTaken: boolean; // с большой буквы
}

interface SeatSelectorProps {
  seats: Seat[];
  selectedSeat: Seat | null;
  onSelect: (seat: Seat) => void;
  onBack: () => void;
  sector: { sector_number: string };
}

export default function SeatSelector({
  seats,
  selectedSeat,
  onSelect,
  onBack,
  sector,
}: SeatSelectorProps) {
  if (!seats || seats.length === 0) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Сектор {sector.sector_number}
          </Typography>
          <Button startIcon={<ArrowBack />} onClick={onBack}>
            Назад к секторам
          </Button>
        </Box>
        <Typography textAlign="center" color="textSecondary" py={4}>
          Нет доступных мест в этом секторе
        </Typography>
      </Box>
    );
  }

  // Группируем места по рядам
  const seatsByRow: Record<string, Seat[]> = {};
  seats.forEach(seat => {
    const rowKey = String(seat.SeatRow || '0');
    if (!seatsByRow[rowKey]) {
      seatsByRow[rowKey] = [];
    }
    seatsByRow[rowKey].push(seat);
  });

  // Сортируем ряды
  const sortedRows = Object.keys(seatsByRow).sort((a, b) => {
    // Пробуем сортировать как числа
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    // Если не числа, сортируем как строки
    return a.localeCompare(b);
  });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          Сектор {sector.sector_number}
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={onBack}>
          Назад к секторам
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Chip label="Свободно" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }} />
        <Chip label="Выбрано" size="small" sx={{ bgcolor: '#4CAF50', color: 'white' }} />
        <Chip label="Занято" size="small" sx={{ bgcolor: '#F5F5F5', color: '#9E9E9E' }} />
        <Chip icon={<Accessibility />} label="Для инвалидов" size="small" />
      </Box>

      <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
        {sortedRows.map(row => {
          const rowSeats = seatsByRow[row];
          // Сортируем места в ряду по номеру
          const sortedSeats = [...rowSeats].sort((a, b) => {
            const numA = parseInt(a.SeatNumber, 10);
            const numB = parseInt(b.SeatNumber, 10);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return a.SeatNumber.localeCompare(b.SeatNumber);
          });

          return (
            <Paper key={row} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Ряд {row}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {sortedSeats.map(seat => {
                  const isSelected = selectedSeat?.ID === seat.ID;
                  // Проверяем, занято ли место (поддерживаем оба варианта написания)
                  const isTaken = seat.IsTaken === true || seat.IsTaken === true;

                  return (
                    <Button
                      key={seat.ID}
                      disabled={isTaken}
                      onClick={() => !isTaken && onSelect(seat)}
                      variant={isSelected ? 'contained' : 'outlined'}
                      size="small"
                      sx={{
                        minWidth: '48px',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: 500,
                        borderRadius: 2,
                        bgcolor: isSelected ? '#4CAF50' : isTaken ? '#F5F5F5' : 'white',
                        color: isSelected ? 'white' : isTaken ? '#BDBDBD' : '#2C3E4E',
                        borderColor: isSelected ? '#4CAF50' : '#E0E0E0',
                        borderWidth: isSelected ? 2 : 1,
                        '&:hover': isTaken
                          ? {}
                          : {
                              bgcolor: '#E8F5E9',
                              borderColor: '#4CAF50',
                              transform: 'scale(1.05)',
                            },
                        transition: 'all 0.2s ease',
                        position: 'relative',
                      }}
                    >
                      {seat.SeatNumber}
                      {seat.IsHandicapAccessible && !isTaken && (
                        <Accessibility
                          sx={{
                            fontSize: 12,
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            color: '#1976D2',
                          }}
                        />
                      )}
                    </Button>
                  );
                })}
              </Box>
            </Paper>
          );
        })}
      </Box>

      {selectedSeat && (
        <Box mt={3} p={2} bgcolor="#E8F5E9" borderRadius={2}>
          <Typography variant="body2" color="textSecondary">
            Выбрано место
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            Ряд {selectedSeat.SeatRow}, место {selectedSeat.SeatNumber}
          </Typography>
          {selectedSeat.IsHandicapAccessible && (
            <Box display="flex" alignItems="center" gap={0.5} mt={1}>
              <Accessibility sx={{ fontSize: 14, color: '#1976D2' }} />
              <Typography variant="caption" color="#1976D2">
                Место для инвалидов
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
