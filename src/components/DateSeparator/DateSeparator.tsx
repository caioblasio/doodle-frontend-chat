import styles from './DateSeparator.module.css'

type DateSeparatorProps = {
  label: string
}

function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className={styles.separator} role="separator" aria-label={label}>
      <span className={styles.line} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
      <span className={styles.line} aria-hidden="true" />
    </div>
  )
}

export default DateSeparator
