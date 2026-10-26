import clsx from 'clsx';
import type { ComponentPropsWithRef } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'regular' | 'compact' | 'icon';
}

export function Button({
  variant = 'primary',
  size = 'regular',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      data-variant={variant}
      data-size={size}
      className={clsx(styles.button, className)}
    />
  );
}
