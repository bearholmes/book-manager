import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import styles from './Surface.module.css';

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section';
  tone?: 'card' | 'muted';
}
export function Surface({ as: Element = 'div', tone = 'card', className, ...props }: SurfaceProps) {
  return <Element {...props} data-tone={tone} className={clsx(styles.surface, className)} />;
}
