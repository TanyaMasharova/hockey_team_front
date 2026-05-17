'use client';
import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Alert, Grid } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { getUserById } from '@/shared/api/user';

interface PurchaseFormProps {
  initialData: {
    email: string;
  };
  onSubmit: (data: { email: string }) => void;
  onBack: () => void;
}

export default function PurchaseForm({ initialData, onSubmit, onBack }: PurchaseFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      const userId = localStorage.getItem('user');
      if (userId && !initialData.email) {
        setLoading(true);
        try {
          const user = await getUserById(userId);
          setFormData({
            email: user.email || '',
          });
        } catch (error) {
          console.error('Failed to load user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadUserData();
  }, [initialData.email]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

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
        Контактные данные
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Билет будет отправлен на указанный email
      </Typography>

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        error={!!errors.email}
        helperText={errors.email}
        required
        disabled={loading}
        sx={{ mb: 3 }}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        После оплаты билет будет доступен в личном кабинете и придёт на указанную почту
      </Alert>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Button variant="outlined" onClick={onBack} fullWidth disabled={loading}>
            Назад
          </Button>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
            {loading ? 'Загрузка...' : 'Продолжить'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
