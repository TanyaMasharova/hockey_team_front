import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Chair, Star, EmojiEvents } from '@mui/icons-material';

interface Sector {
  id: string;
  sector_number: string;
  capacity: number;
  sector_type: string;
  price_coefficient: number;
  color_code: string;
}

interface SectorSelectorProps {
  sectors: Sector[];
  selectedSector: Sector | null;
  onSelect: (sector: Sector) => void;
}

export default function SectorSelector({ sectors, selectedSector, onSelect }: SectorSelectorProps) {
  const getSectorIcon = (type: string) => {
    switch (type) {
      case 'vip':
        return <Star sx={{ color: '#FFD700' }} />;
      case 'away_fans':
        return <EmojiEvents sx={{ color: '#F44336' }} />;
      default:
        return <Chair />;
    }
  };

  const getSectorTypeText = (type: string) => {
    switch (type) {
      case 'vip':
        return 'VIP';
      case 'away_fans':
        return 'Гостевой';
      default:
        return 'Стандартный';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Выберите сектор
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Цена зависит от категории сектора
      </Typography>

      <Grid container spacing={2}>
        {sectors.map(sector => (
          <Grid item xs={6} sm={4} md={3} key={sector.id}>
            <Card
              className={`sector-card ${selectedSector?.id === sector.id ? 'selected' : ''}`}
              onClick={() => onSelect(sector)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                border:
                  selectedSector?.id === sector.id
                    ? `2px solid ${sector.color_code}`
                    : '1px solid #E8ECF0',
                backgroundColor:
                  selectedSector?.id === sector.id ? `${sector.color_code}10` : 'white',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  {getSectorIcon(sector.sector_type)}
                  <Chip
                    label={getSectorTypeText(sector.sector_type)}
                    size="small"
                    sx={{
                      backgroundColor: sector.sector_type === 'vip' ? '#FFD70020' : '#F0F2F5',
                      color: sector.sector_type === 'vip' ? '#B8860B' : '#5B6E7E',
                    }}
                  />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {sector.sector_number}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {sector.capacity} мест
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
                  от {Math.round(1000 * sector.price_coefficient)} ₽
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
