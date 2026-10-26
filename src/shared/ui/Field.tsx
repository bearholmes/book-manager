import type { ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  htmlFor: string;
  label: ReactNode;
  description?: string;
  error?: string;
  children: ReactNode;
}

export function Field({ htmlFor, label, description, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {description && (
        <p id={`${htmlFor}-description`} className={styles.description}>
          {description}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
