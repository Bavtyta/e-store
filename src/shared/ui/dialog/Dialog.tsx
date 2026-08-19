import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode, RefObject, SyntheticEvent } from 'react';

import { getFocusableElements } from '@/shared/lib';

import styles from './dialog.module.css';

function showDialog(dialog: HTMLDialogElement): void {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
    return;
  }

  dialog.setAttribute('open', '');
}

function hideDialog(dialog: HTMLDialogElement): void {
  if (typeof dialog.close === 'function' && dialog.open) {
    dialog.close();
    return;
  }

  dialog.removeAttribute('open');
}

export interface DialogProps {
  children: ReactNode;
  closeLabel?: string;
  description?: string;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  mobileFullscreen?: boolean;
  onClose: () => void;
  open: boolean;
  placement?: 'center' | 'top';
  size?: 'medium' | 'wide';
  title: string;
}

export function Dialog({
  children,
  closeLabel = 'Закрыть диалог',
  description,
  footer,
  initialFocusRef,
  mobileFullscreen = false,
  onClose,
  open,
  placement = 'center',
  size = 'medium',
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    const activeElement = document.activeElement;
    openerRef.current = activeElement instanceof HTMLElement ? activeElement : null;

    showDialog(dialog);
    (initialFocusRef?.current ?? closeButtonRef.current)?.focus();

    return () => {
      hideDialog(dialog);
      openerRef.current?.focus();
      openerRef.current = null;
    };
  }, [initialFocusRef, open]);

  if (!open) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const dialog = event.currentTarget;
    const focusableElements = getFocusableElements(dialog);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (firstElement === undefined || lastElement === undefined) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const activeElement = document.activeElement;

    if (event.shiftKey && (activeElement === firstElement || activeElement === dialog)) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>): void {
    event.preventDefault();
    onClose();
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>): void {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <dialog
      aria-describedby={description === undefined ? undefined : descriptionId}
      aria-labelledby={titleId}
      aria-modal="true"
      className={[
        styles.dialog,
        size === 'wide' ? styles.wide : '',
        placement === 'top' ? styles.top : '',
        mobileFullscreen ? styles.mobileFullscreen : '',
      ]
        .join(' ')
        .trim()}
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      ref={dialogRef}
      tabIndex={-1}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.heading}>
            <h2 id={titleId}>{title}</h2>
            {description === undefined ? null : <p id={descriptionId}>{description}</p>}
          </div>
          <button
            aria-label={closeLabel}
            className={styles.close}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className={styles.content}>{children}</div>
        {footer === undefined ? null : <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
