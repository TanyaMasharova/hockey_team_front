import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

interface PurchaseFormProps {
  initialData: {
    full_name: string;
    phone: string;
    email: string;
  };
  onSubmit: (data: any) => void;
}

export default function PurchaseForm({ initialData, onSubmit }: PurchaseFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Загружаем данные пользователя если он авторизован
    const loadUserData = async () => {
      const userId = localStorage.getItem('user');
      if (userId) {
        try {
          const response = await fetch(`/api/users/${userId}`);
          const user = await response.json();
          setFormData({
            full_name: user.full_name || '',
            phone: user.phone || '',
            email: user.email || '',
          });
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      }
    };
    loadUserData();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Введите ФИО';
    } else if (formData.full_name.trim().length < 3) {
      newErrors.full_name = 'ФИО должно содержать минимум 3 символа';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите номер телефона';
    } else if (!/^(\+7|8)?\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите Email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный Email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Ваши данные
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Билет будет отправлен на указанный email
      </Typography>

      <TextField
        fullWidth
        label="ФИО"
        value={formData.full_name}
        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
        error={!!errors.full_name}
        helperText={errors.full_name}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Телефон"
        placeholder="+7 (999) 999-99-99"
        value={formData.phone}
        onChange={e => setFormData({ ...formData, phone: e.target.value })}
        error={!!errors.phone}
        helperText={errors.phone}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        error={!!errors.email}
        helperText={errors.email}
        required
        sx={{ mb: 3 }}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        После оплаты билет будет доступен в личном кабинете и придёт на указанную почту
      </Alert>

      <Button type="submit" variant="contained" fullWidth size="large">
        Продолжить
      </Button>
    </Box>
  );
}
