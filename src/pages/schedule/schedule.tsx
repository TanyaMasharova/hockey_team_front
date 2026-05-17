'use client';
import { Header } from '@/widgets/Header';
import styles from './schedule.module.css';
import { UpcomingMatches } from '@/widgets/UpcomingMatches';
import { TableMatches } from '@/shared/ui/TableMatches/TableMatches';
import { getFutureMatches, getLastMatches, getMatchesStats } from '@/shared/api/matches';
import { useEffect, useState } from 'react';
import { MatchFuture, MatchLast, MatchStats } from '@/entities/Match';
import { useError } from '@/shared/context/ErrorContext';
import { Switch } from '@/widgets/Switch';
import { TableLastMatches } from '@/widgets/TableLastMatches/ui/TableLastMatches';
import { MatchStatsChart } from '@/widgets/MatchStats/MatchStats';

import { FutureMatchesChart } from '@/widgets/ScheduleStats/ScheduleStats';

export const SchedulePage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [matches, setMatches] = useState<MatchFuture[]>([]);
  const [lastMatches, setLastMatches] = useState<MatchLast[]>([]);
  const { errors, setError, clearError } = useError();
  const [activeTab, setActiveTab] = useState<'schedule' | 'past'>('schedule');

  const [stats, setStats] = useState<MatchStats>();

  useEffect(() => {
    const fetchMatchStats = async () => {
      try {
        const data = await getMatchesStats();
        setStats(data);
      } catch (error) {
        setError('Failed to load matches stats');
      }
    };
    fetchMatchStats();
  }, []);
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await getFutureMatches();
        setMatches(data);
      } catch (err) {
        setError('Failed to load future matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data = await getLastMatches();

        setLastMatches(data);
      } catch (err) {
        setError('Failed to load last matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <>
      <Header />
      <div className={styles.mainContainer}>
        {/* <h1>Расписание</h1> */}
        <Switch activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'schedule' ? (
          <>
            {matches && matches.length > 0 && (
              <>
                <h3>Распределение матчей</h3>
                <FutureMatchesChart matches={matches} />
              </>
            )}
            <TableMatches matches={matches} />
          </>
        ) : (
          <>
            {stats && (
              <div style={{ marginTop: '2rem', minHeight: 400, width: '100%' }}>
                <MatchStatsChart stats={stats} />
              </div>
            )}
            <TableLastMatches matches={lastMatches} />
            {/*вот тут нужна круговая диаграмма выигранных и проигранных матсей. так же  */}
            {console.log(stats)}
          </>
        )}
      </div>
    </>
  );
};
