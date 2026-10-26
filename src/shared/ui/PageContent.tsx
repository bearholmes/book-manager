import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './PageContent.module.css';

export function PageContent({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={clsx(styles.content, className)} />;
}
