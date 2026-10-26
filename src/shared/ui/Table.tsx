import clsx from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';
import styles from './Table.module.css';

export function Table({
  className,
  dense = false,
  ...props
}: ComponentPropsWithoutRef<'table'> & { dense?: boolean }) {
  return (
    <table {...props} data-dense={dense || undefined} className={clsx(styles.table, className)} />
  );
}
