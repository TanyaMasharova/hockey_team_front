import styles from './TableLastMatches.module.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { MatchLast } from '@/entities/Match';

interface TableMatchesProps {
  matches: MatchLast[];
  count?: number;
}

export const TableLastMatches = ({ matches, count }: TableMatchesProps) => {
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

  // Определяем победа или поражение
  const isWin = (ourScore: number, opponentScore: number) => {
    return ourScore > opponentScore;
  };

  // Форматируем счет с суффиксом
  const formatScore = (
    ourScore: number,
    opponentScore: number,
    winType: 'regular' | 'overtime' | 'penalty' = 'regular'
  ) => {
    let suffix = '';
    if (winType === 'overtime') {
      suffix = ' (ОТ)';
    } else if (winType === 'penalty') {
      suffix = ' (Б)';
    }
    return `${ourScore} : ${opponentScore}${suffix}`;
  };

  return (
    <TableContainer component={Paper} className={styles.tableContainer}>
      <Table aria-label="matches table">
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell>Дата</TableCell>
            <TableCell>Соперник</TableCell>
            <TableCell align="center">Счёт</TableCell>
            <TableCell align="center">Статус</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.slice(0, count).map(match => {
            const formattedDate = formatMatchDate(match.match_date);
            const win = isWin(match.our_score, match.opponent_score);
            const scoreText = formatScore(match.our_score, match.opponent_score, match.win_type);

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
                      alt={match.opponent}
                      className={styles.opponentAvatar}
                    >
                      {match.opponent}
                    </Avatar>
                    <Typography className={styles.opponentName}>{match.opponent}</Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Typography className={win ? styles.winScore : styles.lossScore}>
                    {scoreText}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Typography className={styles.opponentName}>
                    {match.status === 'finished'
                      ? 'Завершен'
                      : match.status === 'live'
                        ? 'В прямом эфире'
                        : 'Отменен'}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
