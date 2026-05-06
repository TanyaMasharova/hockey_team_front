import { useState } from 'react';
import { UserData } from '@/entities/User';

export const useEditProfile = (initialData: UserData) => {
  const [userData, setUserData] = useState<UserData>(initialData);

  const handleFieldSave = (field: keyof UserData) => (value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    // TODO: запрос в БД
    console.log(`Сохранено поле ${field}:`, value);
  };

  const handleAvatarChange = (avatarUrl: string) => {
    setUserData(prev => ({ ...prev, avatar: avatarUrl }));
    console.log('Сохранён аватар:', avatarUrl);
  };

  return {
    userData,
    handleFieldSave,
    handleAvatarChange,
  };
};
