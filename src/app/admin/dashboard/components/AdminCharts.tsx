'use client';
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
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
} from 'recharts';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { api } from '@/shared/config/axiosConfig';
import styles from '../page.module.css';

const COLORS = {
  primary: '#6B8BA4',
  success: '#6B9C7E',
  warning: '#C49E6E',
  danger: '#C47E6E',
  info: '#8B7E9E',
  pie: ['#6B8BA4', '#8B7E9E', '#7C9C8E', '#C49E6E', '#9B8E6E', '#6E8B9E'],
};

export const AdminCharts = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/admin/stats');
      console.log('Chart data response:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Typography textAlign="center" py={8} color="textSecondary">
        Нет данных для отображения
      </Typography>
    );
  }

  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Активен',
      used: 'Использован',
      cancelled: 'Матч отменён',
      refunded: 'Возвращён',
    };
    return statusMap[status] || status;
  };

  // Преобразуем данные для графиков (маппим заглавные поля в маленькие)
  const salesByMonth = (data.sales_by_month || []).map((item: any) => ({
    month: item.Month,
    tickets: item.Tickets,
    revenue: item.Revenue,
  }));

  const sectorPopularity = (data.sector_popularity || []).map((item: any) => ({
    sector: item.Sector,
    sold: item.Sold,
    capacity: item.Capacity,
    occupancy_percent: item.OccupancyPercent,
  }));

  const ticketStatus = (data.ticket_status || []).map((item: any) => ({
    status: item.Status,
    count: item.Count,
  }));

  const avgPriceBySector = (data.avg_price_by_sector || []).map((item: any) => ({
    sector: item.Sector,
    sector_type: item.SectorType,
    avg_price: item.AvgPrice,
    tickets_sold: item.TicketsSold,
  }));

  const topBuyers = (data.top_buyers || []).map((item: any) => ({
    full_name: item.FullName,
    email: item.Email,
    tickets_count: item.TicketsCount,
    total_spent: item.TotalSpent,
  }));

  return (
    <Box>
      {/* 1. Динамика продаж по месяцам */}
      <Paper className={styles.chartPaper}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Динамика продаж билетов по месяцам
        </Typography>
        {salesByMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: any, name?: string | number, props?: any) => {
                  // Проверяем по dataKey, который передаётся в props
                  if (props?.dataKey === 'revenue') {
                    return [`${formatNumber(value)} ₽`, 'Выручка'];
                  }
                  if (props?.dataKey === 'tickets') {
                    return [formatNumber(value), 'Количество билетов'];
                  }
                  return [formatNumber(value), String(name ?? '')];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="tickets"
                stroke={COLORS.primary}
                name="Количество билетов"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.success}
                name="Выручка (₽)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography textAlign="center" py={4} color="textSecondary">
            Нет данных
          </Typography>
        )}
      </Paper>

      {/* 2. Популярность секторов */}
      {/* 2. Популярность секторов */}
      <Paper className={styles.chartPaper}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Популярность секторов
        </Typography>
        {sectorPopularity.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sectorPopularity} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="sector" width={60} />
              <Tooltip
                formatter={(value: any, name?: string | number, props?: any) => {
                  if (props?.dataKey === 'sold') {
                    return [`${value} билетов`, 'Продано'];
                  }
                  if (props?.dataKey === 'occupancy_percent') {
                    // Считаем процент: (проданные места / вместимость 250) * 100
                    const occupancyValue = (value / 250) * 100;
                    return [`${occupancyValue.toFixed(1)}%`, 'Заполняемость'];
                  }
                  return [value, String(name ?? '')];
                }}
              />
              <Legend />
              <Bar dataKey="sold" fill={COLORS.primary} name="Продано билетов" />
              <Bar
                dataKey="occupancy_percent"
                fill={COLORS.warning}
                name="Заполняемость (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography textAlign="center" py={4} color="textSecondary">
            Нет данных
          </Typography>
        )}
      </Paper>

      {/* 3. Статус билетов */}
      {/* 3. Статус билетов */}
      <Paper className={styles.chartPaper}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Статус билетов
        </Typography>
        {ticketStatus.length > 0 ? (
          <Box display="flex" justifyContent="center">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={ticketStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(props: any) => {
                    const status = props?.status;
                    const percent = props?.percent ?? 0;
                    // Показываем все подписи, но для маленьких выносим снаружи
                    const percentage = (percent * 100).toFixed(0);
                    if (percent < 0.03) {
                      return ''; // совсем маленькие не показываем
                    }
                    return `${getStatusLabel(status)} (${percentage}%)`;
                  }}
                  outerRadius={120}
                  dataKey="count"
                  nameKey="status"
                >
                  {ticketStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.pie[index % COLORS.pie.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name?: string | number) => {
                    const statusName = getStatusLabel(String(name ?? ''));
                    return [
                      `${value} билетов (${((value / ticketStatus.reduce((sum: number, item: any) => sum + item.count, 0)) * 100).toFixed(1)}%)`,
                      statusName,
                    ];
                  }}
                />
                <Legend formatter={value => getStatusLabel(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography textAlign="center" py={4} color="textSecondary">
            Нет данных
          </Typography>
        )}
      </Paper>

      {/* 5. Средний чек по секторам */}
      <Paper className={styles.chartPaper}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Средний чек по секторам
        </Typography>
        {avgPriceBySector.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={avgPriceBySector}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sector" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                formatter={(value: any, name?: string | number) => {
                  if (name === 'avg_price') return [`${formatNumber(value)} ₽`, 'Средняя цена'];
                  return [formatNumber(value), String(name ?? '')];
                }}
              />
              <Legend />
              <Bar dataKey="avg_price" fill={COLORS.success} name="Средняя цена (₽)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography textAlign="center" py={4} color="textSecondary">
            Нет данных
          </Typography>
        )}
      </Paper>

      {/* 7. Топ покупателей */}
      <Paper className={styles.chartPaper}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Топ-10 самых активных болельщиков
        </Typography>
        {topBuyers.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Болельщик</TableCell>
                  <TableCell align="center">Куплено билетов</TableCell>
                  <TableCell align="right">Потрачено</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topBuyers.map((buyer: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: index < 3 ? COLORS.warning : '#F0F2F5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          color: index < 3 ? '#fff' : '#5B6E7E',
                        }}
                      >
                        {index + 1}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: COLORS.primary }}>
                          {buyer.full_name?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={500}>{buyer.full_name || '—'}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {buyer.email || '—'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>{formatNumber(buyer.tickets_count)}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        билетов
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="primary.main">
                        {formatNumber(buyer.total_spent)} ₽
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography textAlign="center" py={4} color="textSecondary">
            Нет данных
          </Typography>
        )}
      </Paper>
    </Box>
  );
};
