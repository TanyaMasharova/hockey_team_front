'use client';
import { TableMatches } from '@/shared/ui/TableMatches/TableMatches';
import styles from './UpcomingMatches.module.css';
import { getMatches } from '../api/matchesApi';
import { useEffect, useState } from 'react';
import { Match } from '@/entities/Match';
import { useError } from '@/shared/context/ErrorContext';

export const UpcomingMatches = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const { errors, setError, clearError } = useError();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await getMatches();
        setMatches(data);
      } catch (err) {
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className={styles.mainContainer}>
      <h1>Ближайшие матчи</h1>
      <TableMatches matches={matches} />
    </div>
  );
};
