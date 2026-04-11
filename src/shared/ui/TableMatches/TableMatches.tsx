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
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

interface TableMatchesProps {
  matches: Match[];
  count?: number;
}

export const TableMatches = ({ matches, count }: TableMatchesProps) => {
  const handleClick = () => {
    console.log('Реализовать переход по ссылке на покупку билета');
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const weekday = date.toLocaleDateString('ru-RU', {
      weekday: 'long',
    });

    return { day, weekday };
  };

  return (
    <TableContainer component={Paper} className={styles.tableContainer}>
      <Table aria-label="matches table">
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell>Дата</TableCell>
            <TableCell>Соперник</TableCell>
            <TableCell align="center">Билеты</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.slice(0, count).map(match => {
            const formattedDate = formatMatchDate(match.match_date);
            return (
              <TableRow key={match.id} hover>
                <TableCell align="center">
                  <span
                    className={match.home_away === 'home' ? styles.homeCircle : styles.awayCircle}
                    title={match.home_away === 'home' ? 'Дома' : 'В гостях'}
                  />
                </TableCell>

                <TableCell component="th" scope="row">
                  <div className={styles.dateWrapper}>
                    <span className={styles.dateDay}>{formattedDate.day}</span>
                    <span className={styles.dateWeekday}>{formattedDate.weekday}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <Box className={styles.opponentBox}>
                    <Avatar
                      src={`/icons${match.logo_opponent}`}
                      // src={match.logo_opponent}
                      alt={match.opponent}
                      className={styles.opponentAvatar}
                    >
                      {match.opponent}
                    </Avatar>
                    <Typography className={styles.opponentName}>{match.opponent}</Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <IconButton onClick={handleClick} className={styles.ticketButton}>
                    <ConfirmationNumberIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
