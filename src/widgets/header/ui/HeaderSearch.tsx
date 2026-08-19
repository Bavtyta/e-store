import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';

import { CatalogSearchOverlay } from './CatalogSearchOverlay';
import styles from './header.module.css';

function isCatalogPath(pathname: string): boolean {
  return pathname === '/catalog' || pathname.startsWith('/catalog/');
}

export function HeaderSearch() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [geometry, setGeometry] = useState({ backdropTop: 0, left: 0, top: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const activeQuery = isCatalogPath(location.pathname) ? (searchParams.get('search') ?? '') : '';

  function updateOverlayTop(): void {
    const root = rootRef.current;
    const header = root?.closest('header');
    const rootBounds = root?.getBoundingClientRect();
    setGeometry({
      backdropTop: header?.getBoundingClientRect().bottom ?? 0,
      left: rootBounds?.left ?? 0,
      top: rootBounds?.bottom ?? 0,
    });
  }

  function openSearch(): void {
    updateOverlayTop();
    setIsOpen(true);
  }

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('resize', updateOverlayTop);
    return () => {
      window.removeEventListener('resize', updateOverlayTop);
    };
  }, [isOpen]);

  return (
    <div className={styles.searchRoot} ref={rootRef}>
      <CatalogSearchOverlay
        initialQuery={activeQuery}
        key={activeQuery}
        backdropTop={geometry.backdropTop}
        leftOffset={geometry.left}
        onClose={() => {
          setIsOpen(false);
        }}
        onOpen={openSearch}
        open={isOpen}
        topOffset={geometry.top}
      />
    </div>
  );
}
