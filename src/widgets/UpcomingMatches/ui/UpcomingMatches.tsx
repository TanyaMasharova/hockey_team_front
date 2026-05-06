'use client';
import { TableMatches } from '@/shared/ui/TableMatches/TableMatches';
import styles from './UpcomingMatches.module.css';
import { getFutureMatches } from '@/shared/api/matches';
import { useEffect, useState } from 'react';
import { MatchFuture } from '@/entities/Match';
import { useError } from '@/shared/context/ErrorContext';
import { Button } from '@/shared/ui/Button/Button';

interface UpcomingMatchesProps {
  limit?: number;
}

export const UpcomingMatches = ({ limit }: UpcomingMatchesProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [matches, setMatches] = useState<MatchFuture[]>([]);
  const { errors, setError, clearError } = useError();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await getFutureMatches(limit);
        setMatches(data);
      } catch (err) {
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleClick = () => {
    window.location.href = '/schedule';
  };

  return (
    <div className={styles.mainContainer}>
      <h1>Ближайшие матчи</h1>
      <TableMatches matches={matches} />
      <Button onClick={handleClick}>Открыть полное расписание</Button>
    </div>
  );
};
