import { Outlet } from 'react-router';

import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
import { MobileBottomNav } from '@/widgets/mobile-bottom-nav';

import styles from './root-layout.module.css';

export function RootLayout() {
  return (
    <div className={styles.root}>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
