'use client';
import styles from './FormUser.module.css';
import { Button } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { EditableField, EditableDateField, AvatarEdit } from '@/features/user/edit-profile';
import { Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { getUserById } from '@/shared/api/user';
import { useError } from '@/shared/context/ErrorContext';
import { UserData } from '@/entities/User';
import { useRouter } from 'next/navigation';
import { updateUserField } from '@/shared/api/user';

export const FormUser = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setError } = useError();
  const hasFetched = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('user');
        if (!userId) {
          setError('User ID not found');
          setLoading(false);
          return;
        }

        const data = await getUserById(userId);
        console.log('Received user data:', data);

        setUserData({
          avatar: data.avatar || 'https://i.pravatar.cc/300',
          full_name: data.full_name,
          phone: data.phone,
          email: data.email,
          birth_date: data.birth_date || null,
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setError]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  const handleFieldSave = (field: keyof UserData) => async (value: string) => {
    try {
      const saveValue = field === 'birth_date' && value === '' ? null : value;
      console.log(`Saving ${field}:`, saveValue);

      const userId = localStorage.getItem('user');
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Используем API функцию
      await updateUserField(userId, field, saveValue || '');

      // Обновляем локальное состояние
      setUserData(prev =>
        prev
          ? {
              ...prev,
              [field]: saveValue,
            }
          : null
      );

      console.log(`${field} updated successfully`);
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      throw error;
    }
  };

  const handleAvatarChange = async (newAvatarUrl: string) => {
    try {
      console.log('Saving avatar:', newAvatarUrl);
      // TODO: API вызов для сохранения аватара
      // await updateUserAvatar({ avatar: newAvatarUrl });

      setUserData(prev =>
        prev
          ? {
              ...prev,
              avatar: newAvatarUrl,
            }
          : null
      );
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Ошибка загрузки данных</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        {/* Аватар - на всю ширину */}
        <div className={styles.avatarContainer}>
          {/* <AvatarEdit
          avatarUrl={userData.avatar || 'https://i.pravatar.cc/300'}
          onAvatarChange={handleAvatarChange}
        /> */}
        </div>

        <EditableField
          label="ФИО"
          value={userData.full_name}
          onSave={handleFieldSave('full_name')}
        />
        <EditableField
          label="Телефон"
          value={userData.phone}
          onSave={handleFieldSave('phone')}
          type="tel"
          mask="+7 (999) 999-99-99"
        />
        <EditableField
          label="Email"
          value={userData.email}
          onSave={handleFieldSave('email')}
          type="email"
        />
        <EditableDateField
          label="Дата рождения"
          value={userData.birth_date || ''}
          onSave={handleFieldSave('birth_date')}
        />

        {/* Кнопка выхода - скромная и в правом нижнем углу */}
        <div className={styles.logoutButtonWrapper}>
          <Button
            variant="text"
            color="inherit"
            startIcon={<Logout />}
            onClick={handleLogout}
            size="small"
            className={styles.logoutButton}
            sx={{
              fontSize: '0.75rem',
              opacity: 0.5,
              '&:hover': {
                opacity: 0.8,
                backgroundColor: 'transparent',
              },
            }}
          >
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
};
