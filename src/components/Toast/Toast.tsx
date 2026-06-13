import Button from '../Button/Button'
import styles from './Toast.module.css'

type ToastProps = {
  message: string
  onDismiss: () => void
  actionLabel?: string
  onAction?: () => void
}

function Toast({ message, onDismiss, actionLabel, onAction }: ToastProps) {
  return (
    <div className={styles.toast} role="alert">
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        {actionLabel && onAction && (
          <Button
            type="button"
            className={styles.actionButton}
            onClick={onAction}
            aria-label={actionLabel}
          >
            {actionLabel}
          </Button>
        )}
        <Button
          type="button"
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </Button>
      </div>
    </div>
  )
}

export default Toast
