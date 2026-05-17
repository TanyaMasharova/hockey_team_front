'use client';
import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Speed, Person } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { login } from '@/shared/api/user';
import styles from './login.module.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleQuickLogin = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError(''); // Очищаем ошибку при выборе быстрого входа
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Введите email');
      return;
    }
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        localStorage.setItem('user', data.id);
        localStorage.setItem('user_id', data.id);
        router.push('/user');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      // Проверяем статус из ответа ошибки
      const status = err.response?.status;
      const errorMessage = err.response?.data?.error;

      if (status === 401) {
        setError('Неверный email или пароль');
      } else if (status === 404) {
        setError('Пользователь с таким email не найден');
      } else if (errorMessage) {
        setError(errorMessage);
      } else {
        setError('Ошибка при входе. Попробуйте позже');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <Container maxWidth="sm">
        <Paper elevation={3} className={styles.paper}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Вход
          </Typography>

          {/* Отображение ошибок */}
          {error && (
            <Alert
              severity="error"
              className={styles.alert}
              onClose={() => setError('')}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              margin="normal"
              required
              error={!!error && !email}
              helperText={!!error && !email ? 'Email обязателен' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              margin="normal"
              required
              error={!!error && !password}
              helperText={!!error && !password ? 'Пароль обязателен' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant="text" onClick={() => router.push('/register')}>
                Нет аккаунта? Зарегистрироваться
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </div>
  );
};
