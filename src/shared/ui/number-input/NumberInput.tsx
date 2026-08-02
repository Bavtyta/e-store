import type { InputProps } from '@/shared/ui/input';
import { Input } from '@/shared/ui/input';

import { classNames } from '@/shared/lib';

import styles from './number-input.module.css';

export type NumberInputProps = Omit<InputProps, 'type'>;

export function NumberInput({ className, inputMode = 'decimal', ...inputProps }: NumberInputProps) {
  return (
    <Input
      className={classNames(styles.input, className)}
      inputMode={inputMode}
      type="number"
      {...inputProps}
    />
  );
}
