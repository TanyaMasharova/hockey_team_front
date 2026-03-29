import { Header } from '@/widgets/Header';
import styles from './main.module.css';
import Image from 'next/image';
import { UpcomingMatches } from '@/widgets/UpcomingMatches';

export const MainPage = () => {
  return (
    <div>
      <Header />
      <Image src="/images/greeting1.png" alt="greeting" width={1920} height={845} />
      <UpcomingMatches />
    </div>
  );
};
