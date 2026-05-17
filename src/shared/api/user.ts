import { api } from '../config/axiosConfig';
import { UserData } from '@/entities/User';
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  phone: string;
  email: string;
  password: string;
  full_name: string;
}

export interface RegisterResponse {
  id: number;
  phone: string;
  email: string;
  full_name: string;
  created_at: string;
}

export const getUserById = async (userId: string) => {
  try {
    const response = await api.get(`/user/${userId}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${userId}`, error);
    throw error;
  }
};

// shared/api/user.ts
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login API error:', error);
    throw error; // Важно: пробрасываем ошибку дальше
  }
};
export const register = async (data: RegisterRequest) => {
  try {
    const response = await api.post('/register', data);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const updateUserField = async (userId: string, field: string, value: string) => {
  try {
    const response = await api.patch(`/user/${userId}/profile/field`, {
      field: field,
      value: value,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    throw error;
  }
};

// Обновление нескольких полей профиля
export const updateUserProfile = async (userId: string, data: Partial<UserData>) => {
  try {
    const response = await api.put(`/user/${userId}/profile`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Обновление аватара
export const updateUserAvatar = async (userId: string, avatarUrl: string) => {
  try {
    const response = await api.patch(`/user/${userId}/avatar`, {
      avatar: avatarUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};
