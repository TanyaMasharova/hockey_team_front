'use client'; //////
import { Header } from '@/widgets/Header';
import styles from './main.module.css';
import Image from 'next/image';
import { UpcomingMatches } from '@/widgets/UpcomingMatches';
import { Button } from '@/shared/ui/Button/Button';

export const MainPage = () => {
  return (
    <div className={styles.mainContainer}>
      <Header />
      <Image src="/images/greeting1.png" alt="greeting" width={1920} height={845} />
      {/* <div className={styles.sectionMatches}> */}

      <UpcomingMatches limit={5} />

      {/* </div> */}
    </div>
  );
};
