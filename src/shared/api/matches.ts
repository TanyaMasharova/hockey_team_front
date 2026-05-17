import { api } from '@/shared/config/axiosConfig';

export const getFutureMatches = async (limit?: number) => {
  try {
    const response = await api.get(`/matches`, {
      params: { limit, futurePast: 'future' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetchinf matches', error);
    throw error;
  }
};

export const getLastMatches = async (limit?: number) => {
  try {
    const response = await api.get(`/matches`, {
      params: { limit, futurePast: 'past' },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetchinf matches', error);
    throw error;
  }
};

export const getMatchesStats = async () => {
  try {
    const response = await api.get(`/matchesStats`);
    return response.data;
  } catch (error) {
    console.error('Error fetchinf matches stats', error);
    throw error;
  }
};

// shared/api/matches.ts
export const getMatchById = async (id: string) => {
  const response = await fetch(`/api/matches/${id}`);
  return response.json();
};

// shared/api/stadium.ts
export const getStadiumSectors = async () => {
  const response = await fetch('/api/stadium/sectors');
  return response.json();
};

export const getSeatsBySector = async (sectorId: string) => {
  const response = await fetch(`/api/stadium/sectors/${sectorId}/seats`);
  return response.json();
};
