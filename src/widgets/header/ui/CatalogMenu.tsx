import { useEffect, useId, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Link } from 'react-router';

import type { Category } from '@/entities/category';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FittingIcon,
  GasketIcon,
  Grid2x2Icon,
  InnerTubeIcon,
  PackageIcon,
  PipeIcon,
} from '@/shared/ui';

import styles from './catalog-menu.module.css';
import headerStyles from './header.module.css';

interface CategoryMenuDataProps {
  categories: readonly Category[];
  isError: boolean;
  isPending: boolean;
  onNavigate: () => void;
}

interface DesktopCatalogMenuProps extends CategoryMenuDataProps {
  currentPath: string;
  isActive: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface MobileCatalogMenuProps extends CategoryMenuDataProps {
  backButtonRef: RefObject<HTMLButtonElement | null>;
  id: string;
  onBack: () => void;
}

function sortCategories(categories: readonly Category[]): Category[] {
  return [...categories].sort((first, second) => first.sortOrder - second.sortOrder);
}

function getRootCategories(categories: readonly Category[]): Category[] {
  return sortCategories(categories.filter((category) => category.parentId === null));
}

function getChildCategories(categories: readonly Category[], parentId: string): Category[] {
  return sortCategories(categories.filter((category) => category.parentId === parentId));
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case 'truby':
      return PipeIcon;
    case 'fitingi-i-soedineniya':
      return FittingIcon;
    case 'rezinotehnicheskie-izdeliya':
      return GasketIcon;
    case 'kamery':
      return InnerTubeIcon;
    case 'soputstvuyushchie-tovary':
      return PackageIcon;
    default:
      return Grid2x2Icon;
  }
}

function CategoryDataState({
  isError,
  isPending,
}: Pick<CategoryMenuDataProps, 'isError' | 'isPending'>) {
  if (isPending)
    return (
      <p className={styles.state} role="status">
        Загружаем категории…
      </p>
    );
  if (isError)
    return (
      <p className={styles.state} role="alert">
        Не удалось загрузить категории. Откройте весь каталог.
      </p>
    );
  return null;
}

function AllCatalogLink({ onNavigate }: Pick<CategoryMenuDataProps, 'onNavigate'>) {
  return (
    <Link className={styles.allCatalogLink} onClick={onNavigate} to="/catalog">
      <Grid2x2Icon size={16} />
      <span>Смотреть весь каталог</span>
      <ArrowRightIcon size={16} />
    </Link>
  );
}

export function DesktopCatalogMenu({
  categories,
  currentPath,
  isActive,
  isError,
  isOpen,
  isPending,
  onNavigate,
  onOpenChange,
}: DesktopCatalogMenuProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const categoryHoverTimerRef = useRef<number | null>(null);
  const categoryLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const categoryContentRef = useRef<HTMLElement>(null);
  const openedByHoverRef = useRef(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const rootCategories = getRootCategories(categories);
  const selectedCategory =
    rootCategories.find(({ id }) => id === selectedCategoryId) ?? rootCategories[0];
  const selectedChildren =
    selectedCategory === undefined ? [] : getChildCategories(categories, selectedCategory.id);

  function cancelClose(): void {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function cancelCategoryHover(): void {
    if (categoryHoverTimerRef.current === null) return;
    window.clearTimeout(categoryHoverTimerRef.current);
    categoryHoverTimerRef.current = null;
  }

  function selectCategoryFromPointer(categoryId: string): void {
    cancelCategoryHover();
    categoryHoverTimerRef.current = window.setTimeout(() => {
      setSelectedCategoryId(categoryId);
      categoryHoverTimerRef.current = null;
    }, 100);
  }

  function scheduleClose(): void {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      onOpenChange(false);
      closeTimerRef.current = null;
    }, 180);
  }

  function openFromPointer(event: React.PointerEvent<HTMLElement>): void {
    if (event.pointerType !== 'mouse') return;
    cancelClose();
    if (!isOpen) {
      openedByHoverRef.current = true;
      onOpenChange(true);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent): void {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target))
        onOpenChange(false);
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      onOpenChange(false);
      triggerRef.current?.focus();
    }
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      if (categoryHoverTimerRef.current !== null)
        window.clearTimeout(categoryHoverTimerRef.current);
    },
    [],
  );

  function handleCategoryKeyDown(
    event: React.KeyboardEvent<HTMLAnchorElement>,
    categoryId: string,
    categoryIndex: number,
  ): void {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowDown') nextIndex = (categoryIndex + 1) % rootCategories.length;
    if (event.key === 'ArrowUp')
      nextIndex = (categoryIndex - 1 + rootCategories.length) % rootCategories.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = rootCategories.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      categoryLinkRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key !== 'ArrowRight') return;
    event.preventDefault();
    setSelectedCategoryId(categoryId);
    window.requestAnimationFrame(() => {
      categoryContentRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    });
  }

  return (
    <div className={styles.desktopRoot} ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={[
          headerStyles.navLink,
          styles.trigger,
          isActive ? styles.triggerActive : '',
          isOpen ? styles.triggerOpen : '',
        ]
          .join(' ')
          .trim()}
        onClick={() => {
          cancelClose();
          if (isOpen && openedByHoverRef.current) {
            openedByHoverRef.current = false;
            return;
          }
          openedByHoverRef.current = false;
          onOpenChange(!isOpen);
        }}
        onPointerEnter={openFromPointer}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') scheduleClose();
        }}
        ref={triggerRef}
        type="button"
      >
        <Grid2x2Icon size={18} />
        <span>Каталог</span>
      </button>

      <div
        aria-hidden="true"
        className={styles.backdrop}
        hidden={!isOpen}
        onClick={() => {
          onOpenChange(false);
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') scheduleClose();
        }}
      />
      <div
        className={styles.megaPanel}
        hidden={!isOpen}
        id={panelId}
        onPointerEnter={(event) => {
          cancelCategoryHover();
          openFromPointer(event);
        }}
        onPointerLeave={(event) => {
          cancelCategoryHover();
          if (event.pointerType === 'mouse') scheduleClose();
        }}
      >
        <div className={styles.megaHeading}>
          <h2>Каталог товаров</h2>
        </div>
        <nav aria-label="Каталог товаров" className={styles.catalogExplorer}>
          {selectedCategory !== undefined ? (
            <>
              <ul aria-label="Основные категории" className={styles.rootCategoryList}>
                {rootCategories.map((category, categoryIndex) => {
                  const isSelected = category.id === selectedCategory.id;
                  const CategoryIcon = getCategoryIcon(category.slug);
                  return (
                    <li key={category.id}>
                      <Link
                        aria-current={currentPath === category.path ? 'page' : undefined}
                        className={isSelected ? styles.rootCategoryActive : undefined}
                        onClick={onNavigate}
                        onFocus={() => {
                          cancelCategoryHover();
                          setSelectedCategoryId(category.id);
                        }}
                        onKeyDown={(event) => {
                          handleCategoryKeyDown(event, category.id, categoryIndex);
                        }}
                        onPointerLeave={cancelCategoryHover}
                        onPointerEnter={(event) => {
                          if (event.pointerType === 'mouse') selectCategoryFromPointer(category.id);
                        }}
                        ref={(element) => {
                          categoryLinkRefs.current[categoryIndex] = element;
                        }}
                        to={category.path}
                      >
                        <CategoryIcon size={18} />
                        <span>{category.name}</span>
                        <ArrowRightIcon size={16} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <section
                aria-labelledby={`${panelId}-selected`}
                className={styles.categoryContent}
                ref={categoryContentRef}
              >
                <div className={styles.categoryContentHeading}>
                  <h3 id={`${panelId}-selected`}>{selectedCategory.name}</h3>
                  <Link onClick={onNavigate} to={selectedCategory.path}>
                    Все товары: {selectedCategory.name}
                    <ArrowRightIcon size={16} />
                  </Link>
                </div>
                {selectedChildren.length > 0 ? (
                  <ul className={styles.childList}>
                    {selectedChildren.map((child) => (
                      <li key={child.id}>
                        <Link onClick={onNavigate} to={child.path}>
                          <span>{child.name}</span>
                          <ArrowRightIcon size={16} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.categoryEmpty}>
                    В этом разделе пока нет отдельных подкатегорий.
                  </p>
                )}
                <AllCatalogLink onNavigate={onNavigate} />
              </section>
            </>
          ) : (
            <div className={styles.catalogFallback}>
              <CategoryDataState isError={isError} isPending={isPending} />
              {!isPending && !isError ? (
                <p className={styles.state}>Категории временно недоступны.</p>
              ) : null}
              <AllCatalogLink onNavigate={onNavigate} />
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

export function MobileCatalogMenu({
  backButtonRef,
  categories,
  id,
  isError,
  isPending,
  onBack,
  onNavigate,
}: MobileCatalogMenuProps) {
  const rootCategories = getRootCategories(categories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const selectedCategory = rootCategories.find(
    ({ id: categoryId }) => categoryId === selectedCategoryId,
  );
  const children =
    selectedCategory === undefined ? [] : getChildCategories(categories, selectedCategory.id);

  useEffect(() => {
    if (selectedCategory === undefined) return;

    function handleEscape(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedCategoryId(null);
      window.setTimeout(() => {
        backButtonRef.current?.focus();
      }, 0);
    }

    window.addEventListener('keydown', handleEscape, true);
    return () => {
      window.removeEventListener('keydown', handleEscape, true);
    };
  }, [backButtonRef, selectedCategory]);

  return (
    <div className={styles.mobileCatalog} id={id}>
      <div className={styles.mobileCatalogHeader}>
        <button
          onClick={() => {
            if (selectedCategory !== undefined) setSelectedCategoryId(null);
            else onBack();
          }}
          ref={backButtonRef}
          type="button"
        >
          <ArrowLeftIcon size={20} />
          <span>Назад</span>
        </button>
        <strong>{selectedCategory?.name ?? 'Каталог'}</strong>
      </div>
      <nav aria-label="Каталог товаров" className={styles.mobileCatalogNav}>
        {selectedCategory === undefined ? (
          <>
            <Link className={styles.mobileAllCatalog} onClick={onNavigate} to="/catalog">
              <Grid2x2Icon size={20} />
              <span>Смотреть весь каталог</span>
              <ArrowRightIcon size={16} />
            </Link>
            <CategoryDataState isError={isError} isPending={isPending} />
            <ul className={styles.mobileRootList}>
              {rootCategories.map((category) => {
                const categoryChildren = getChildCategories(categories, category.id);
                const CategoryIcon = getCategoryIcon(category.slug);
                return (
                  <li key={category.id}>
                    {categoryChildren.length > 0 ? (
                      <button
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                        }}
                        type="button"
                      >
                        <CategoryIcon size={20} />
                        <span>{category.name}</span>
                        <ArrowRightIcon size={16} />
                      </button>
                    ) : (
                      <Link onClick={onNavigate} to={category.path}>
                        <CategoryIcon size={20} />
                        <span>{category.name}</span>
                        <ArrowRightIcon size={16} />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className={styles.mobileCategoryContent}>
            <Link
              className={styles.mobileSectionLink}
              onClick={onNavigate}
              to={selectedCategory.path}
            >
              <span>Все товары раздела</span>
              <ArrowRightIcon size={16} />
            </Link>
            <ul className={styles.mobileChildList}>
              {children.map((child) => (
                <li key={child.id}>
                  <Link onClick={onNavigate} to={child.path}>
                    <span>{child.name}</span>
                    <ArrowRightIcon size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
}
