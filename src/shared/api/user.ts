import { api } from '../config/axiosConfig';
export const getUserById = async (userId: string) => {
  try {
    const response = await api.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${userId}`, error);
    throw error;
  }
};
