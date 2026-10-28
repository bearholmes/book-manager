import clsx from 'clsx';
import { type ReactNode, useId } from 'react';
import styles from './SettingsSection.module.css';

interface SettingsSectionProps {
  title: string;
  description?: string;
  meta?: ReactNode;
  danger?: boolean;
  children: ReactNode;
  content?: ReactNode;
}

export function SettingsSection({
  title,
  description,
  meta,
  danger,
  children,
  content,
}: SettingsSectionProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <div className={styles.introduction}>
        <h2 id={headingId} className={clsx(styles.title, danger && styles.danger)}>
          {title}
        </h2>
        {description && <p>{description}</p>}
        {meta && <span className={styles.meta}>{meta}</span>}
      </div>
      <div className={styles.body}>{children}</div>
      {content && <div className={styles.content}>{content}</div>}
    </section>
  );
}
