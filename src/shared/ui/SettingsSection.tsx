import clsx from 'clsx';
import { type ReactNode, useId } from 'react';
import styles from './SettingsSection.module.css';

interface SettingsSectionProps {
  title: string;
  description: string;
  meta?: ReactNode;
  danger?: boolean;
  children: ReactNode;
}

export function SettingsSection({
  title,
  description,
  meta,
  danger,
  children,
}: SettingsSectionProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <div className={styles.introduction}>
        <h2 id={headingId} className={clsx(styles.title, danger && styles.danger)}>
          {title}
        </h2>
        <p>{description}</p>
        {meta && <span className={styles.meta}>{meta}</span>}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
