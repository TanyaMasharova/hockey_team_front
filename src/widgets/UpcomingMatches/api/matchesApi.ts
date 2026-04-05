import { api } from '@/shared/config/axiosConfig';

export const getMatches = async () => {
  try {
    const response = await api.get('/matches');
    return response.data;
  } catch (error) {
    console.error('Error fetchinf matches', error);
    throw error;
  }
};
