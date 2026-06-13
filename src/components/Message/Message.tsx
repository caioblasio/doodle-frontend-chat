import { memo } from 'react'
import { decodeHtmlEntities } from '../../utils/html'
import styles from './Message.module.css'

type MessageProps = {
  text: string
  author?: string
  timestamp: string
  dateTime: string
  isOwn: boolean
}

function Message({ text, author, timestamp, dateTime, isOwn }: MessageProps) {
  const variantClass = isOwn ? styles.own : styles.other
  const decodedText = decodeHtmlEntities(text)
  const decodedAuthor = author ? decodeHtmlEntities(author) : undefined
  const ariaLabel = isOwn
    ? `You said: ${decodedText}, ${timestamp}`
    : `${decodedAuthor} said: ${decodedText}, ${timestamp}`

  return (
    <article
      className={[styles.message, variantClass].join(' ')}
      aria-label={ariaLabel}
    >
      <div className={styles.bubble}>
        {!isOwn && decodedAuthor && (
          <p className={styles.author}>{decodedAuthor}</p>
        )}
        <p className={styles.text}>{decodedText}</p>
        <time className={styles.timestamp} dateTime={dateTime}>
          {timestamp}
        </time>
      </div>
    </article>
  )
}

export default memo(Message)
