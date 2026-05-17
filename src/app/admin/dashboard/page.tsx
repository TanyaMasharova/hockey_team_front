// app/admin/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  People,
  ConfirmationNumber,
  TrendingUp,
  EventAvailable,
  EventBusy,
  ExitToApp,
  Refresh,
} from '@mui/icons-material';
import { api } from '@/shared/config/axiosConfig';
import { AdminCharts } from './components/AdminCharts';
import styles from './page.module.css';

interface Stats {
  TotalUsers: number;
  TotalTickets: number;
  TotalRevenue: number;
  ActiveTickets: number;
  UsedTickets: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem('user_role');
    if (userRole !== 'admin') {
      router.push('/profile');
      return;
    }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats-summary');
      console.log('Stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const formatNumber = (value: number | undefined): string => {
    if (!value && value !== 0) return '0';
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    { title: 'Пользователей', value: stats?.TotalUsers || 0, icon: <People />, color: '#2196F3' },
    {
      title: 'Всего билетов',
      value: stats?.TotalTickets || 0,
      icon: <ConfirmationNumber />,
      color: '#4CAF50',
    },
    {
      title: 'Выручка',
      value: `${formatNumber(stats?.TotalRevenue)} ₽`,
      icon: <TrendingUp />,
      color: '#FF9800',
    },
    {
      title: 'Активных билетов',
      value: stats?.ActiveTickets || 0,
      icon: <EventAvailable />,
      color: '#9C27B0',
    },
    {
      title: 'Использовано',
      value: stats?.UsedTickets || 0,
      icon: <EventBusy />,
      color: '#F44336',
    },
  ];

  return (
    <Container maxWidth="xl" className={styles.container}>
      {/* Header */}
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Админ панель
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Управление билетной системой
          </Typography>
        </Box>
        <Box className={styles.buttonGroup}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              fetchStats();
              window.location.reload();
            }}
          >
            Обновить
          </Button>
          <Button variant="outlined" color="error" startIcon={<ExitToApp />} onClick={handleLogout}>
            Выйти
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card className={styles.statCard}>
              <CardContent>
                <Box className={styles.statCardIcon}>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                  <Typography variant="body2" color="textSecondary">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} className={styles.statValue}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <AdminCharts />
    </Container>
  );
}
