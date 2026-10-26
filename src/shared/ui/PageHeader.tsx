import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  meta?: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, meta, subtitle, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.row}>
        <div className={styles.title}>
          <h1>{title}</h1>
          {meta && <span className={styles.meta}>{meta}</span>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
