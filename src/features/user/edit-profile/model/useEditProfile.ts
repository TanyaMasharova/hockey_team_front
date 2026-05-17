import { useState, useEffect } from 'react';
import { UserData } from '@/entities/User';

export const useEditProfile = (initialData: UserData) => {
  const [userData, setUserData] = useState<UserData>(initialData);

  // 🔥 Добавляем useEffect для обновления данных при изменении initialData
  useEffect(() => {
    console.log('useEditProfile: Updating with new data', initialData);
    setUserData(initialData);
  }, [initialData]); // Следим за изменением initialData

  const handleFieldSave = (field: keyof UserData) => async (value: string) => {
    try {
      const saveValue = field === 'birth_date' && value === '' ? null : value;

      console.log(`Saving ${field}:`, saveValue);

      // TODO: API вызов для сохранения
      // await updateUserProfile({ [field]: saveValue });

      setUserData(prev => ({
        ...prev,
        [field]: saveValue,
      }));
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

      setUserData(prev => ({
        ...prev,
        avatar: newAvatarUrl,
      }));
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw error;
    }
  };

  return {
    userData,
    handleFieldSave,
    handleAvatarChange,
  };
};
