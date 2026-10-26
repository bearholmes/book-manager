import clsx from 'clsx';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'inline' | 'sm' | 'md' | 'lg';
  className?: string;
}
const sizes = { inline: styles.inline, sm: styles.small, md: undefined, lg: styles.large };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <output
      data-size={size}
      className={clsx(styles.spinner, sizes[size], className)}
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </output>
  );
}
