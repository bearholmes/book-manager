import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  meta?: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  tools?: ReactNode;
}

export function PageHeader({ title, meta, subtitle, actions, tools }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.row} data-with-tools={tools ? true : undefined}>
        <div className={styles.introduction}>
          <div className={styles.title}>
            <h1>{title}</h1>
            {meta && <span className={styles.meta}>{meta}</span>}
          </div>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {tools && <div className={styles.tools}>{tools}</div>}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
