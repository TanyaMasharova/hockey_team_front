import styles from './Header.module.css';
import Image from 'next/image';
import Link from 'next/link';

interface LinkHeader {
  name: string;
  href: string;
}

const links: LinkHeader[] = [
  { name: 'Купить билет', href: '/buyTicket' },
  {
    name: 'Расписание игр',
    href: '/timetable',
  },
];

export const Header = () => {
  return (
    <div className={styles.mainContainer}>
      <Link href="/">
        <Image src="/icons/logo.svg" alt="D" width={90} height={90} />
      </Link>

      <div className={styles.linksContainer}>
        {links.map((link, index) => (
          <Link href={link.href} key={index}>
            <p>{link.name}</p>
          </Link>
        ))}
        <Link href="/user">
          {' '}
          {/*тут наверное надо добавлять уникальный хэш пользователя? */}
          <Image src="/icons/user.svg" alt="" width={50} height={50} />
        </Link>
      </div>
    </div>
  );
};
