import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

import type { ButtonSize, ButtonVariant } from './Button';
import { getButtonClassName } from './buttonStyles';

export interface ButtonLinkProps extends LinkProps {
  isFullWidth?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export function ButtonLink({
  className,
  isFullWidth = false,
  size = 'medium',
  variant = 'primary',
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClassName({
        className,
        isFullWidth,
        isLoading: false,
        size,
        variant,
      })}
      {...linkProps}
    />
  );
}
