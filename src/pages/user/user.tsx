'use client';
import { Header } from '@/widgets/Header';
import {
  EditableField,
  EditableDateField,
  AvatarEdit,
  useEditProfile,
} from '@/features/user/edit-profile';
import styles from './user.module.css';
import { useState, useEffect } from 'react';
import { getUserById } from '@/shared/api/user';
import { useError } from '@/shared/context/ErrorContext';
import { UserData } from '@/entities/User';

// TODO: заменить на реальные данные из БД
const mockUserData = {
  avatar: 'https://i.pravatar.cc/300',
  lastName: 'Иванов',
  firstName: 'Иван',
  patronymic: 'Иванович',
  phone: '+7 (999) 123-45-67',
  email: 'ivan@example.com',
  birthDate: '1990-01-15',
};

export const UserPage = () => {
  const [userDataServer, setUserDataServer] = useState<UserData>();
  const { errors, setError, clearError } = useError();

  useEffect(() => {
    const fetchUseData = async () => {
      try {
        const data = await getUserById(localStorage['user']);
        setUserDataServer(data);
      } catch (error) {
        setError('Failed to load matches stats');
      }
    };
    fetchUseData();
  }, []);

  const { userData, handleFieldSave, handleAvatarChange } = useEditProfile(
    userDataServer ? userDataServer : mockUserData
  );

  return (
    <div>
      <Header />
      <div className={styles.container}>
        <AvatarEdit avatarUrl={userData.avatar} onAvatarChange={handleAvatarChange} />

        <div className={styles.formContainer}>
          <EditableField
            label="Фамилия"
            value={userData.lastName}
            onSave={handleFieldSave('lastName')}
          />
          <EditableField
            label="Имя"
            value={userData.firstName}
            onSave={handleFieldSave('firstName')}
          />
          <EditableField
            label="Отчество"
            value={userData.patronymic}
            onSave={handleFieldSave('patronymic')}
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
            value={userData.birthDate}
            onSave={handleFieldSave('birthDate')}
          />
        </div>
      </div>
    </div>
  );
};
