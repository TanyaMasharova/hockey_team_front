import styles from './TableMatches.module.css';
import { Match } from '@/entities/Match';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { format } from 'date-fns';

interface TableMatchesProps {
  matches: Match[];
  count?: number;
}

export const TableMatches = ({ matches, count }: TableMatchesProps) => {
  const handleClick = () => {
    console.log('Реализовать переход по ссылке на покупку билета');
  };
  return (
    <TableContainer component={Paper} className={styles.tableContainer}>
      <Table sx={{ minWidth: 650 }} aria-label="matches table">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Соперник</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Тип матча
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold' }} align="center">
              Билеты
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map(match => (
            <TableRow
              key={match.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              hover
            >
              {/* Дата */}
              <TableCell component="th" scope="row">
                <Typography variant="body2" fontWeight="medium">
                  {format(match.date, 'dd.MM.yyyy')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(match.date, 'EEEE', { locale: ruLocale })}
                </Typography>
              </TableCell>

              {/* Соперник (иконка + название) */}
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={match.opponentIconSrc}
                    alt={match.opponent}
                    sx={{ width: 32, height: 32 }}
                  >
                    {!match.opponentIconSrc && match.opponent[0]}
                  </Avatar>
                  <Typography variant="body2" fontWeight="medium">
                    {match.opponent}
                  </Typography>
                </Box>
              </TableCell>

              {/* Тип матча (цветной кружочек) */}
              <TableCell align="center">
                <Chip
                  size="small"
                  label={match.homeAway === 'home' ? 'Дома' : 'В гостях'}
                  sx={{
                    backgroundColor: match.homeAway === 'home' ? '#2196f3' : '#4caf50',
                    color: 'white',
                    fontWeight: 'medium',
                    '& .MuiChip-label': {
                      px: 1,
                    },
                  }}
                />
              </TableCell>

              {/* Иконка билетика */}
              <TableCell align="center">
                <IconButton
                  color="primary"
                  onClick={handleClick}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    },
                  }}
                >
                  <ConfirmationNumberIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ruLocale = {
  locale: 'ru',
  formatLong: {
    date: () => 'dd.MM.yyyy',
  },
} as any;
