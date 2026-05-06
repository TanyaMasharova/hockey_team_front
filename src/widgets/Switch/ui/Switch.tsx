import { useState } from 'react';
import styles from './Switch.module.css';

interface SwitchProps {
  activeTab: 'schedule' | 'past';
  setActiveTab: (tab: 'schedule' | 'past') => void;
}

export const Switch = ({ activeTab, setActiveTab }: SwitchProps) => {
  const handleTabChange = (tab: 'schedule' | 'past') => {
    setActiveTab(tab);
    // onChange?.(tab);
  };

  return (
    <div className={styles.switch}>
      <button
        className={`${styles.tab} ${activeTab === 'schedule' ? styles.active : ''}`}
        onClick={() => handleTabChange('schedule')}
      >
        Расписание
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'past' ? styles.active : ''}`}
        onClick={() => handleTabChange('past')}
      >
        Прошедшие матчи
      </button>
    </div>
  );
};
