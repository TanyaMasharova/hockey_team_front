'use client';
import { useState } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  CheckCircle,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { register } from '@/shared/api/user';
import styles from './register.module.css';

export const RegisterPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const cleaned = value.replace(/\D/g, '');

    // Если строка пустая, возвращаем пустую строку
    if (cleaned.length === 0) {
      return '';
    }

    // Если начинается не с 7 или 8, добавляем +7
    let number = cleaned;
    if (!number.startsWith('7') && !number.startsWith('8')) {
      number = '7' + number;
    }

    // Заменяем 8 на 7 в начале
    if (number.startsWith('8')) {
      number = '7' + number.slice(1);
    }

    // Ограничиваем длину 11 цифрами (7 + 10 цифр)
    number = number.slice(0, 11);

    // Форматируем
    let formatted = '+7';
    if (number.length > 1) {
      formatted += ' (' + number.slice(1, 4);
    }
    if (number.length >= 5) {
      formatted += ') ' + number.slice(4, 7);
    }
    if (number.length >= 8) {
      formatted += '-' + number.slice(7, 9);
    }
    if (number.length >= 10) {
      formatted += '-' + number.slice(9, 11);
    }

    return formatted;
  };

  // Обработчик изменения телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhoneNumber(rawValue);

    setFormData({
      ...formData,
      phone: formattedValue,
    });
    setError('');
  };

  // Функция для отправки на бэкенд (удаляет все нецифровые символы)
  const getPhoneForAPI = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    // Убеждаемся, что номер начинается с 7
    if (digits.startsWith('7') && digits.length === 11) {
      return digits;
    }
    return digits;
  };

  // Валидация телефона (проверяем цифры)
  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    // Должно быть 11 цифр и начинаться с 7
    return digits.length === 11 && digits.startsWith('7');
  };

  const handleChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });
      setError('');
    };

  const handleQuickFill = (testData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    setFormData({
      fullName: testData.fullName,
      email: testData.email,
      phone: testData.phone,
      password: testData.password,
      confirmPassword: testData.password,
    });
    setError('');
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!formData.fullName.trim()) {
        setError('Введите ФИО');
        return false;
      }
      if (formData.fullName.trim().length < 6) {
        setError('Введите полное ФИО (минимум 6 символов)');
        return false;
      }
      // Проверка, что в ФИО хотя бы два слова
      const nameParts = formData.fullName.trim().split(/\s+/);
      if (nameParts.length < 2) {
        setError('Введите фамилию и имя');
        return false;
      }
      return true;
    }

    if (activeStep === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) {
        setError('Введите email');
        return false;
      }
      if (!emailRegex.test(formData.email)) {
        setError('Введите корректный email');
        return false;
      }

      if (!formData.phone) {
        setError('Введите номер телефона');
        return false;
      }

      if (!validatePhone(formData.phone)) {
        setError('Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX');
        return false;
      }
      return true;
    }

    if (activeStep === 2) {
      if (!formData.password) {
        setError('Введите пароль');
        return false;
      }
      if (formData.password.length < 4) {
        setError('Пароль должен содержать минимум 4 символа');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await register({
        phone: getPhoneForAPI(formData.phone),
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName.trim(),
      });

      if (data.id) {
        setSuccess(true);
        router.push('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);

      if (err.response?.status === 409) {
        const errorMsg = err.response?.data?.error || '';
        if (errorMsg.includes('phone')) {
          setError('Этот номер телефона уже зарегистрирован');
        } else if (errorMsg.includes('email')) {
          setError('Этот email уже зарегистрирован');
        } else {
          setError('Пользователь с таким email или телефоном уже существует');
        }
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.error || 'Проверьте правильность введенных данных');
      } else if (err.message === 'Network Error') {
        setError('Ошибка сети. Проверьте подключение к серверу');
      } else {
        setError('Ошибка при регистрации. Попробуйте позже');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Личная информация', 'Контактные данные', 'Создание пароля'];

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <TextField
            fullWidth
            label="ФИО"
            value={formData.fullName}
            onChange={handleChange('fullName')}
            margin="normal"
            required
            placeholder="Иванов Иван Иванович"
            helperText="Введите фамилию, имя и отчество полностью"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
          />
        );
      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              margin="normal"
              required
              placeholder="example@mail.com"
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
              label="Номер телефона"
              value={formData.phone}
              onChange={handlePhoneChange}
              margin="normal"
              required
              placeholder="+7 (999) 123-45-67"
              helperText="Формат: +7 (XXX) XXX-XX-XX"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{
                maxLength: 18,
              }}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <TextField
              fullWidth
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              margin="normal"
              required
              helperText="Минимум 4 символа"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Подтверждение пароля"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              margin="normal"
              required
              error={
                formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
              }
              helperText={
                formData.confirmPassword !== '' && formData.password !== formData.confirmPassword
                  ? 'Пароли не совпадают'
                  : ''
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <Container maxWidth="sm">
          <Paper elevation={3} className={styles.paper}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Регистрация успешна!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Вы будете перенаправлены на страницу входа
              </Typography>
              <Button variant="contained" onClick={() => router.push('/login')}>
                Перейти ко входу
              </Button>
            </Box>
          </Paper>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Container maxWidth="sm">
        <Paper elevation={3} className={styles.paper}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Регистрация
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Ошибка */}
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
                Назад
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Далее
                </Button>
              )}
            </Box>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant="text" onClick={() => router.push('/login')}>
              Уже есть аккаунт? Войти
            </Button>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default RegisterPage;
