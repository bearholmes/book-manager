import clsx from 'clsx';
import type { ComponentPropsWithRef } from 'react';
import styles from './Input.module.css';

interface ControlAppearance {
  controlSize?: 'regular' | 'compact';
  withLeadingIcon?: boolean;
}

export function Input({
  controlSize = 'regular',
  withLeadingIcon = false,
  className,
  ...props
}: ComponentPropsWithRef<'input'> & ControlAppearance) {
  return (
    <input
      {...props}
      data-size={controlSize}
      data-leading-icon={withLeadingIcon || undefined}
      className={clsx(styles.field, className)}
    />
  );
}
export function Select({
  controlSize = 'regular',
  className,
  ...props
}: ComponentPropsWithRef<'select'> & Pick<ControlAppearance, 'controlSize'>) {
  return <select {...props} data-size={controlSize} className={clsx(styles.field, className)} />;
}
export function Textarea({ className, ...props }: ComponentPropsWithRef<'textarea'>) {
  return <textarea {...props} className={clsx(styles.field, className)} />;
}

export function FieldGroup({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return <div {...props} className={clsx(styles.field, styles.group, className)} />;
}
