import styles from './Spinner.module.css'

type SpinnerProps = {
  size?: 'small' | 'medium'
  variant?: 'default' | 'light'
  className?: string
  label?: string
}

function Spinner({
  size = 'medium',
  variant = 'default',
  className,
  label = 'Loading',
}: SpinnerProps) {
  return (
    <div
      className={[
        styles.spinner,
        styles[size],
        styles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-label={label}
    />
  )
}

export default Spinner
