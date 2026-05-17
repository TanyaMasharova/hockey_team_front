'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Event,
  ConfirmationNumber,
  Home,
  FlightTakeoff,
  TrendingUp,
  MonetizationOn,
  Timeline,
  CalendarToday,
  Star,
  DateRange,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';
import { getUserTickets } from '@/shared/api/ticket';
import { useError } from '@/shared/context/ErrorContext';
import styles from './FanStats.module.css';

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

interface TicketStats {
  total: number; // Уникальные матчи
  totalTickets?: number; // Всего билетов (опционально)
  home: number;
  away: number;
  active: number; // Активных билетов
  used: number;
  cancelled: number;
  totalSpent: number;
  averagePrice: number;
  upcomingMatches: number; // Уникальные предстоящие матчи
  lastMatchDate: string | null;
  firstMatchDate: string | null;
  favoriteOpponent: string;
  favoriteSector: string;
}
interface MonthlyData {
  monthKey: string;
  month: string;
  matches: number;
  tickets: number;
  spent: number;
}

// Приглушённые, элегантные цвета
const CHART_COLORS = {
  home: '#5B7C9E',
  away: '#8B7E9E',
  primary: '#6B8BA4',
  secondary: '#9B8EAE',
  accent: '#7C9C8E',
  success: '#6B9C7E',
  warning: '#C49E6E',
  error: '#C47E6E',
  bars: ['#6B8BA4', '#8B7E9E', '#7C9C8E', '#C49E6E', '#9B8E6E'],
  pie: ['#6B8BA4', '#8B7E9E', '#7C9C8E', '#C49E6E', '#9B8E6E', '#6E8B9E'],
};

export const FanStats = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [opponentData, setOpponentData] = useState<any[]>([]);
  const [weekdayData, setWeekdayData] = useState<any[]>([]);
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
      calculateCharts(ticketsList);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const normalizeHomeAway = (value: string): 'home' | 'away' => {
    const normalized = value.toLowerCase().trim();
    if (normalized === 'дома' || normalized === 'home' || normalized === 'домашний') {
      return 'home';
    }
    return 'away';
  };

  const calculateStats = (ticketsList: Ticket[]) => {
    if (!ticketsList.length) {
      setStats(null);
      return;
    }

    const activeTickets = ticketsList.filter(t => t.status === 'active');
    const usedTickets = ticketsList.filter(t => t.status === 'used');
    const cancelledTickets = ticketsList.filter(t => t.status === 'cancelled');

    // Уникальные матчи (по датам, исключая отменённые)
    const validTickets = ticketsList.filter(t => t.status !== 'cancelled');

    // Создаём Map для уникальных матчей с информацией о наличии активных билетов
    const uniqueMatchesMap = new Map<string, { ticket: Ticket; hasActive: boolean }>();

    validTickets.forEach(ticket => {
      const dateKey = new Date(ticket.match_date).toISOString().split('T')[0];
      const isActive = ticket.status === 'active';

      if (!uniqueMatchesMap.has(dateKey)) {
        uniqueMatchesMap.set(dateKey, {
          ticket: ticket,
          hasActive: isActive,
        });
      } else {
        // Если уже есть матч, обновляем hasActive (если хоть один билет активен)
        const existing = uniqueMatchesMap.get(dateKey)!;
        if (isActive) {
          existing.hasActive = true;
        }
      }
    });

    const uniqueMatches = Array.from(uniqueMatchesMap.values()).map(item => item.ticket);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Предстоящие матчи (уникальные, где есть хотя бы один активный билет И дата в будущем)
    const upcomingMatchesCount = Array.from(uniqueMatchesMap.values()).filter(item => {
      const matchDate = new Date(item.ticket.match_date);
      matchDate.setHours(0, 0, 0, 0);
      return matchDate >= now && item.hasActive;
    }).length;

    // Дома/выезд по уникальным матчам
    const homeMatches = uniqueMatches.filter(t => normalizeHomeAway(t.home_away) === 'home');
    const awayMatches = uniqueMatches.filter(t => normalizeHomeAway(t.home_away) === 'away');

    // Финансы по всем валидным билетам
    const totalSpent = validTickets.reduce((sum, t) => sum + (t.final_price || 0), 0);
    const averagePrice = validTickets.length > 0 ? totalSpent / validTickets.length : 0;

    // Даты уникальных матчей
    const matchDates = uniqueMatches
      .map(t => new Date(t.match_date))
      .sort((a, b) => a.getTime() - b.getTime());

    // Любимый соперник (по билетам)
    const opponentCount = new Map<string, number>();
    validTickets.forEach(t => {
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

    // Любимый сектор
    const sectorCount = new Map<string, number>();
    validTickets.forEach(t => {
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
      total: uniqueMatches.length,
      totalTickets: validTickets.length,
      home: homeMatches.length,
      away: awayMatches.length,
      active: activeTickets.length,
      used: usedTickets.length,
      cancelled: cancelledTickets.length,
      totalSpent,
      averagePrice,
      upcomingMatches: upcomingMatchesCount,
      lastMatchDate:
        matchDates.length > 0 ? matchDates[matchDates.length - 1]?.toISOString() : null,
      firstMatchDate: matchDates.length > 0 ? matchDates[0]?.toISOString() : null,
      favoriteOpponent: favoriteOpponent || '—',
      favoriteSector: favoriteSector || '—',
    });
  };

  const calculateCharts = (ticketsList: Ticket[]) => {
    if (!ticketsList.length) return;

    // 1. Динамика по месяцам
    const monthlyMap = new Map<string, MonthlyData>();
    const uniqueMatchesPerMonth = new Map<string, Set<string>>();

    ticketsList.forEach(ticket => {
      if (ticket.status === 'cancelled') return;

      const date = new Date(ticket.match_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const matchDateKey = date.toISOString().split('T')[0];

      if (!uniqueMatchesPerMonth.has(monthKey)) {
        uniqueMatchesPerMonth.set(monthKey, new Set());
      }
      uniqueMatchesPerMonth.get(monthKey)!.add(matchDateKey);
    });

    ticketsList.forEach(ticket => {
      if (ticket.status === 'cancelled') return;

      const date = new Date(ticket.match_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          monthKey,
          month: monthName,
          matches: uniqueMatchesPerMonth.get(monthKey)?.size || 0,
          tickets: 0,
          spent: 0,
        });
      }

      const stats = monthlyMap.get(monthKey)!;
      stats.tickets += 1;
      stats.spent += ticket.final_price;
    });

    const monthly = Array.from(monthlyMap.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-12);

    setMonthlyData(monthly);

    // 2. Распределение по секторам (топ-5)
    const sectorMap = new Map<string, number>();
    ticketsList.forEach(ticket => {
      const sector = ticket.sector_number;
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + 1);
    });

    const sectors = Array.from(sectorMap.entries())
      .map(([sector, count]) => ({ sector: `Сектор ${sector}`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setSectorData(sectors);

    // 3. Топ-5 соперников
    const opponentMap = new Map<string, number>();
    ticketsList.forEach(ticket => {
      const opponent = ticket.opponent_name;
      opponentMap.set(opponent, (opponentMap.get(opponent) || 0) + 1);
    });

    const opponents = Array.from(opponentMap.entries())
      .map(([name, count]) => ({
        name: name.length > 15 ? name.slice(0, 12) + '...' : name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setOpponentData(opponents);

    // 4. Распределение по дням недели
    const weekdayMap = new Map([
      [1, { name: 'Пн', count: 0 }],
      [2, { name: 'Вт', count: 0 }],
      [3, { name: 'Ср', count: 0 }],
      [4, { name: 'Чт', count: 0 }],
      [5, { name: 'Пт', count: 0 }],
      [6, { name: 'Сб', count: 0 }],
      [0, { name: 'Вс', count: 0 }],
    ]);

    ticketsList.forEach(ticket => {
      const date = new Date(ticket.match_date);
      const weekday = date.getDay();
      const existing = weekdayMap.get(weekday);
      if (existing) {
        existing.count += 1;
      }
    });

    const weekdays = Array.from(weekdayMap.values());
    const weekdayOrder = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekdays.sort((a, b) => weekdayOrder.indexOf(a.name) - weekdayOrder.indexOf(b.name));

    setWeekdayData(weekdays);
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
        <CircularProgress sx={{ color: '#6B8BA4' }} />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Загрузка статистики...
        </Typography>
      </Box>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Box className={styles.emptyContainer}>
        <ConfirmationNumber sx={{ fontSize: 64, color: '#B0BEC5', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Нет данных для статистики
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Купите билеты на матчи, чтобы увидеть вашу статистику
        </Typography>
      </Box>
    );
  }

  const percentages = getHomeAwayPercentage();
  const homeAwayData = [
    { name: 'Дома', value: stats.home, color: CHART_COLORS.home },
    { name: 'В гостях', value: stats.away, color: CHART_COLORS.away },
  ];

  const statusData = [
    { name: 'Активные', value: stats.active, color: CHART_COLORS.success },
    { name: 'Использованные', value: stats.used, color: CHART_COLORS.primary },
    ...(stats.cancelled > 0
      ? [{ name: 'Отменённые', value: stats.cancelled, color: CHART_COLORS.error }]
      : []),
  ].filter(item => item.value > 0);

  return (
    <Box className={styles.container}>
      <Typography variant="h5" className={styles.title}>
        Карта болельщика
      </Typography>

      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        {/* Основные показатели */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className={styles.statCard}>
            <CardContent>
              <Box className={styles.statIcon}>
                <Event sx={{ color: CHART_COLORS.primary }} />
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

        {/* Финансовая статистика */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className={styles.statCard}>
            <CardContent>
              <Box className={styles.statIcon}>
                <MonetizationOn sx={{ color: CHART_COLORS.warning }} />
              </Box>
              <Typography variant="h4" className={styles.statValue}>
                {formatPrice(stats.totalSpent)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                всего потрачено
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                <TrendingUp
                  fontSize="small"
                  sx={{ verticalAlign: 'middle', mr: 0.5, color: CHART_COLORS.primary }}
                />
                Средняя цена: {formatPrice(stats.averagePrice)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Статус билетов */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className={styles.statCard}>
            <CardContent>
              <Box className={styles.statIcon}>
                <ConfirmationNumber sx={{ color: CHART_COLORS.success }} />
              </Box>
              <Typography variant="h4" className={styles.statValue}>
                {stats.active}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                активных билетов
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box className={styles.statusStats}>
                <Chip label={`Использовано: ${stats.used}`} size="small" />
                {stats.cancelled > 0 && (
                  <Chip label={`Отменено: ${stats.cancelled}`} size="small" />
                )}
              </Box>
              {stats.upcomingMatches > 0 && (
                <Typography
                  variant="caption"
                  sx={{ mt: 1, display: 'block', color: CHART_COLORS.primary }}
                >
                  Предстоящих матчей: {stats.upcomingMatches}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Любимый сектор и соперник */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className={styles.statCard}>
            <CardContent>
              <Box className={styles.statIcon}>
                <Star sx={{ color: CHART_COLORS.warning }} />
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Любимый сектор
              </Typography>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: CHART_COLORS.primary }}>
                {stats.favoriteSector}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Любимый соперник
              </Typography>
              <Typography variant="h6" fontWeight={500} sx={{ color: CHART_COLORS.secondary }}>
                {stats.favoriteOpponent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Динамика посещений по месяцам */}
        {monthlyData.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h6" className={styles.chartTitle}>
              Динамика посещений
            </Typography>
            <Card className={styles.chartCard}>
              <CardContent>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Количество матчей и траты по месяцам
                </Typography>
                <ResponsiveContainer width="100%" height={320} minWidth={930}>
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis dataKey="month" tick={{ fill: '#5B6E7E', fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fill: '#5B6E7E', fontSize: 12 }} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#5B6E7E', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: any, name: string, props: any) => {
                        if (props && props.dataKey === 'spent') {
                          return [formatPrice(value), 'Траты'];
                        }
                        return [value, 'Матчей'];
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="matches"
                      fill={CHART_COLORS.primary}
                      name="Матчей"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="spent"
                      stroke={CHART_COLORS.warning}
                      name="Траты (₽)"
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.warning, strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Сектора */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" className={styles.chartTitle}>
            Любимые сектора
          </Typography>
          <Card className={styles.chartCard}>
            <CardContent>
              {sectorData.length > 0 ? (
                <ResponsiveContainer width="100%" height={380} minWidth={500}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ sector, percent }) =>
                        percent > 0.05 ? `${sector} (${(percent * 100).toFixed(0)}%)` : ''
                      }
                      outerRadius={100}
                      dataKey="count"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS.pie[index % CHART_COLORS.pie.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} раз`, 'Посещений']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="textSecondary" align="center" py={4}>
                  Нет данных о секторах
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Дома vs В гостях */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" className={styles.chartTitle}>
            Дома vs В гостях
          </Typography>
          <Card className={styles.chartCard}>
            <CardContent>
              <ResponsiveContainer width="100%" height={280} minWidth={400}>
                <PieChart>
                  <Pie
                    data={homeAwayData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    <Cell fill={CHART_COLORS.home} />
                    <Cell fill={CHART_COLORS.away} />
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} матчей`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <Box className={styles.progressStats}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Дома
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={percentages.home}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#E0E0E0' }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    В гостях
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={percentages.away}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#E0E0E0' }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Дни недели */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" className={styles.chartTitle}>
            Дни недели
          </Typography>
          <Card className={styles.chartCard}>
            <CardContent>
              <ResponsiveContainer width="100%" height={280} minWidth={400}>
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="name" tick={{ fill: '#5B6E7E', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#5B6E7E', fontSize: 12 }} />
                  <Tooltip formatter={(value: any) => [`${value} матчей`, 'Посещений']} />
                  <Bar dataKey="count" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Typography
                variant="caption"
                color="textSecondary"
                align="center"
                display="block"
                sx={{ mt: 1 }}
              >
                Самый популярный день для посещения матчей
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Статус билетов */}
        {statusData.length > 1 && (
          <Grid item xs={12}>
            <Typography variant="h6" className={styles.chartTitle}>
              Статус билетов
            </Typography>
            <Card className={styles.chartCard}>
              <CardContent>
                <ResponsiveContainer width="100%" height={280} minWidth={500}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis dataKey="name" tick={{ fill: '#5B6E7E', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#5B6E7E', fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => [`${value} билетов`, '']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Дополнительная информация */}
        <Grid item xs={12}>
          <Card className={styles.infoCard}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box className={styles.extraStat}>
                    <CalendarToday sx={{ mr: 1, color: CHART_COLORS.primary }} />
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
                    <Timeline sx={{ mr: 1, color: CHART_COLORS.primary }} />
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
                    <DateRange sx={{ mr: 1, color: CHART_COLORS.primary }} />
                    <Typography variant="body2" color="textSecondary">
                      Активность
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {stats.upcomingMatches > 0
                        ? `${stats.upcomingMatches} матч(а) впереди`
                        : 'Нет ближайших матчей'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
