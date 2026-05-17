'use client';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  TableSortLabel,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  Event,
  LocationOn,
  ConfirmationNumber,
  DateRange,
  Home,
  FlightTakeoff,
  TrendingUp,
  MonetizationOn,
  Timeline,
  CalendarToday,
  Star,
} from '@mui/icons-material';
import { getUserTickets } from '@/shared/api/ticket';
import { useError } from '@/shared/context/ErrorContext';
import styles from './TableMyTickets.module.css';

interface Ticket {
  id: string;
  match_date: string;
  opponent_name: string;
  home_away: string;
  sector_number: string;
  seat_row: string;
  seat_number: string;
  purchase_date: string;
  final_price: number;
  status: string;
}

type Order = 'asc' | 'desc';

interface TicketStats {
  total: number;
  home: number;
  away: number;
  active: number;
  used: number;
  cancelled: number;
  totalSpent: number;
  averagePrice: number;
  upcomingMatches: number;
  lastMatchDate: string | null;
  firstMatchDate: string | null;
  favoriteOpponent: string;
  favoriteSector: string;
}

export const TableMyTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState<keyof Ticket>('match_date');
  const [order, setOrder] = useState<Order>('desc');
  const [stats, setStats] = useState<TicketStats | null>(null);
  const { setError } = useError();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const userId = localStorage.getItem('user');
      if (!userId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }
      const data = await getUserTickets(userId);
      const ticketsList = data.tickets || [];
      setTickets(ticketsList);
      calculateStats(ticketsList);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Функция для нормализации значения home_away
  const normalizeHomeAway = (value: string): 'home' | 'away' => {
    const normalized = value.toLowerCase().trim();
    // Домашние матчи: "дома", "home", "домашний"
    if (normalized === 'дома' || normalized === 'home' || normalized === 'домашний') {
      return 'home';
    }
    // Выездные: "выезд", "away", "гости", "выездной"
    return 'away';
  };

  const calculateStats = (ticketsList: Ticket[]) => {
    if (!ticketsList.length) {
      setStats(null);
      return;
    }

    // Фильтруем по статусам
    const activeTickets = ticketsList.filter(t => t.status === 'active');
    const usedTickets = ticketsList.filter(t => t.status === 'used');
    const cancelledTickets = ticketsList.filter(t => t.status === 'cancelled');

    // Домашние и выездные матчи (нормализуем значения)
    const homeMatches = ticketsList.filter(t => normalizeHomeAway(t.home_away) === 'home');
    const awayMatches = ticketsList.filter(t => normalizeHomeAway(t.home_away) === 'away');

    // Подсчет потраченной суммы (только активные и использованные)
    const validTickets = ticketsList.filter(t => t.status === 'active' || t.status === 'used');
    const totalSpent = validTickets.reduce((sum, t) => sum + (t.final_price || 0), 0);
    const averagePrice = validTickets.length > 0 ? totalSpent / validTickets.length : 0;

    // Даты матчей (только с валидными датами)
    const validMatchDates = ticketsList
      .filter(t => t.match_date && !isNaN(new Date(t.match_date).getTime()))
      .map(t => new Date(t.match_date))
      .sort((a, b) => a.getTime() - b.getTime());

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Обнуляем время для корректного сравнения

    // Предстоящие матчи (только активные и дата в будущем)
    const upcomingMatches = activeTickets.filter(t => {
      const matchDate = new Date(t.match_date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate >= now;
    }).length;

    // Самый частый соперник
    const opponentCount = new Map<string, number>();
    ticketsList.forEach(t => {
      const opponent = t.opponent_name?.trim() || 'Неизвестный соперник';
      opponentCount.set(opponent, (opponentCount.get(opponent) || 0) + 1);
    });

    let favoriteOpponent = '';
    let maxCount = 0;
    opponentCount.forEach((count, opponent) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteOpponent = opponent;
      }
    });

    // Самый частый сектор
    const sectorCount = new Map<string, number>();
    ticketsList.forEach(t => {
      const sector = t.sector_number?.trim() || 'Неизвестный';
      sectorCount.set(sector, (sectorCount.get(sector) || 0) + 1);
    });

    let favoriteSector = '';
    let maxSectorCount = 0;
    sectorCount.forEach((count, sector) => {
      if (count > maxSectorCount) {
        maxSectorCount = count;
        favoriteSector = sector;
      }
    });

    setStats({
      total: ticketsList.length,
      home: homeMatches.length,
      away: awayMatches.length,
      active: activeTickets.length,
      used: usedTickets.length,
      cancelled: cancelledTickets.length,
      totalSpent,
      averagePrice,
      upcomingMatches,
      lastMatchDate:
        validMatchDates.length > 0
          ? validMatchDates[validMatchDates.length - 1]?.toISOString()
          : null,
      firstMatchDate: validMatchDates.length > 0 ? validMatchDates[0]?.toISOString() : null,
      favoriteOpponent: favoriteOpponent || '—',
      favoriteSector: favoriteSector || '—',
    });
  };

  const handleSort = (property: keyof Ticket) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (orderBy === 'match_date' || orderBy === 'purchase_date') {
      const dateA = new Date(aValue as string);
      const dateB = new Date(bValue as string);
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
      return order === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }

    if (orderBy === 'final_price') {
      return order === 'asc'
        ? (a.final_price || 0) - (b.final_price || 0)
        : (b.final_price || 0) - (a.final_price || 0);
    }

    const aStr = String(aValue || '').toLowerCase();
    const bStr = String(bValue || '').toLowerCase();
    return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'used':
        return 'default';
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Активен';
      case 'used':
        return 'Использован';
      case 'cancelled':
        return 'Отменён';
      case 'refunded':
        return 'Возвращён';
      default:
        return status || 'Неизвестно';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Неверная дата';
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    if (!price && price !== 0) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getHomeAwayPercentage = () => {
    if (!stats || stats.total === 0) return { home: 0, away: 0 };
    return {
      home: (stats.home / stats.total) * 100,
      away: (stats.away / stats.total) * 100,
    };
  };

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Загрузка билетов...
        </Typography>
      </Box>
    );
  }

  const percentages = getHomeAwayPercentage();

  return (
    <Box className={styles.container}>
      {/* Статистика */}
      {/* {stats && stats.total > 0 && (
        <Box className={styles.statsContainer}>
          <Typography variant="h5" className={styles.statsTitle}>
            Ваша статистика посещений
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={styles.statCard}>
                <CardContent>
                  <Box className={styles.statIcon}>
                    <Event color="primary" />
                  </Box>
                  <Typography variant="h3" className={styles.statValue}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    всего матчей
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box className={styles.statDetails}>
                    <Chip
                      icon={<Home />}
                      label={`Дома: ${stats.home}`}
                      size="small"
                      className={styles.homeStatChip}
                    />
                    <Chip
                      icon={<FlightTakeoff />}
                      label={`В гостях: ${stats.away}`}
                      size="small"
                      className={styles.awayStatChip}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className={styles.statCard}>
                <CardContent>
                  <Box className={styles.statIcon}>
                    <LocationOn color="primary" />
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Домашние матчи
                  </Typography>
                  <Typography variant="h6">
                    {stats.home} из {stats.total}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={percentages.home}
                    sx={{ mt: 1, mb: 1, height: 8, borderRadius: 4 }}
                    color="primary"
                  />
                  <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mt: 2 }}>
                    Выездные матчи
                  </Typography>
                  <Typography variant="h6">
                    {stats.away} из {stats.total}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={percentages.away}
                    sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    color="secondary"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className={styles.statCard}>
                <CardContent>
                  <Box className={styles.statIcon}>
                    <MonetizationOn color="warning" />
                  </Box>
                  <Typography variant="h4" className={styles.statValue}>
                    {formatPrice(stats.totalSpent)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    всего потрачено
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <TrendingUp fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    Средняя цена билета: {formatPrice(stats.averagePrice)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card className={styles.statCard}>
                <CardContent>
                  <Box className={styles.statIcon}>
                    <ConfirmationNumber color="success" />
                  </Box>
                  <Typography variant="h4" className={styles.statValue}>
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    активных билетов
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box className={styles.statusStats}>
                    <Chip label={`Использовано: ${stats.used}`} size="small" color="default" />
                    {stats.cancelled > 0 && (
                      <Chip label={`Отменено: ${stats.cancelled}`} size="small" color="error" />
                    )}
                  </Box>
                  {stats.upcomingMatches > 0 && (
                    <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                      Предстоящих матчей: {stats.upcomingMatches}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card className={styles.statsCardWide}>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Box className={styles.extraStat}>
                        <CalendarToday color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          Первый матч
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatShortDate(stats.firstMatchDate)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box className={styles.extraStat}>
                        <Timeline color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          Последний матч
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatShortDate(stats.lastMatchDate)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box className={styles.extraStat}>
                        <Star color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          Любимый соперник
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {stats.favoriteOpponent}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box className={styles.extraStat}>
                        <LocationOn color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                          Любимый сектор
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          Сектор {stats.favoriteSector}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )} */}

      <Typography variant="h5" className={styles.title}>
        Мои билеты
        <Chip
          label={`${tickets.length} ${tickets.length === 1 ? 'билет' : tickets.length < 5 ? 'билета' : 'билетов'}`}
          size="small"
          className={styles.counter}
        />
      </Typography>

      {tickets.length === 0 ? (
        <Box className={styles.emptyContainer}>
          <ConfirmationNumber sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            У вас пока нет билетов
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Купите билеты на ближайшие матчи и они появятся здесь
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={() => (window.location.href = '/schedule')}
          >
            Посмотреть матчи
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '70px' }}>#</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'match_date'}
                    direction={orderBy === 'match_date' ? order : 'asc'}
                    onClick={() => handleSort('match_date')}
                  >
                    <Box className={styles.headerCell}>
                      <span>Дата матча</span>
                    </Box>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'opponent_name'}
                    direction={orderBy === 'opponent_name' ? order : 'asc'}
                    onClick={() => handleSort('opponent_name')}
                  >
                    Соперник
                  </TableSortLabel>
                </TableCell>
                <TableCell>Ваше место</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'final_price'}
                    direction={orderBy === 'final_price' ? order : 'asc'}
                    onClick={() => handleSort('final_price')}
                  >
                    Цена
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'purchase_date'}
                    direction={orderBy === 'purchase_date' ? order : 'asc'}
                    onClick={() => handleSort('purchase_date')}
                  >
                    Дата покупки
                  </TableSortLabel>
                </TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTickets.map((ticket, index) => (
                <TableRow key={ticket.id} className={styles.tableRow}>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {formatDate(ticket.match_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {ticket.opponent_name || 'Не указан'}
                      </Typography>
                      <Chip
                        label={ticket.home_away === 'Дома' ? 'Дома' : 'В гостях'}
                        size="small"
                        className={ticket.home_away === 'Дома' ? styles.homeChip : styles.awayChip}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className={styles.seatInfo}>
                      <LocationOn sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        Сектор {ticket.sector_number || '?'}, {ticket.seat_row || '?'} ряд, место{' '}
                        {ticket.seat_number || '?'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {formatPrice(ticket.final_price)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(ticket.purchase_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(ticket.status)}
                      color={getStatusColor(ticket.status) as any}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
